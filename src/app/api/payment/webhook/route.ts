import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json({ error: 'Payment service not configured.' }, { status: 503 });
  }

  const signature = request.headers.get('x-paystack-signature');
  const rawBody = await request.text();
  const expectedSignature = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');

  if (!signature || signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid Paystack signature.' }, { status: 401 });
  }

  return NextResponse.json({ received: true });
}
