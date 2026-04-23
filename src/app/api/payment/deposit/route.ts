import { NextRequest, NextResponse } from "next/server";
import {
  ensurePaystackWalletForEmail,
  mapDepositMethodToChannel,
  paystackRequest,
} from "@/lib/paystack";

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

    // Wallet provisioning should not block deposits. If this fails, we still
    // initialize the payment and complete metadata with the fields we have.
    try {
      wallet = await ensurePaystackWalletForEmail(userEmail);
    } catch (walletError) {
      console.warn("Wallet provisioning failed during deposit init:", walletError);
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
