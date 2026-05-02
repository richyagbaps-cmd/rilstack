import { NextRequest, NextResponse } from "next/server";
import { findStoredUserByIdentifier } from "@/lib/user-store";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Phone is required." }, { status: 400 });
    }

    const existing = await findStoredUserByIdentifier(phone.trim());

    return NextResponse.json({ exists: Boolean(existing) });
  } catch {
    // Fail open — don't block signup on a lookup error
    return NextResponse.json({ exists: false });
  }
}
