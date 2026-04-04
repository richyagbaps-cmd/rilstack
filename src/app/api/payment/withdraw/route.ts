import { NextRequest, NextResponse } from 'next/server';

interface WithdrawalRequest {
  amount: number;
  accountNumber: string;
  bankCode: string;
  recipientName: string;
  narration?: string;
}

/**
 * Process withdrawal using Paystack Transfers
 * Transfers funds to user's bank account
 */
export async function POST(request: NextRequest) {
  try {
    const body: WithdrawalRequest = await request.json();
    const { amount, accountNumber, bankCode, recipientName, narration } = body;

    // Validate input
    if (!amount || amount < 5000) {
      return NextResponse.json(
        { error: 'Minimum withdrawal amount is ₦5,000' },
        { status: 400 }
      );
    }

    if (!accountNumber || !bankCode || !recipientName) {
      return NextResponse.json(
        { error: 'Bank details are required' },
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

    try {
      // Verify bank account details first (optional but recommended)
      const verifyResponse = await fetch(
        `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
          },
        }
      );

      if (!verifyResponse.ok) {
        return NextResponse.json(
          { error: 'Invalid bank account details' },
          { status: 400 }
        );
      }

      const accountData = await verifyResponse.json();

      // Create transfer recipient
      const recipientResponse = await fetch(
        'https://api.paystack.co/transferrecipient',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'nuban',
            name: recipientName,
            account_number: accountNumber,
            bank_code: bankCode,
            currency: 'NGN',
          }),
        }
      );

      if (!recipientResponse.ok) {
        throw new Error('Failed to create transfer recipient');
      }

      const recipient = await recipientResponse.json();

      // Initiate transfer
      const transferResponse = await fetch(
        'https://api.paystack.co/transfer',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source: 'balance',
            amount: amount * 100, // Convert to kobo
            recipient: recipient.data.recipient_code,
            reason: narration || 'RILSTACK Withdrawal',
            reference: `WTH_${Date.now()}`,
          }),
        }
      );

      if (!transferResponse.ok) {
        const error = await transferResponse.json();
        throw new Error(error.message || 'Transfer failed');
      }

      const transfer = await transferResponse.json();

      return NextResponse.json({
        success: true,
        transactionId: transfer.data.reference,
        amount,
        account: {
          number: accountNumber,
          name: accountData.data.account_name,
        },
        status: transfer.data.status, // 'otp', 'pending', 'completed', 'cancelled', 'reversed'
        message: 'Withdrawal initiated. Funds will be transferred to your account.',
      });
    } catch (error: any) {
      console.error('Paystack withdrawal error:', error);
      return NextResponse.json(
        { error: error.message || 'Withdrawal processing failed' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { error: error.message || 'Withdrawal processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Get list of Nigerian banks for withdrawal
 */
export async function GET(request: NextRequest) {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 503 }
      );
    }

    const response = await fetch('https://api.paystack.co/bank', {
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch banks');
    }

    const data = await response.json();

    return NextResponse.json({
      banks: data.data.map((bank: any) => ({
        code: bank.code,
        name: bank.name,
      })),
    });
  } catch (error: any) {
    console.error('Bank fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch banks' },
      { status: 500 }
    );
  }
}
