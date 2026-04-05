// API route for investment portfolio

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const mockInvestments = [
      { id: '1', symbol: 'TBILL', name: 'Treasury Bills', shares: 0, currentPrice: 0, totalValue: 0 },
      { id: '2', symbol: 'BOND', name: 'Government Bonds', shares: 0, currentPrice: 0, totalValue: 0 },
      { id: '3', symbol: 'MUTUAL', name: 'Mutual Funds', shares: 0, currentPrice: 0, totalValue: 0 },
    ];

    return NextResponse.json(mockInvestments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch investments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    return NextResponse.json({ message: 'Investment added successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add investment' }, { status: 500 });
  }
}
