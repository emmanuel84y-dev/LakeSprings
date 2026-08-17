import { NextResponse } from 'next/server';
import { verifyWebhookSignature, verifyFlutterwaveTransaction, markPaymentSuccessful } from '@/lib/payments-flutterwave';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('flutterwave-signature');
  const legacyHash = req.headers.get('verif-hash');

  try {
    if (!verifyWebhookSignature(body, signature, legacyHash)) return new NextResponse('Invalid signature', { status: 401 });
    const event = JSON.parse(body);
    const data = event?.data;
    const txRef = data?.tx_ref;
    const transactionId = data?.id;

    if (txRef && transactionId) {
      const verified = await verifyFlutterwaveTransaction(String(transactionId), String(txRef));
      if (verified.status === 'successful') await markPaymentSuccessful(String(txRef), Number(verified.amount));
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error('Flutterwave webhook error:', e);
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}
