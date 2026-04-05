import { NextRequest, NextResponse } from 'next/server';

const OPAY_API_URL = 'https://payapi.opayweb.com/api/v2';
const OPAY_MERCHANT_ID = process.env.OPAY_MERCHANT_ID;
const OPAY_API_KEY = process.env.OPAY_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, preferredBank } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!PAYSTACK_SECRET_KEY && !OPAY_API_KEY) {
      return NextResponse.json({ error: 'No payment API configured' }, { status: 500 });
    }

    // Generate unique reference
    const refId = `OPAY_${Date.now()}_${Math.random().toString(36).substring(7)}`.toUpperCase();

    const opayResponse = await fetch(`${OPAY_API_URL}/third/depositcode/generateStaticDepositCode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        opayMerchantId: OPAY_MERCHANT_ID,
        name,
        refId,
        email: email || undefined,
        phone: phone || undefined,
        accountType: 'Merchant',
        sendPassWordFlag: 'N',
      }),
    });

    const result = await opayResponse.json();

    if (!opayResponse.ok) {
      return NextResponse.json({
        error: result.message || 'Failed to create digital wallet',
        details: result
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      wallet: {
        refId: result.refId,
        accountNumber: result.accountNumber,
        bankName: result.bankName || 'OPay',
        merchantId: result.merchantId,
      },
      message: 'Digital wallet created successfully',
    });
  } catch (error: any) {
    console.error('OPay wallet creation error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to create digital wallet'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    supported_banks: [
      { code: 'opay', name: 'OPay' },
      { code: 'wema-bank', name: 'Wema Bank' },
      { code: 'access-bank', name: 'Access Bank' },
      { code: 'sterling-bank', name: 'Sterling Bank' },
    ],
    message: 'OPay digital wallet API ready',
  });
}

// Use Paystack as fallback for variable names
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;