import type { Metadata } from 'next';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FlutterwaveButton } from '@/components/booking/FlutterwaveButton';
import { verifyFlutterwaveTransaction, markPaymentSuccessful } from '@/lib/payments-flutterwave';

export const metadata: Metadata = { title: 'Confirm Your Reservation' };

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SearchParams = {
  ref?: string;
  transaction_id?: string;
  tx_ref?: string;
  status?: string;
};

type BookingConfirmation = {
  booking_reference: string;
  guest_name: string;
  guest_email: string;
  room_name: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  adults: number;
  children: number;
  total_amount: number;
  status: string;
};

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const reference = searchParams.ref?.trim();

  if (!reference) {
    return <BookingLookupError message="No booking reference was provided in the confirmation link." />;
  }

  if (searchParams.transaction_id && searchParams.tx_ref && searchParams.status === 'successful') {
    try {
      const verified = await verifyFlutterwaveTransaction(
        searchParams.transaction_id,
        searchParams.tx_ref
      );
      await markPaymentSuccessful(searchParams.tx_ref, Number(verified.amount));
    } catch (error) {
      console.error('Flutterwave return verification failed:', error);
    }
  }

  const booking = await getBookingConfirmation(reference);

  if (!booking) {
    return (
      <BookingLookupError
        message="We could not find a reservation with this reference. Please check the reference and try again."
        reference={reference}
      />
    );
  }

  const isPending = booking.status === 'pending';

  return (
    <div className="container-lake max-w-xl py-16 text-center md:py-24">
      <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
      <h1 className="mt-6 font-display text-3xl text-ink md:text-4xl">
        {isPending ? 'Your reservation is confirmed!' : 'Your reservation is confirmed'}
      </h1>
      <p className="mt-3 text-ink/60">
        Your room has been reserved successfully. To complete your reservation, proceed to secure checkout below.
        We&apos;ve also sent the booking details to <strong>{booking.guest_email}</strong>.
      </p>

      <div className="mt-8 rounded-xl border border-sand bg-white p-6 text-left">
        <div className="flex items-center justify-between border-b border-sand pb-4">
          <span className="text-sm text-ink/50">Booking reference</span>
          <span className="font-display text-lg tracking-wide text-brass">{booking.booking_reference}</span>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Room" value={booking.room_name} />
          <Row label="Guest" value={booking.guest_name} />
          <Row label="Check-in" value={formatDate(booking.check_in_date)} />
          <Row label="Check-out" value={formatDate(booking.check_out_date)} />
          <Row label="Nights" value={String(booking.nights)} />
          <Row
            label="Guests"
            value={`${booking.adults} adult${booking.adults > 1 ? 's' : ''}${booking.children > 0 ? `, ${booking.children} children` : ''}`}
          />
          <Row label="Total" value={formatCurrency(booking.total_amount)} bold />
        </dl>
      </div>

      {isPending ? (
        <>
          <p className="mt-6 text-sm font-medium text-ink">
            Ready to complete your reservation?
          </p>
          <FlutterwaveButton reference={booking.booking_reference} email={booking.guest_email} />
        </>
      ) : (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          This reservation has already been paid and confirmed.
        </div>
      )}

      <div className="mt-8 flex justify-center gap-3">
        <Button href="/" variant="outline">Back to Home</Button>
        <Button href="/rooms">Browse More Rooms</Button>
      </div>
    </div>
  );
}

async function getBookingConfirmation(reference: string): Promise<BookingConfirmation | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_booking_by_reference', {
      p_reference: reference,
    });

    if (!error && data?.[0]) {
      return data[0] as BookingConfirmation;
    }

    if (error) {
      console.error('Booking RPC lookup failed; trying trusted server lookup:', error);
    }
  } catch (error) {
    console.error('Booking RPC lookup threw; trying trusted server lookup:', error);
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('bookings')
      .select(`
        booking_reference,
        guest_name,
        guest_email,
        check_in_date,
        check_out_date,
        nights,
        adults,
        children,
        total_amount,
        status,
        rooms!inner(name)
      `)
      .eq('booking_reference', reference)
      .maybeSingle();

    if (error) {
      console.error('Trusted booking lookup failed:', error);
      return null;
    }

    if (!data) return null;

    const room = Array.isArray(data.rooms) ? data.rooms[0] : data.rooms;

    return {
      booking_reference: data.booking_reference,
      guest_name: data.guest_name,
      guest_email: data.guest_email,
      room_name: room?.name ?? 'LakeSprings Hotel Room',
      check_in_date: data.check_in_date,
      check_out_date: data.check_out_date,
      nights: data.nights,
      adults: data.adults,
      children: data.children,
      total_amount: Number(data.total_amount),
      status: data.status,
    };
  } catch (error) {
    console.error('Trusted booking lookup threw:', error);
    return null;
  }
}

function BookingLookupError({ message, reference }: { message: string; reference?: string }) {
  return (
    <div className="container-lake max-w-xl py-16 text-center md:py-24">
      <AlertCircle className="mx-auto h-14 w-14 text-brass" />
      <h1 className="mt-6 font-display text-3xl text-ink md:text-4xl">Booking confirmation</h1>
      <p className="mt-3 text-ink/60">{message}</p>
      {reference && (
        <p className="mt-4 rounded-lg border border-sand bg-white px-4 py-3 font-mono text-sm text-ink">
          Reference: {reference}
        </p>
      )}
      <div className="mt-8 flex justify-center gap-3">
        <Button href="/" variant="outline">Back to Home</Button>
        <Button href="/booking">Try Booking Again</Button>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink/50">{label}</dt>
      <dd className={bold ? 'font-semibold text-ink' : 'text-ink'}>{value}</dd>
    </div>
  );
}
