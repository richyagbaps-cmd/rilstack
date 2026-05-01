import { NextRequest, NextResponse } from "next/server";
import { getPaystackLedgerForEmail } from "@/lib/account-ledger";
import { ensurePaystackWalletForEmail } from "@/lib/paystack";
import { findStoredUserByEmail } from "@/lib/user-store";
import { getWalletByUserId, upsertWallet } from "@/lib/wallet-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams
      .get("email")
      ?.trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "User email is required." },
        { status: 400 },
      );
    }

    // Ensure the user has a wallet record — auto-provision if missing
    try {
      const user = await findStoredUserByEmail(email);
      if (user) {
        const existing = await getWalletByUserId(user.id);
        if (!existing) {
          const dva = await ensurePaystackWalletForEmail(email, {
            name: user.name,
            phone: user.phone,
            bvn: user.bvn,
          });
          // Fetch customer code
          const { paystackRequest } = await import("@/lib/paystack");
          const customerRes = await paystackRequest<{ customer_code: string }>(
            `/customer/${encodeURIComponent(email)}`,
          );
          await upsertWallet({
            userId: user.id,
            paystackCustomerCode: customerRes.data.customer_code,
            accountNumber: dva.accountNumber,
            accountName: dva.accountName,
            bankName: dva.bankName,
          });
        }
      }
    } catch (provErr) {
      console.warn("Account: wallet auto-provision failed:", provErr);
    }

    const ledger = await getPaystackLedgerForEmail(email);
    return NextResponse.json(ledger);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch account ledger.";
    console.error("Account ledger error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
