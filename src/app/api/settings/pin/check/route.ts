import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { findStoredUserByEmail } from "@/lib/user-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/settings/pin/check
 * Returns whether the authenticated user has a PIN set in SeaTable.
 * Used by PinModal to decide "enter" vs "create" when localStorage is empty.
 */
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await findStoredUserByEmail(session.user.email);
    return NextResponse.json({ hasPinSet: Boolean(user?.pinHash) });
  } catch {
    // Fail open — client will default to "create" step
    return NextResponse.json({ hasPinSet: false });
  }
}
