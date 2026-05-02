import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  ensureStoredUserForGoogleSession,
  findStoredUserByEmail,
  hashPassword,
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
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "currentPassword and newPassword are required." },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
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

    if (!user.passwordHash || !verifyPassword(currentPassword, user.passwordHash)) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 },
      );
    }

    if (verifyPassword(newPassword, user.passwordHash)) {
      return NextResponse.json(
        { error: "New password must be different from current password." },
        { status: 400 },
      );
    }

    await updateUserKyc(session.user.email, {
      passwordHash: hashPassword(newPassword),
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update password." },
      { status: 500 },
    );
  }
}
