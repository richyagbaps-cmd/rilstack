import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  getWalletByCustomerCode,
  getWalletByUserId,
  creditWallet,
} from "@/lib/wallet-store";
import { findStoredUserByEmail, isWebhookEventProcessed, markWebhookEventProcessed } from "@/lib/user-store";

export const dynamic = "force-dynamic";

interface PaystackChargeSuccessData {
  reference: string;
  amount: number; // in kobo
  status: string;
  channel?: string;
  customer: {
    email: string;
    customer_code: string;
  };
  metadata?: Record<string, unknown>;
}

interface PaystackWebhookPayload {
  event: string;
  data: PaystackChargeSuccessData;
}

export async function POST(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: "Payment service not configured." },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  const expectedSignature = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  if (!signature || signature !== expectedSignature) {
    return NextResponse.json(
      { error: "Invalid Paystack signature." },
      { status: 401 },
    );
  }

  let payload: PaystackWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  // Only process successful charge events (DVA transfers + card/USSD)
  if (payload.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const { reference, amount, status, customer } = payload.data;

  if (status !== "success") {
    return NextResponse.json({ received: true });
  }

  // Idempotency: skip if this exact reference has already been processed
  if (isWebhookEventProcessed(reference)) {
    return NextResponse.json({ received: true, duplicate: true });
  }
  markWebhookEventProcessed(reference);

  try {
    // Find wallet by Paystack customer_code first (most reliable)
    let wallet = await getWalletByCustomerCode(customer.customer_code);

    // Fallback: look up user by email then get their wallet
    if (!wallet && customer.email) {
      const user = await findStoredUserByEmail(
        customer.email.trim().toLowerCase(),
      );
      if (user) {
        wallet = await getWalletByUserId(user.id);
      }
    }

    if (!wallet) {
      // Wallet not set up yet — log and return 200 so Paystack doesn't retry
      console.warn(
        `Webhook: charge.success for unknown customer ${customer.customer_code} (${customer.email}), ref: ${reference}`,
      );
      return NextResponse.json({ received: true });
    }

    // Credit the wallet (idempotent — won't double-credit same reference)
    await creditWallet(wallet, amount, reference, {
      paystackEvent: "charge.success",
      channel: payload.data.channel,
      customerCode: customer.customer_code,
    });

    console.info(
      `Webhook: credited ₦${amount / 100} to wallet ${wallet._id} for user ${wallet.User_ID}, ref: ${reference}`,
    );
  } catch (err) {
    console.error("Webhook: error crediting wallet:", err);
    // Return 200 anyway — Paystack retries on non-2xx, which could cause double credits
    // The creditWallet function is idempotent, so retries are safe
  }

  return NextResponse.json({ received: true });
}

