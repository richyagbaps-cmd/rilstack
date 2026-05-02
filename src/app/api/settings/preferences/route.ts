import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  createStoredUser,
  ensureStoredUserForGoogleSession,
  findStoredUserByEmail,
  updateUserKyc,
} from "@/lib/user-store";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function resolveSessionUser(session: any) {
  if (!session?.user?.email) return null;

  const found =
    (await findStoredUserByEmail(session.user.email)) ||
    (await ensureStoredUserForGoogleSession({
      email: session.user.email,
      name: session.user.name,
      id: (session.user as any).id,
    }));

  if (found) return found;

  return createStoredUser({
    name: String(session.user.name || "Rilstack User").trim(),
    email: session.user.email,
    password: randomUUID(),
    phone: "",
    termsAccepted: true,
    authProvider: "credentials",
    kycData: { emailVerified: true },
  });
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await resolveSessionUser(session);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const prefs = user.kycData?.preferences ?? {};

    return NextResponse.json(
      {
        success: true,
        preferences: {
          privacyMode: prefs.privacyMode ?? false,
          biometric: prefs.biometric ?? false,
          loginAlerts: prefs.loginAlerts ?? true,
          twoFaEnabled: prefs.twoFaEnabled ?? false,
          pushNotifications: prefs.pushNotifications ?? true,
          budgetAlerts: prefs.budgetAlerts ?? true,
          savingsReminders: prefs.savingsReminders ?? true,
          investmentUpdates: prefs.investmentUpdates ?? true,
          promoTips: prefs.promoTips ?? true,
        },
      },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch preferences" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Only accept known preference keys
    const allowed = [
      "privacyMode",
      "biometric",
      "loginAlerts",
      "twoFaEnabled",
      "pushNotifications",
      "budgetAlerts",
      "savingsReminders",
      "investmentUpdates",
      "promoTips",
    ];

    const incoming: Record<string, boolean> = {};
    for (const key of allowed) {
      if (typeof body[key] === "boolean") {
        incoming[key] = body[key];
      }
    }

    const user = await resolveSessionUser(session);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const merged = {
      ...(user.kycData?.preferences ?? {}),
      ...incoming,
    };

    const updated = await updateUserKyc(session.user.email, {
      kycData: { preferences: merged },
    });

    return NextResponse.json({
      success: true,
      preferences: updated.kycData?.preferences ?? merged,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update preferences" },
      { status: 500 },
    );
  }
}
