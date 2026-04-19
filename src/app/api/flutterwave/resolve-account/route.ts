import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { account_number, account_bank } = await req.json();

  const response = await fetch(
    "https://api.flutterwave.com/v3/accounts/resolve",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ account_number, account_bank }),
    },
  );

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
