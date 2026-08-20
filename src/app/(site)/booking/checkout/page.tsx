import type { Metadata } from 'next';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { Button } from '@/components/ui/Button';
import { BackLink } from '@/components/layout/BackLink';
import { FlutterwaveButton } from '@/components/booking/FlutterwaveButton';
import { formatCurrency, formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Complete Your Reservation' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Booking = {
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

export default async function BookingCheckoutPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const reference = searchParams.ref?.trim();

  if (!reference) {
    return <CheckoutError message="No booking reference was provided." />;
  }

  const booking = await getBooking(reference);

  if (!booking) {
    return <CheckoutError message="We could not find this reservation. Please check your booking reference and try again." reference={reference} />;
  }

  if (booking.status !== 'pending') {
    return (
      <main className="container-lake max-w-xl py-16 text-center md:py-24">
        <BackLink href="/booking" className="mb-8" />
        <ShieldCheck className="mx-auto h-14 w-14 text-emerald-600" />
        <h1 className="mt-6 font-display text-3xl text-ink md:text-4xl">Reservation already processed</h1>
        <p className="mt-3 text-ink/60">
          This reservation is no longer awaiting payment. If you have already paid, your confirmation email contains your reservation details.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href={`/booking/success?ref=${encodeURIComponent(reference)}`}>View Reservation</Button>
          <Button href="/" variant="outline">Back to Home</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container-lake max-w-xl py-12 md:py-20">
      <BackLink href="/booking" className="mb-8" />
      <div className="text-center">
        <ShieldCheck className="mx-auto h-14 w-14 text-brass" />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-brass">Reservation request received</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">Complete Your Reservation</h1>
        <p className="mx-auto mt-3 max-w-lg text-ink/60">
          Your room is currently being held while you complete payment. Your reservation will be confirmed after Flutterwave successfully verifies your payment.
        </p>
      </div>

      <section className="mt-8 rounded-xl border border-sand bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-sand pb-4">
          <span className="text-sm text-ink/50">Booking reference</span>
          <span className="font-display text-lg tracking-wide text-brass">{booking.booking_reference}</span>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <Row label="Guest" value={booking.guest_name} />
          <Row label="Room" value={booking.room_name} />
          <Row label="Check-in" value={formatDate(booking.check_in_date)} />
          <Row label="Check-out" value={formatDate(booking.check_out_date)} />
          <Row label="Nights" value={String(booking.nights)} />
          <Row label="Guests" value={`${booking.adults} adult${booking.adults === 1 ? '' : 's'}${booking.children ? `, ${booking.children} children` : ''}`} />
          <Row label="Total" value={formatCurrency(booking.total_amount)} bold />
        </dl>

        <div className="mt-6 rounded-lg bg-cream p-4 text-sm text-ink/65">
          <strong className="text-ink">Secure checkout:</strong> You will be redirected to Flutterwave to complete your payment securely. LakeSprings only treats the reservation as confirmed after payment verification succeeds.
        </div>

        <FlutterwaveButton reference={booking.booking_reference} email={booking.guest_email} />
      </section>

      <p className="mt-5 text-center text-xs text-ink/45">A payment receipt and confirmed reservation email will be sent after successful payment.</p>
    </main>
  );
}

async function getBooking(reference: string): Promise<Booking | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('bookings')
      .select(`booking_reference, guest_name, guest_email, check_in_date, check_out_date, nights, adults, children, total_amount, status, rooms!inner(name)`)
      .eq('booking_reference', reference)
      .maybeSingle();

    if (error || !data) return null;
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
    console.error('Checkout booking lookup failed:', error);
    return null;
  }
}

function CheckoutError({ message, reference }: { message: string; reference?: string }) {
  return (
    <main className="container-lake max-w-xl py-16 text-center md:py-24">
      <BackLink href="/booking" className="mb-8" />
      <AlertCircle className="mx-auto h-14 w-14 text-brass" />
      <h1 className="mt-6 font-display text-3xl text-ink md:text-4xl">Reservation checkout</h1>
      <p className="mt-3 text-ink/60">{message}</p>
      {reference && <p className="mt-4 rounded-lg border border-sand bg-white px-4 py-3 font-mono text-sm">Reference: {reference}</p>}
      <div className="mt-8 flex justify-center gap-3">
        <Button href="/" variant="outline">Back to Home</Button>
        <Button href="/booking">Book a Room</Button>
      </div>
    </main>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-6">
      <dt className="text-ink/50">{label}</dt>
      <dd className={bold ? 'font-semibold text-ink text-right' : 'text-ink text-right'}>{value}</dd>
    </div>
  );
}
