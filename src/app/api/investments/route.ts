import { NextRequest, NextResponse } from "next/server";
import {
  getInvestmentsByUser,
  insertRow,
  updateRow,
  logTransaction,
  TABLES,
  type STInvestment,
  nairaToKobo,
} from "@/lib/seatable";
import { randomUUID } from "crypto";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const investments = await getInvestmentsByUser(userId);
    return NextResponse.json(investments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch investments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId, productId, units, amountInvested,
      expectedReturnTotal, startDate, expectedEndDate, status,
    } = body;

    if (!userId || !productId || !units || !amountInvested) {
      return NextResponse.json({ error: "userId, productId, units and amountInvested required" }, { status: 400 });
    }

    const inv: Omit<STInvestment, "_id"> = {
      Investment_ID: `inv_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      User_ID: userId,
      Product_ID: productId,
      Units: units,
      Amount_Invested: nairaToKobo(amountInvested),
      Expected_Return_Total: nairaToKobo(expectedReturnTotal || amountInvested),
      Start_Date: startDate || new Date().toISOString().slice(0, 10),
      Expected_End_Date: expectedEndDate || "",
      Status: status || "active",
      Accrued_Interest: 0,
      Penalty_Amount: 0,
    };

    const row = await insertRow(TABLES.INVESTMENTS, inv as Record<string, unknown>);

    await logTransaction({
      Transaction_ID: `txn_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      User_ID: userId,
      Type: "investment_purchase",
      Amount: inv.Amount_Invested,
      Net_Effect: -inv.Amount_Invested,
      Balance_After: 0,
      Reference_ID: inv.Investment_ID,
    });

    return NextResponse.json(row, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add investment" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { rowId, updates } = await request.json();
    if (!rowId) return NextResponse.json({ error: "rowId required" }, { status: 400 });
    await updateRow(TABLES.INVESTMENTS, rowId, updates);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update" }, { status: 500 });
  }
}
