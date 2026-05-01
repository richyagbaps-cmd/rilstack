import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ensurePaystackWalletForEmail, paystackRequest } from "@/lib/paystack";
import { upsertWallet, getWalletByUserId } from "@/lib/wallet-store";
import { findStoredUserByEmail } from "@/lib/user-store";

export const dynamic = "force-dynamic";

interface PaystackCustomerFull {
  id: number;
  customer_code: string;
  email: string;
  dedicated_account?: {
    id: number;
    account_number: string;
    account_name: string;
    bank: { name: string; slug: string };
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const body = await request.json().catch(() => ({}));
    const email: string | undefined =
      session?.user?.email || body?.email;

    if (!email) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Fetch user record to get ID and name
    const user = await findStoredUserByEmail(normalizedEmail);
    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 },
      );
    }

    // Return existing wallet if already set up
    const existingWallet = await getWalletByUserId(user.id);
    if (
      existingWallet?.Account_Number &&
      existingWallet?.Paystack_Customer_code
    ) {
      return NextResponse.json({
        success: true,
        wallet: {
          accountNumber: existingWallet.Account_Number,
          accountName: existingWallet.Account_Name,
          bankName: existingWallet.Bank_Name,
          balance: existingWallet.Balance / 100,
          customerCode: existingWallet.Paystack_Customer_code,
        },
        message: "Wallet already set up.",
      });
    }

    // Create/fetch Paystack customer + dedicated virtual account
    const dva = await ensurePaystackWalletForEmail(normalizedEmail, {
      name: user.name,
      phone: user.phone,
      bvn: user.bvn,
    });

    // Fetch full customer record to get the customer_code
    const customerRes = await paystackRequest<PaystackCustomerFull>(
      `/customer/${encodeURIComponent(normalizedEmail)}`,
    );
    const customerCode = customerRes.data.customer_code;
    const dvaCode = String(
      customerRes.data.dedicated_account?.id ?? "",
    );

    // Persist wallet record in SeaTable
    const wallet = await upsertWallet({
      userId: user.id,
      paystackCustomerCode: customerCode,
      paystackDvaCode: dvaCode,
      accountNumber: dva.accountNumber,
      accountName: dva.accountName,
      bankName: dva.bankName,
    });

    return NextResponse.json({
      success: true,
      wallet: {
        accountNumber: wallet.Account_Number,
        accountName: wallet.Account_Name,
        bankName: wallet.Bank_Name,
        balance: wallet.Balance / 100,
        customerCode: wallet.Paystack_Customer_code,
      },
      message: "Wallet initialized successfully.",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Wallet setup failed.";
    console.error("Wallet setup error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const email =
      request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json(
        { error: "Email required." },
        { status: 400 },
      );
    }

    const user = await findStoredUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const wallet = await getWalletByUserId(user.id);
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not set up." }, { status: 404 });
    }

    return NextResponse.json({
      accountNumber: wallet.Account_Number,
      accountName: wallet.Account_Name,
      bankName: wallet.Bank_Name,
      balance: wallet.Balance / 100,
      customerCode: wallet.Paystack_Customer_code,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch wallet.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
