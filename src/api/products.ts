import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Fetch all investment products
export async function GET() {
  const products = await prisma.investmentProduct.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(products);
}

// PATCH: Update product (admin)
export async function PATCH(req: Request) {
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
  const product = await prisma.investmentProduct.update({
    where: { id },
    data: updates,
  });
  return NextResponse.json(product);
}
