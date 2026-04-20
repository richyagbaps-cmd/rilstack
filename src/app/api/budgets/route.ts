import { NextRequest, NextResponse } from "next/server";
import {
  getBudgetsByUser,
  getActiveBudget,
  insertRow,
  updateRow,
  TABLES,
  type STBudget,
} from "@/lib/seatable";
import { randomUUID } from "crypto";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const active = searchParams.get("active");
    const budgets = active
      ? [await getActiveBudget(userId)].filter(Boolean)
      : await getBudgetsByUser(userId);

    return NextResponse.json(budgets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch budgets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId, type, budgetStyle, startDate, endDate,
      totalIncome, categories, spendingWindow,
    } = body;

    if (!userId || !type || !totalIncome) {
      return NextResponse.json({ error: "userId, type and totalIncome required" }, { status: 400 });
    }

    const totalAllocated = Array.isArray(categories)
      ? categories.reduce((s: number, c: { allocated: number }) => s + (c.allocated || 0), 0)
      : totalIncome;

    const budget: Omit<STBudget, "_id"> = {
      Budget_ID: `bud_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      User_ID: userId,
      Type: type,
      Budget_Style: budgetStyle || "50_30_20",
      Start_Date: startDate || new Date().toISOString().slice(0, 10),
      End_Date: endDate || "",
      Total_Income: totalIncome,
      Total_Allocated: totalAllocated,
      Total_Spent: 0,
      Status: "active",
      Categories: JSON.stringify(categories || []),
      Spending_Window: spendingWindow,
    };

    const row = await insertRow(TABLES.BUDGETS, budget as Record<string, unknown>);
    return NextResponse.json(row, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create budget" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { rowId, updates } = body;
    if (!rowId) return NextResponse.json({ error: "rowId required" }, { status: 400 });
    await updateRow(TABLES.BUDGETS, rowId, updates);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update budget" }, { status: 500 });
  }
}
