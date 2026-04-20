import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH: Update user settings/profile
export async function PATCH(req: Request) {
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  const user = await prisma.user.update({
    where: { id },
    data: updates,
  });
  return NextResponse.json(user);
}
