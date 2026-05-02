import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ensureStoredUserForGoogleSession, findStoredUserByEmail, updateUserKyc } from "@/lib/user-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    return NextResponse.json(
      {
        success: true,
        bank: {
          bankName: user.kycData?.bankName || "",
          accountNumber: user.kycData?.bankAccountNumber || "",
          accountName: user.kycData?.bankAccountName || "",
        },
      },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch bank settings" },
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
    const { bankName, accountNumber, accountName } = body;

    if (!bankName || !accountNumber || !accountName) {
      return NextResponse.json(
        { error: "bankName, accountNumber and accountName are required" },
        { status: 400 },
      );
    }

    if (!/^\d{10}$/.test(String(accountNumber))) {
      return NextResponse.json(
        { error: "Account number must be 10 digits" },
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await updateUserKyc(session.user.email, {
      kycData: {
        bankName: String(bankName).trim(),
        bankAccountNumber: String(accountNumber).trim(),
        bankAccountName: String(accountName).trim(),
      },
    });

    return NextResponse.json({
      success: true,
      bank: {
        bankName: updated.kycData?.bankName || "",
        accountNumber: updated.kycData?.bankAccountNumber || "",
        accountName: updated.kycData?.bankAccountName || "",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update bank settings" },
      { status: 500 },
    );
  }
}
