import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  // Fetch all savings goals for the authenticated user (placeholder: userId from query)
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  const goals = await prisma.savingsGoal.findMany({
    where: { userId },
    // No createdAt field in SavingsGoal, so no orderBy
  });
  return NextResponse.json(goals);
}

export async function POST(req: Request) {
  // Create a new savings goal
  const data = await req.json();
  // ...validation omitted for brevity
  const goal = await prisma.savingsGoal.create({ data });
  return NextResponse.json(goal);
}
