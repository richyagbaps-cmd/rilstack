import { NextRequest, NextResponse } from "next/server";
import {
  getSavingsGoalsByUser,
  insertRow,
  updateRow,
  logTransaction,
  TABLES,
  type STSavingsGoal,
  nairaToKobo,
} from "@/lib/seatable";
import { randomUUID } from "crypto";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const goals = await getSavingsGoalsByUser(userId);
    return NextResponse.json(goals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, rowId, goalId, name, targetAmount, dueDate, amount, safeLock } = body;

    // Create new goal
    if (action === "create" || !action) {
      if (!userId || !name || !targetAmount) {
        return NextResponse.json({ error: "userId, name and targetAmount required" }, { status: 400 });
      }
      const goal: Omit<STSavingsGoal, "_id"> = {
        Goal_ID: `sg_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
        User_ID: userId,
        Name: name,
        Target_Amount: nairaToKobo(targetAmount),
        Current_Amount: 0,
        Due_Date: dueDate,
        Type: "personal",
        Safe_Locks: "[]",
        Interest_Accrued_Total: 0,
        Last_Interest_Date: new Date().toISOString().slice(0, 10),
      };
      const row = await insertRow(TABLES.SAVINGS_GOALS, goal as Record<string, unknown>);
      return NextResponse.json(row, { status: 201 });
    }

    // Deposit into goal
    if (action === "deposit") {
      if (!rowId || !amount) return NextResponse.json({ error: "rowId and amount required" }, { status: 400 });
      const amtKobo = nairaToKobo(amount);
      await updateRow(TABLES.SAVINGS_GOALS, rowId, { Current_Amount: { "$add": amtKobo } });
      await logTransaction({
        Transaction_ID: `txn_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
        User_ID: userId,
        Type: "savings_deposit",
        Amount: amtKobo,
        Net_Effect: amtKobo,
        Balance_After: 0,
        Category_Or_Goal: name,
        Reference_ID: goalId,
      });
      return NextResponse.json({ success: true });
    }

    // Withdraw from goal
    if (action === "withdraw") {
      if (!rowId || !amount) return NextResponse.json({ error: "rowId and amount required" }, { status: 400 });
      const amtKobo = nairaToKobo(amount);
      await updateRow(TABLES.SAVINGS_GOALS, rowId, { Current_Amount: { "$subtract": amtKobo } });
      await logTransaction({
        Transaction_ID: `txn_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
        User_ID: userId,
        Type: "savings_withdrawal",
        Amount: amtKobo,
        Net_Effect: -amtKobo,
        Balance_After: 0,
        Category_Or_Goal: name,
        Reference_ID: goalId,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
