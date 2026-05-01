import { NextRequest, NextResponse } from "next/server";
import {
  ensurePaystackWalletForEmail,
  mapDepositMethodToChannel,
  paystackRequest,
} from "@/lib/paystack";
import { findStoredUserByEmail } from "@/lib/user-store";

export const dynamic = "force-dynamic";

interface DepositRequest {
  amount: number;
  method: "card" | "transfer" | "ussd";
  description?: string;
  userEmail?: string;
  callbackUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DepositRequest = await request.json();
    const { amount, method, description, userEmail, callbackUrl } = body;

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Minimum deposit amount is N100." },
        { status: 400 },
      );
    }

    if (!["card", "transfer", "ussd"].includes(method)) {
      return NextResponse.json(
        { error: "Invalid payment method." },
        { status: 400 },
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required." },
        { status: 400 },
      );
    }

    let wallet: Awaited<ReturnType<typeof ensurePaystackWalletForEmail>> | null = null;

    const userRecord = await findStoredUserByEmail(userEmail).catch(() => null);

    // Always provision/fetch the user's dedicated virtual account.
    let walletError: string | null = null;
    try {
      wallet = await ensurePaystackWalletForEmail(userEmail, {
        name: userRecord?.name,
        phone: userRecord?.phone,
        bvn: userRecord?.bvn,
      });
    } catch (err) {
      walletError = err instanceof Error ? err.message : "Wallet provisioning failed";
      console.warn("Wallet provisioning failed during deposit init:", err);
    }

    // For bank transfers, the user deposits directly to their permanent
    // dedicated virtual account (DVA) — no payment link needed.
    if (method === "transfer") {
      if (!wallet) {
        const isKycIssue = walletError?.toLowerCase().includes("identified") ||
          walletError?.toLowerCase().includes("kyc") ||
          walletError?.toLowerCase().includes("bvn");
        return NextResponse.json(
          {
            error: isKycIssue
              ? "Your account needs identity verification before a virtual account can be issued. Please complete your KYC (BVN verification) in Settings."
              : (walletError || "Unable to provision your virtual account. Please try again."),
          },
          { status: isKycIssue ? 403 : 500 },
        );
      }
      return NextResponse.json({
        success: true,
        method: "transfer",
        amount,
        dva: {
          accountNumber: wallet.accountNumber,
          accountName: wallet.accountName,
          bankName: wallet.bankName,
        },
        message: `Transfer ₦${amount.toLocaleString("en-NG")} to your wallet account below. Your balance will update automatically once received.`,
      });
    }

    const reference = `RIL_${Date.now()}`;
    const response = await paystackRequest<{
      reference: string;
      authorization_url: string;
      access_code: string;
    }>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email: userEmail,
        amount: amount * 100,
        currency: "NGN",
        reference,
        callback_url: callbackUrl,
        channels: [mapDepositMethodToChannel(method)],
        metadata: {
          description: description || "RILSTACK Deposit",
          type: "deposit",
          platform: "rilstack",
          userEmail,
          depositMethod: method,
          walletAccountNumber: wallet?.accountNumber,
          walletBankName: wallet?.bankName,
        },
      }),
    });

    return NextResponse.json({
      success: true,
      transactionId: response.data.reference,
      reference: response.data.reference,
      amount,
      method,
      description: description || "Paystack deposit",
      status: "pending",
      paymentUrl: response.data.authorization_url,
      accessCode: response.data.access_code,
      wallet,
      message: "Payment link generated. Complete the flow on Paystack.",
    });
  } catch (error: any) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { error: error.message || "Payment processing failed." },
      { status: 500 },
    );
  }
}
