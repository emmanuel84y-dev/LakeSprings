import { formatCurrency, formatDate } from '@/lib/utils';

type BookingEmailData = {
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
  status?: string;
};

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM = 'LakeSprings Hotels <reservations@lakespringshotels.com.ng>';

function getApiKey() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not configured');
  return key;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function bookingHtml(booking: BookingEmailData, paid: boolean) {
  const status = paid ? 'Payment confirmed' : 'Reservation received';
  const statusText = paid
    ? 'Your payment has been successfully verified and your reservation is confirmed.'
    : 'We have received your reservation request. Please complete payment if it is still pending.';

  return `<!doctype html>
<html><body style="margin:0;background:#f7f5ef;font-family:Arial,sans-serif;color:#18352b;">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
    <div style="background:#123d32;padding:28px 24px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:#EFBF04;">LakeSprings Hotels</div>
      <div style="margin-top:6px;color:#fff;opacity:.85;font-size:13px;">Comfort. Elegance. Hospitality.</div>
    </div>
    <div style="background:#fff;padding:32px 24px;">
      <h1 style="margin:0 0 10px;font-size:26px;">${status}</h1>
      <p style="margin:0 0 24px;line-height:1.6;color:#52645d;">Dear ${escapeHtml(booking.guest_name)}, ${statusText}</p>
      <div style="border:1px solid #e7dfcf;border-radius:10px;padding:20px;">
        <div style="display:flex;justify-content:space-between;border-bottom:1px solid #e7dfcf;padding-bottom:14px;">
          <span style="color:#777;font-size:13px;">Booking reference</span>
          <strong style="color:#b28a00;letter-spacing:1px;">${escapeHtml(booking.booking_reference)}</strong>
        </div>
        <table style="width:100%;margin-top:14px;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:7px 0;color:#777;">Room</td><td style="padding:7px 0;text-align:right;">${escapeHtml(booking.room_name)}</td></tr>
          <tr><td style="padding:7px 0;color:#777;">Check-in</td><td style="padding:7px 0;text-align:right;">${formatDate(booking.check_in_date)}</td></tr>
          <tr><td style="padding:7px 0;color:#777;">Check-out</td><td style="padding:7px 0;text-align:right;">${formatDate(booking.check_out_date)}</td></tr>
          <tr><td style="padding:7px 0;color:#777;">Nights</td><td style="padding:7px 0;text-align:right;">${booking.nights}</td></tr>
          <tr><td style="padding:7px 0;color:#777;">Guests</td><td style="padding:7px 0;text-align:right;">${booking.adults} adult${booking.adults === 1 ? '' : 's'}${booking.children ? `, ${booking.children} children` : ''}</td></tr>
          <tr><td style="padding:12px 0 0;color:#777;border-top:1px solid #e7dfcf;">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:700;border-top:1px solid #e7dfcf;">${formatCurrency(booking.total_amount)}</td></tr>
        </table>
      </div>
      <p style="margin:24px 0 0;line-height:1.6;color:#52645d;font-size:14px;">Keep your booking reference for your records. If you need assistance, please contact LakeSprings Hotels.</p>
      <p style="margin:20px 0 0;text-align:center;"><a href="https://lakespringshotels.com.ng/" style="display:inline-block;background:#EFBF04;color:#17382f;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:700;">Visit LakeSprings Hotels</a></p>
    </div>
    <div style="padding:18px;text-align:center;color:#7a817d;font-size:12px;">© LakeSprings Hotels · lakespringshotels.com.ng</div>
  </div>
</body></html>`;
}

async function sendEmail(to: string, subject: string, html: string, idempotencyKey: string) {
  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    cache: 'no-store',
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.message || 'Resend email delivery failed');
  return result;
}

export async function sendBookingConfirmationEmail(booking: BookingEmailData) {
  return sendEmail(
    booking.guest_email,
    `Booking confirmation — ${booking.booking_reference}`,
    bookingHtml(booking, false),
    `booking-confirmation/${booking.booking_reference}`
  );
}

export async function sendPaymentConfirmationEmail(booking: BookingEmailData) {
  return sendEmail(
    booking.guest_email,
    `Payment confirmed — ${booking.booking_reference}`,
    bookingHtml(booking, true),
    `payment-confirmation/${booking.booking_reference}`
  );
}
