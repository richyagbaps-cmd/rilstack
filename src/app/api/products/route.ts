// API route for managing products and available investment amounts
import { NextResponse } from 'next/server';

// In-memory mock data for products
let products = [
  {
    id: 'tbill-91',
    name: '91-day T-bill',
    available_for_purchase: 500000000, // ₦500,000,000
    sold: 0,
    type: 'tbill',
  },
  {
    id: 'bond-2030',
    name: 'FG Bond 2030',
    available_for_purchase: 1000000000, // ₦1,000,000,000
    sold: 0,
    type: 'bond',
  },
  {
    id: 'mf-equity',
    name: 'Equity Mutual Fund',
    available_for_purchase: 1000000, // 1,000,000 units
    sold: 0,
    type: 'mutual-fund',
  },
];

export async function GET() {
  return NextResponse.json(products);
}

export async function PATCH(request: Request) {
  try {
    const { id, available_for_purchase } = await request.json();
    const product = products.find((p) => p.id === id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    if (available_for_purchase < product.sold) {
      return NextResponse.json({ error: 'Cannot set available below already sold quantity' }, { status: 400 });
    }
    product.available_for_purchase = available_for_purchase;
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
