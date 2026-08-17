import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FlutterwaveButton } from '@/components/booking/FlutterwaveButton';
import { verifyFlutterwaveTransaction, markPaymentSuccessful } from '@/lib/payments-flutterwave';

export const metadata: Metadata = { title: 'Booking Confirmed' };

export default async function BookingSuccessPage({ searchParams }: { searchParams: { ref?: string; transaction_id?: string; tx_ref?: string; status?: string } }) {
  if (!searchParams.ref) notFound();

  const supabase = createClient();

  // Flutterwave redirects back with transaction_id/tx_ref. Verify server-side
  // before displaying the booking as paid; the webhook provides a second path.
  if (searchParams.transaction_id && searchParams.tx_ref && searchParams.status === 'successful') {
    try {
      const verified = await verifyFlutterwaveTransaction(searchParams.transaction_id, searchParams.tx_ref);
      await markPaymentSuccessful(searchParams.tx_ref, Number(verified.amount));
    } catch {
      // Keep the booking pending if verification fails. The webhook can still
      // confirm it after Flutterwave retries delivery.
    }
  }
  // Public confirmation lookup by reference only — bookings has no
  // public SELECT policy (see 0005_rls.sql), so this intentionally
  // goes through a narrow RPC rather than a direct table read.
  const { data } = await supabase.rpc('get_booking_by_reference', {
    p_reference: searchParams.ref,
  });
  const booking = data?.[0];

  if (!booking) notFound();

  return (
    <div className="container-lake max-w-xl py-16 text-center md:py-24">
      <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
      <h1 className="mt-6 font-display text-3xl text-ink md:text-4xl">Reservation received</h1>
      <p className="mt-3 text-ink/60">
        We&apos;ve sent a confirmation to <strong>{booking.guest_email}</strong>. Your reservation is <strong>{booking.status}</strong> pending final confirmation from our team.
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
          <Row label="Guests" value={`${booking.adults} adult${booking.adults > 1 ? 's' : ''}${booking.children > 0 ? `, ${booking.children} children` : ''}`} />
          <Row label="Total" value={formatCurrency(booking.total_amount)} bold />
        </dl>
      </div>

      {booking.status === 'pending' && <FlutterwaveButton reference={booking.booking_reference} email={booking.guest_email} />}

      <div className="mt-8 flex justify-center gap-3">
        <Button href="/" variant="outline">Back to Home</Button>
        <Button href="/rooms">Browse More Rooms</Button>
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
