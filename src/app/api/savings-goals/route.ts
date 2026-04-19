// API route for savings goals

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const mockGoals = [
      {
        id: "1",
        name: "Emergency Fund",
        targetAmount: 20000,
        currentAmount: 0,
      },
      { id: "2", name: "Vacation", targetAmount: 5000, currentAmount: 0 },
    ];

    return NextResponse.json(mockGoals);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch savings goals" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    return NextResponse.json(
      { message: "Savings goal created successfully" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create savings goal" },
      { status: 500 },
    );
  }
}
