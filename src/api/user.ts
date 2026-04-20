import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  // Example: fetch all users (for admin/testing only)
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      phone: true,
      createdAt: true,
      isActive: true,
    },
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  // Example: create user (registration logic should go here)
  const data = await req.json();
  // ...validation and hashing omitted for brevity
  const user = await prisma.user.create({
    data: {
      email: data.email,
      phone: data.phone,
      passwordHash: data.passwordHash,
      pinHash: data.pinHash,
      kycData: data.kycData,
    },
  });
  return NextResponse.json(user);
}
