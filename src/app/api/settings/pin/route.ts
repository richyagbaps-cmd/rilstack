import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  ensureStoredUserForGoogleSession,
  findStoredUserByEmail,
  hashPin,
  updateUserKyc,
  verifyPassword,
} from "@/lib/user-store";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const currentPin = String(body?.currentPin || "").trim();
    const newPin = String(body?.newPin || "").trim();

    if (!currentPin || !newPin) {
      return NextResponse.json(
        { error: "currentPin and newPin are required." },
        { status: 400 },
      );
    }

    if (!/^\d{4,6}$/.test(newPin)) {
      return NextResponse.json(
        { error: "New PIN must be 4 to 6 digits." },
        { status: 400 },
      );
    }

    const user =
      (await findStoredUserByEmail(session.user.email)) ||
      (await ensureStoredUserForGoogleSession({
        email: session.user.email,
        name: session.user.name,
        id: (session.user as any).id,
      }));

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!user.pinHash || !verifyPassword(currentPin, user.pinHash)) {
      return NextResponse.json(
        { error: "Current PIN is incorrect." },
        { status: 400 },
      );
    }

    if (verifyPassword(newPin, user.pinHash)) {
      return NextResponse.json(
        { error: "New PIN must be different from current PIN." },
        { status: 400 },
      );
    }

    await updateUserKyc(session.user.email, {
      pinHash: hashPin(newPin),
    });

    return NextResponse.json({ success: true, message: "PIN updated successfully." });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update PIN." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/settings/pin/verify
 * Verify a PIN against the server-side scrypt hash.
 * Used as a fallback when localStorage PIN is missing or mismatched.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const pin = String(body?.pin || "").trim();

    if (!pin || !/^\d{4,6}$/.test(pin)) {
      return NextResponse.json({ error: "Invalid PIN." }, { status: 400 });
    }

    const user = await findStoredUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!user.pinHash) {
      return NextResponse.json({ valid: false, noPinSet: true });
    }

    const valid = verifyPassword(pin, user.pinHash);
    return NextResponse.json({ valid });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Verification failed." },
      { status: 500 },
    );
  }
}
