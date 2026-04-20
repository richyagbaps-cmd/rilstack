import { NextRequest, NextResponse } from "next/server";
import {
  query,
  updateRow,
  insertRow,
  logTransaction,
  TABLES,
  nairaToKobo,
  getUserById,
  type STProduct,
  type STInvestment,
} from "@/lib/seatable";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { user_id, product_id, amount } = await request.json();

    if (!user_id || !product_id || !amount) {
      return NextResponse.json(
        { error: "user_id, product_id and amount are required" },
        { status: 400 },
      );
    }

    // Fetch product
    const products = await query<STProduct>(
      `SELECT * FROM ${TABLES.INVESTMENT_PRODUCTS} WHERE Product_ID='${product_id}' AND Is_Active=1 LIMIT 1`,
    );
    const product = products[0];
    if (!product) {
      return NextResponse.json({ error: "Product not found or inactive" }, { status: 404 });
    }

    const minInvestment = product.Unit_Amount / 100; // kobo → naira
    if (amount < minInvestment) {
      return NextResponse.json(
        { error: `Minimum investment is ₦${minInvestment.toLocaleString()}` },
        { status: 400 },
      );
    }

    if (product.Total_Units_Available <= 0) {
      return NextResponse.json({ error: "INSUFFICIENT_SUPPLY" }, { status: 400 });
    }

    const amtKobo = nairaToKobo(amount);
    const unitsToBook = Math.floor(amtKobo / product.Unit_Amount);
    if (unitsToBook < 1) {
      return NextResponse.json({ error: "Amount too small for any units" }, { status: 400 });
    }

    // Calculate maturity date
    const start = new Date();
    const maturity = new Date(start);
    maturity.setDate(maturity.getDate() + (product.Tenor_Days || 90));
    const expectedReturn = Math.round(amtKobo * (1 + product.Return_Rate_Percent / 100));

    // Reduce available units
    await updateRow(TABLES.INVESTMENT_PRODUCTS, product._id, {
      Total_Units_Available: Math.max(0, product.Total_Units_Available - unitsToBook),
    });

    // Create investment record
    const inv: Omit<STInvestment, "_id"> = {
      Investment_ID: `inv_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      User_ID: user_id,
      Product_ID: product_id,
      Units: unitsToBook,
      Amount_Invested: amtKobo,
      Expected_Return_Total: expectedReturn,
      Start_Date: start.toISOString().slice(0, 10),
      Expected_End_Date: maturity.toISOString().slice(0, 10),
      Status: "active",
      Accrued_Interest: 0,
      Penalty_Amount: 0,
    };

    const row = await insertRow(TABLES.INVESTMENTS, inv as Record<string, unknown>);

    // Log transaction
    await logTransaction({
      Transaction_ID: `txn_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      User_ID: user_id,
      Type: "investment_purchase",
      Amount: amtKobo,
      Net_Effect: -amtKobo,
      Balance_After: 0,
      Reference_ID: inv.Investment_ID,
    });

    return NextResponse.json(
      { message: "Investment order created", investment: row },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Investment failed" },
      { status: 400 },
    );
  }
}


