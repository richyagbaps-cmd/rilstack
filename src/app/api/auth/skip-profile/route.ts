import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { findStoredUserByEmail, upsertGoogleUser, updateUserKyc } from "@/lib/user-store";

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await findStoredUserByEmail(session.user.email);
    if (!user) {
      const googleId = String((session.user as any).id || "").trim();
      if (googleId) {
        user = await upsertGoogleUser({
          name: session.user.name || "",
          email: session.user.email,
          googleId,
        });
      }
    }
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await updateUserKyc(session.user.email, {
      kycData: {
        ...user.kycData,
        emailVerified: true,
        googleOnboardingSkipped: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "KYC skipped for now. Dashboard access granted without DVA setup.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to skip KYC." },
      { status: 500 },
    );
  }
}
