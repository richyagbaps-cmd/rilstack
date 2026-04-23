import { NextRequest, NextResponse } from "next/server";
import { buildWithdrawalReference, paystackRequest } from "@/lib/paystack";

export const dynamic = "force-dynamic";

interface WithdrawalRequest {
  amount: number;
  accountNumber: string;
  bankCode: string;
  recipientName: string;
  narration?: string;
  userEmail: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: WithdrawalRequest = await request.json();
    const {
      amount,
      accountNumber,
      bankCode,
      recipientName,
      narration,
      userEmail,
    } = body;

    if (!amount || amount < 1000) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is ₦1,000." },
        { status: 400 },
      );
    }

    if (!accountNumber || !bankCode || !recipientName) {
      return NextResponse.json(
        { error: "Bank details are required." },
        { status: 400 },
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required." },
        { status: 400 },
      );
    }

    const accountData = await paystackRequest<{ account_name: string }>(
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      { method: "GET" },
    );

    const recipient = await paystackRequest<{ recipient_code: string }>(
      "/transferrecipient",
      {
        method: "POST",
        body: JSON.stringify({
          type: "nuban",
          name: recipientName,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: "NGN",
        }),
      },
    );

    const transfer = await paystackRequest<{
      reference: string;
      status: string;
      transfer_code?: string;
    }>("/transfer", {
      method: "POST",
      body: JSON.stringify({
        source: "balance",
        amount: amount * 100,
        recipient: recipient.data.recipient_code,
        reason: narration || `RILSTACK Withdrawal for ${userEmail}`,
        reference: buildWithdrawalReference(userEmail),
      }),
    });

    return NextResponse.json({
      success: true,
      transactionId: transfer.data.reference,
      transferCode: transfer.data.transfer_code,
      requiresOtp: transfer.data.status === "otp",
      amount,
      account: {
        number: accountNumber,
        name: accountData.data.account_name,
      },
      status: transfer.data.status,
      message:
        transfer.data.status === "otp"
          ? "Withdrawal initiated. Enter the Paystack OTP to complete the transfer."
          : "Withdrawal initiated. Paystack is processing the transfer.",
    });
  } catch (error: any) {
    console.error("Withdrawal error:", error);
    return NextResponse.json(
      { error: error.message || "Withdrawal processing failed." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const data = await paystackRequest<any[]>("/bank", { method: "GET" });

    return NextResponse.json({
      banks: data.data.map((bank: any) => ({
        code: bank.code,
        name: bank.name,
      })),
    });
  } catch (error: any) {
    console.error("Bank fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch banks." },
      { status: 500 },
    );
  }
}
