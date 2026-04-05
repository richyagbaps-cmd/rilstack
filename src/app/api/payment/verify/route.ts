import { NextRequest, NextResponse } from 'next/server';
import { paystackRequest } from '@/lib/paystack';

export const dynamic = 'force-dynamic';

interface VerificationRequest {
  reference: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerificationRequest = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json({ error: 'Transaction reference required.' }, { status: 400 });
    }

    const data = await paystackRequest<any>(`/transaction/verify/${reference}`, { method: 'GET' });

    if (!data.data) {
      return NextResponse.json({ error: 'Invalid transaction reference.' }, { status: 404 });
    }

    const transaction = data.data;

    if (transaction.status !== 'success') {
      return NextResponse.json({
        success: false,
        status: transaction.status,
        message: 'Payment was not completed.',
      });
    }

    return NextResponse.json({
      success: true,
      transactionRef: transaction.reference,
      amount: transaction.amount / 100,
      channel: transaction.channel,
      metadata: transaction.metadata,
      customer: {
        email: transaction.customer?.email,
        phone: transaction.customer?.phone,
      },
      paidAt: transaction.paid_at,
      message: 'Payment verified successfully.',
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed.' },
      { status: 500 },
    );
  }
}
