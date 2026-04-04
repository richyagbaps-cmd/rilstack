import { NextRequest, NextResponse } from 'next/server';

interface VerificationRequest {
  reference: string;
}

/**
 * Verify Paystack payment
 * Called after user completes payment on Paystack
 */
export async function POST(request: NextRequest) {
  try {
    const body: VerificationRequest = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: 'Transaction reference required' },
        { status: 400 }
      );
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 503 }
      );
    }

    // Verify with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const data = await response.json();

    if (!data.data) {
      return NextResponse.json(
        { error: 'Invalid transaction reference' },
        { status: 404 }
      );
    }

    const transaction = data.data;

    // Check if payment was successful
    if (transaction.status !== 'success') {
      return NextResponse.json({
        success: false,
        status: transaction.status,
        message: 'Payment was not completed',
      });
    }

    // Payment successful
    return NextResponse.json({
      success: true,
      transactionRef: transaction.reference,
      amount: transaction.amount / 100, // Convert from kobo to Naira
      customer: {
        email: transaction.customer.email,
        phone: transaction.customer.phone,
      },
      paidAt: transaction.paid_at,
      message: 'Payment verified successfully',
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
