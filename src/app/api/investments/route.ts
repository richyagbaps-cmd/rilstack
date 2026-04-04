// API route for investment portfolio

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const mockInvestments = [
      { id: '1', symbol: 'AAPL', name: 'Apple Inc.', shares: 10, currentPrice: 185, totalValue: 1850 },
      { id: '2', symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 5, currentPrice: 3150, totalValue: 15750 },
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
