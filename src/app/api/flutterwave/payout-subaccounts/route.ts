import type { NextRequest } from "next/server";

type CreatePayoutSubaccountBody = {
  account_name?: string;
  email?: string;
  country?: string;
  mobilenumber?: string;
  bank_code?: string;
};

export async function POST(req: NextRequest) {
  if (!process.env.FLW_SECRET_KEY) {
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Flutterwave secret key is not configured",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  let body: CreatePayoutSubaccountBody;
  try {
    body = (await req.json()) as CreatePayoutSubaccountBody;
  } catch {
    return new Response(
      JSON.stringify({ status: "error", message: "Invalid JSON payload" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const { account_name, email, country, mobilenumber, bank_code } = body;

  if (!account_name || !email || !country) {
    return new Response(
      JSON.stringify({
        status: "error",
        message: "account_name, email, and country are required",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const payload: Record<string, string> = {
    account_name,
    email,
    country,
  };

  if (mobilenumber) payload.mobilenumber = mobilenumber;
  if (bank_code) payload.bank_code = bank_code;

  const response = await fetch("https://api.flutterwave.com/v3/payout-subaccounts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
