import { NextRequest, NextResponse } from "next/server";
import { buildWithdrawalReference, paystackRequest } from "@/lib/paystack";
import { findStoredUserByEmail } from "@/lib/user-store";
import {
  getWalletByUserId,
  debitWallet,
  getPayoutRecipient,
  savePayoutRecipient,
} from "@/lib/wallet-store";

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

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is ₦100." },
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

    const normalizedEmail = userEmail.trim().toLowerCase();

    // Look up user and their wallet in the DB
    const user = await findStoredUserByEmail(normalizedEmail);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const wallet = await getWalletByUserId(user.id);
    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not set up. Please complete your profile first." },
        { status: 400 },
      );
    }

    const availableBalance = Number(wallet.Balance ?? 0) / 100;
    if (amount > availableBalance) {
      return NextResponse.json(
        {
          error: `Insufficient wallet balance. Available: ₦${availableBalance.toLocaleString("en-NG")}.`,
        },
        { status: 400 },
      );
    }

    // Reuse existing Paystack recipient if we've sent to this account before
    let recipientCode: string;
    const savedRecipient = await getPayoutRecipient(user.id, accountNumber);

    if (savedRecipient) {
      recipientCode = savedRecipient.Recipient_Code;
    } else {
      // Verify the account number is valid
      await paystackRequest<{ account_name: string }>(
        `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        { method: "GET" },
      );

      // Create a new Paystack transfer recipient
      const recipientRes = await paystackRequest<{
        recipient_code: string;
        name: string;
      }>("/transferrecipient", {
        method: "POST",
        body: JSON.stringify({
          type: "nuban",
          name: recipientName,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: "NGN",
        }),
      });
      recipientCode = recipientRes.data.recipient_code;

      // Save for future withdrawals
      await savePayoutRecipient({
        userId: user.id,
        recipientCode,
        bankName: "",
        accountNumber,
        accountName: recipientName,
        bankCode,
      });
    }

    const reference = buildWithdrawalReference(normalizedEmail);

    // Debit wallet BEFORE initiating transfer — prevents double-spend
    await debitWallet(
      wallet,
      amount * 100,
      reference,
      "withdrawal",
      { recipientCode, accountNumber, bankCode },
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
        recipient: recipientCode,
        reason: narration || `RILSTACK Withdrawal`,
        reference,
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
        name: recipientName,
      },
      status: transfer.data.status,
      message:
        transfer.data.status === "otp"
          ? "Withdrawal initiated. Enter the Paystack OTP to complete the transfer."
          : "Withdrawal initiated. Paystack is processing the transfer.",
    });
  } catch (error: any) {
    console.error("Withdrawal error:", error);

    const rawMessage = String(error?.message || "");
    if (/balance is not enough to fulfil this request|insufficient balance/i.test(rawMessage)) {
      return NextResponse.json(
        { error: "Insufficient wallet balance for this withdrawal." },
        { status: 400 },
      );
    }

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
