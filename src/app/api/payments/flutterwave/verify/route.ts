import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyFlutterwaveTransaction, markPaymentSuccessful } from '@/lib/payments-flutterwave';

export async function POST(req: Request) {
  try {
    const { transactionId, reference } = await req.json();
    if (!transactionId || !reference) return NextResponse.json({ error: 'Transaction ID and reference are required' }, { status: 400 });

    const admin = createAdminClient();
    const { data: payment, error } = await admin.from('payments').select('id, booking_id, amount, transaction_reference').eq('transaction_reference', reference).maybeSingle();
    if (error || !payment) return NextResponse.json({ error: 'Payment could not be found' }, { status: 404 });

    const data = await verifyFlutterwaveTransaction(String(transactionId), String(reference));
    if (Number(data.amount) < Number(payment.amount)) return NextResponse.json({ error: 'Verified payment amount is insufficient' }, { status: 400 });

    await markPaymentSuccessful(String(reference), Number(data.amount));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Payment verification failed' }, { status: 400 });
  }
}
