import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { user_id, product_id, amount } = await request.json();

    const result = await prisma.$transaction(async (tx: any) => {
      // Lock product row for update (works in PostgreSQL/MySQL)
      const product = await tx.product.findUnique({
        where: { id: product_id },
        // lock: { mode: 'ForUpdate' }, // Uncomment for PostgreSQL/MySQL
      });
      if (!product || !product.active) {
        throw new Error('Product not found or inactive');
      }
      if (amount < product.min_investment) {
        throw new Error(`Minimum investment is ₦${product.min_investment}`);
      }
      if (amount > product.available_for_purchase) {
        throw new Error('INSUFFICIENT_SUPPLY');
      }

      // Lock user row for update (works in PostgreSQL/MySQL)
      const user = await tx.user.findUnique({
        where: { id: user_id },
        // lock: { mode: 'ForUpdate' },
      });
      if (!user || !user.kyc_verified || !user.active) {
        throw new Error('User not KYC verified or inactive');
      }
      if (amount > user.wallet_balance) {
        throw new Error('Insufficient wallet balance');
      }

      // Deduct available supply and soft debit wallet
      await tx.product.update({
        where: { id: product_id },
        data: { available_for_purchase: { decrement: amount } },
      });
      await tx.user.update({
        where: { id: user_id },
        data: { wallet_balance: { decrement: amount } },
      });

      // Create investment order
      const order = await tx.investmentOrder.create({
        data: {
          userId: user_id,
          productId: product_id,
          amount,
          status: 'pending_execution',
        },
      });

      return order;
    });

    return NextResponse.json({ message: 'Order reserved', order: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Reservation failed' }, { status: 400 });
  }
}
