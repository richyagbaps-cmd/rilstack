import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  // Fetch all budgets for the authenticated user (placeholder: userId from query)
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  const budgets = await prisma.budget.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(budgets);
}

export async function POST(req: Request) {
  // Create a new budget
  const data = await req.json();
  // ...validation omitted for brevity
  const budget = await prisma.budget.create({ data });
  return NextResponse.json(budget);
}
