import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  ensureStoredUserForGoogleSession,
  findStoredUserByEmail,
  updateUserKyc,
} from "@/lib/user-store";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user =
      (await findStoredUserByEmail(session.user.email)) ||
      (await ensureStoredUserForGoogleSession({
        email: session.user.email,
        name: session.user.name,
        id: (session.user as any).id,
      }));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const prefs = user.kycData?.preferences ?? {};

    return NextResponse.json({
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
    });
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

    const user = await findStoredUserByEmail(session.user.email);
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
