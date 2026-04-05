import { NextRequest, NextResponse } from 'next/server';
import { paystackRequest } from '@/lib/paystack';

export const dynamic = 'force-dynamic';

interface FinalizeRequest {
  transferCode: string;
  otp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FinalizeRequest = await request.json();
    const { transferCode, otp } = body;

    if (!transferCode || !otp) {
      return NextResponse.json({ error: 'Transfer code and OTP are required.' }, { status: 400 });
    }

    const response = await paystackRequest<{ status: string; reference: string }>('/transfer/finalize_transfer', {
      method: 'POST',
      body: JSON.stringify({
        transfer_code: transferCode,
        otp,
      }),
    });

    return NextResponse.json({
      success: true,
      status: response.data.status,
      reference: response.data.reference,
      message: 'Withdrawal OTP confirmed successfully.',
    });
  } catch (error: any) {
    console.error('Finalize withdrawal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to finalize withdrawal.' },
      { status: 500 },
    );
  }
}
