import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FlutterwaveButton } from '@/components/booking/FlutterwaveButton';
import { verifyFlutterwaveTransaction, markPaymentSuccessful } from '@/lib/payments-flutterwave';

export const metadata: Metadata = { title: 'Booking Confirmed' };

// This page depends on the booking reference in the query string and on
// live Supabase data. Explicitly keep it dynamic so Vercel never serves a
// stale/static result for a booking confirmation URL.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SearchParams = {
  ref?: string;
  transaction_id?: string;
  tx_ref?: string;
  status?: string;
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

  // Flutterwave redirects back with transaction_id/tx_ref. Verify server-side
  // before displaying the booking as paid; the webhook provides a second path.
  if (searchParams.transaction_id && searchParams.tx_ref && searchParams.status === 'successful') {
    try {
      const verified = await verifyFlutterwaveTransaction(
        searchParams.transaction_id,
        searchParams.tx_ref
      );
      await markPaymentSuccessful(searchParams.tx_ref, Number(verified.amount));
    } catch {
      // Keep the booking pending if verification fails. The webhook can still
      // confirm it after Flutterwave retries delivery.
    }
  }

  const supabase = createClient();

  // Public confirmation lookup by exact reference only. The RPC is
  // SECURITY DEFINER and intentionally exposes no direct bookings SELECT.
  const { data, error } = await supabase.rpc('get_booking_by_reference', {
    p_reference: reference,
  });

  if (error) {
    console.error('Booking confirmation lookup failed:', error);
    return (
      <BookingLookupError
        message="We could not retrieve your reservation details right now. Your reservation may still have been created successfully. Please keep your booking reference and try again shortly."
        reference={reference}
      />
    );
  }

  const booking = data?.[0];

  // Do not call notFound() here. A database/RPC mismatch should not turn a
  // valid confirmation URL into a misleading Next.js 404 page.
  if (!booking) {
    return (
      <BookingLookupError
        message="We could not find a reservation with this reference. Please check the reference and try again."
        reference={reference}
      />
    );
  }

  return (
    <div className="container-lake max-w-xl py-16 text-center md:py-24">
      <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
      <h1 className="mt-6 font-display text-3xl text-ink md:text-4xl">Reservation received</h1>
      <p className="mt-3 text-ink/60">
        We&apos;ve sent a confirmation to <strong>{booking.guest_email}</strong>. Your reservation is{' '}
        <strong>{booking.status}</strong> pending final confirmation from our team.
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

      {booking.status === 'pending' && (
        <FlutterwaveButton reference={booking.booking_reference} email={booking.guest_email} />
      )}

      <div className="mt-8 flex justify-center gap-3">
        <Button href="/" variant="outline">Back to Home</Button>
        <Button href="/rooms">Browse More Rooms</Button>
      </div>
    </div>
  );
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
