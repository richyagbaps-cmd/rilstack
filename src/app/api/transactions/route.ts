import { NextRequest, NextResponse } from "next/server";
import { getTransactionsByUser } from "@/lib/seatable";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const transactions = await getTransactionsByUser(userId, limit);
    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}
