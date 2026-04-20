export async function PATCH(req: Request) {
  // Update investment status (maturity/withdrawal)
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing investment id' }, { status: 400 });
  const investment = await prisma.userInvestment.update({
    where: { id },
    data: updates,
  });
  return NextResponse.json(investment);
}
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  // Fetch all investments for the authenticated user (placeholder: userId from query)
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  const investments = await prisma.userInvestment.findMany({
    where: { userId },
    orderBy: { startDate: 'desc' },
  });
  return NextResponse.json(investments);
}

export async function POST(req: Request) {
  // Create a new investment (purchase)
  const data = await req.json();
  // ...validation omitted for brevity
  const investment = await prisma.userInvestment.create({ data });
  return NextResponse.json(investment);
}
