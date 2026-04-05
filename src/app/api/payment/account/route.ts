import { NextRequest, NextResponse } from 'next/server';
import { getPaystackLedgerForEmail } from '@/lib/account-ledger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'User email is required.' }, { status: 400 });
    }

    const ledger = await getPaystackLedgerForEmail(email);
    return NextResponse.json(ledger);
  } catch (error: any) {
    console.error('Account ledger error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch account ledger.' },
      { status: 500 },
    );
  }
}
