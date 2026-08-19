import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPaymentConfirmationEmail } from '@/lib/email';

const FLW_API = 'https://api.flutterwave.com/v3';

function getConfig() {
  const secretKey = process.env.FLW_SECRET_KEY;
  const secretHash = process.env.FLW_SECRET_HASH;
  if (!secretKey) throw new Error('Payments are not configured yet. Add FLW_SECRET_KEY to the server environment.');
  return { secretKey, secretHash };
}

export function verifyWebhookSignature(body: string, signature: string | null, legacyHash: string | null) {
  const { secretHash } = getConfig();
  if (!secretHash) return false;
  if (legacyHash) {
    const expected = Buffer.from(secretHash);
    const received = Buffer.from(legacyHash);
    if (expected.length === received.length && crypto.timingSafeEqual(expected, received)) return true;
  }
  if (!signature) return false;
  const digest = crypto.createHmac('sha256', secretHash).update(body).digest('base64');
  return digest.length === signature.length && crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function verifyFlutterwaveTransaction(transactionId: string, expectedReference: string) {
  const { secretKey } = getConfig();
  const response = await fetch(`${FLW_API}/transactions/${encodeURIComponent(transactionId)}/verify`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  const json = await response.json();
  if (!response.ok || json.status !== 'success' || !json.data) {
    throw new Error(json.message || 'Flutterwave transaction verification failed');
  }

  const data = json.data;
  if (data.status !== 'successful') throw new Error('Flutterwave payment was not successful');
  if (String(data.tx_ref) !== String(expectedReference)) throw new Error('Payment reference does not match this booking');
  if (String(data.currency || '').toUpperCase() !== 'NGN') throw new Error('Unexpected payment currency');
  return data;
}

export async function markPaymentSuccessful(transactionReference: string, verifiedAmount: number) {
  const admin = createAdminClient();
  const { data: payment, error } = await admin
    .from('payments')
    .select('id, booking_id, amount, status')
    .eq('transaction_reference', transactionReference)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!payment) return false;
  if (Number(verifiedAmount) < Number(payment.amount)) throw new Error('Verified payment amount is insufficient');
  if (payment.status === 'successful') return true;

  const { error: paymentError } = await admin
    .from('payments')
    .update({ status: 'successful', payment_date: new Date().toISOString() })
    .eq('id', payment.id);
  if (paymentError) throw new Error(paymentError.message);

  const { data: booking, error: bookingFetchError } = await admin
    .from('bookings')
    .select('id, booking_reference, room_id, guest_name, guest_email, adults, children, check_in_date, check_out_date, nights, total_amount')
    .eq('id', payment.booking_id)
    .maybeSingle();
  if (bookingFetchError) throw new Error(bookingFetchError.message);

  const { error: bookingError } = await admin
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', payment.booking_id)
    .eq('status', 'pending');
  if (bookingError) throw new Error(bookingError.message);

  if (booking) {
    try {
      const { data: room } = await admin
        .from('rooms')
        .select('name')
        .eq('id', booking.room_id)
        .maybeSingle();

      await sendPaymentConfirmationEmail({
        ...booking,
        room_name: room?.name ?? 'LakeSprings Hotels room',
      });
    } catch (emailError) {
      // Payment/booking state must remain successful even if email delivery is temporarily unavailable.
      console.error('Payment confirmation email failed:', emailError);
    }
  }

  return true;
}
