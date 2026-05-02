import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ensureStoredUserForGoogleSession, findStoredUserByEmail } from "@/lib/user-store";

export const dynamic = "force-dynamic";

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
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      linkedAccounts: {
        credentials: Boolean(user.passwordHash),
        google: Boolean(user.googleId),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch linked accounts." },
      { status: 500 },
    );
  }
}
