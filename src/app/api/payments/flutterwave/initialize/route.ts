import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { bookingReference, email } = await req.json();
    if (!bookingReference || !email) {
      return NextResponse.json({ error: 'Booking reference and email are required' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let booking: any = null;

    // Normal public lookup first.
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('get_booking_by_reference', {
        p_reference: bookingReference,
      });

      if (!error && data?.[0]) {
        booking = data[0];
      } else if (error) {
        console.error('Booking RPC verification failed; trying trusted server lookup:', error);
      }
    } catch (error) {
      console.error('Booking RPC verification threw; trying trusted server lookup:', error);
    }

    // Trusted server fallback. This mirrors the confirmation page's fallback
    // and prevents a stale/missing RPC from blocking a legitimate payment.
    if (!booking) {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from('bookings')
        .select('booking_reference, guest_name, guest_email, guest_phone, total_amount, status')
        .eq('booking_reference', bookingReference)
        .maybeSingle();

      if (error) {
        console.error('Trusted booking verification failed:', error);
        return NextResponse.json({ error: 'Booking could not be verified' }, { status: 400 });
      }

      booking = data;
    }

    if (!booking?.guest_email || String(booking.guest_email).trim().toLowerCase() !== normalizedEmail) {
      return NextResponse.json({ error: 'Booking could not be verified' }, { status: 400 });
    }

    if (booking.status !== 'pending') {
      return NextResponse.json({ error: 'This booking is no longer awaiting payment.' }, { status: 400 });
    }

    const secret = process.env.FLW_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: 'Payments are not configured yet. Add FLW_SECRET_KEY to the server environment.' }, { status: 503 });
    }

    const supabase = createClient();
    const { data: payment, error: paymentError } = await supabase.rpc('create_payment_for_booking', {
      p_booking_reference: bookingReference,
      p_guest_email: normalizedEmail,
      p_amount: booking.total_amount,
      p_provider: 'flutterwave',
    });

    if (paymentError || !payment) {
      return NextResponse.json({ error: paymentError?.message || 'Could not create payment' }, { status: 400 });
    }

    const txRef = String(payment.id);
    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin}/booking/success?ref=${encodeURIComponent(bookingReference)}`;

    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: Number(booking.total_amount),
        currency: 'NGN',
        redirect_url: callbackUrl,
        customer: {
          email: booking.guest_email,
          name: booking.guest_name,
          phonenumber: booking.guest_phone || undefined,
        },
        customizations: {
          title: 'LakeSprings Hotels',
          description: `Payment for booking ${bookingReference}`,
        },
        meta: { booking_reference: bookingReference, payment_id: payment.id },
      }),
    });

    const json = await response.json();
    if (!response.ok || json.status !== 'success' || !json.data?.link) {
      return NextResponse.json({ error: json.message || 'Flutterwave initialization failed' }, { status: 502 });
    }

    const admin = createAdminClient();
    const { error: updateError } = await admin
      .from('payments')
      .update({ transaction_reference: txRef })
      .eq('id', payment.id);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    return NextResponse.json({ payment_url: json.data.link, reference: txRef });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Payment initialization failed' }, { status: 500 });
  }
}
