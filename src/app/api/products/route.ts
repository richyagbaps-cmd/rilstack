import { NextRequest, NextResponse } from "next/server";
import {
  getActiveProducts,
  insertRow,
  updateRow,
  query,
  TABLES,
  type STProduct,
  nairaToKobo,
} from "@/lib/seatable";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const products = await getActiveProducts();
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, description, unitAmount, totalUnits, tenorDays,
      isFlexible, returnRatePercent, returnType, penaltyPercent, riskLevel,
    } = body;

    if (!name || !unitAmount || !totalUnits || !tenorDays || !returnRatePercent) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }

    const product: Omit<STProduct, "_id"> = {
      Product_ID: `prod_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      Name: name,
      Description: description || "",
      Unit_Amount: nairaToKobo(unitAmount),
      Total_Units_Available: totalUnits,
      Tenor_Days: tenorDays,
      Is_Flexible: isFlexible || false,
      Return_Rate_Percent: returnRatePercent,
      Return_Type: returnType || "fixed_at_maturity",
      Early_Withdrawal_Penalty_Percent: penaltyPercent || 5,
      Risk_Level: riskLevel || "Low",
      Is_Active: true,
    };

    const row = await insertRow(TABLES.INVESTMENT_PRODUCTS, product as Record<string, unknown>);
    return NextResponse.json(row, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { rowId, updates } = await request.json();
    if (!rowId) return NextResponse.json({ error: "rowId required" }, { status: 400 });
    await updateRow(TABLES.INVESTMENT_PRODUCTS, rowId, updates);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}
