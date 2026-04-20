import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch all users (admin)
export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      phone: true,
      kycData: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLogin: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ users });
}

// PATCH: Update user (admin)
export async function PATCH(req: Request) {
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  const user = await prisma.user.update({
    where: { id },
    data: updates,
  });
  return NextResponse.json(user);
}
