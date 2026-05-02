import { NextRequest, NextResponse } from "next/server";
import { findStoredUserByEmail } from "@/lib/user-store";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const existing = await findStoredUserByEmail(email.trim().toLowerCase());

    return NextResponse.json({ exists: Boolean(existing) });
  } catch {
    // Fail open — don't block signup on a lookup error
    return NextResponse.json({ exists: false });
  }
}
