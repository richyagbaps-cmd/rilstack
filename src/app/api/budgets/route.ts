// Example API route for getting budgets
// This demonstrates the structure for backend integration

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // This would connect to your database
    // const budgets = await db.budget.findMany();
    
    const mockBudgets = [
      { id: '1', category: 'Housing', limit: 8500, spent: 8200 },
      { id: '2', category: 'Food', limit: 4500, spent: 4200 },
    ];

    return NextResponse.json(mockBudgets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate and save to database
    // const newBudget = await db.budget.create(body);

    return NextResponse.json({ message: 'Budget created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}
