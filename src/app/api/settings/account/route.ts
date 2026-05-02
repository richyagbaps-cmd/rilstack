import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { TABLES, deleteRow, query } from "@/lib/seatable";
import {
  ensureStoredUserForGoogleSession,
  findStoredUserByEmail,
  verifyPassword,
} from "@/lib/user-store";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const confirmation = String(body?.confirmation || "").trim().toUpperCase();
    const password = String(body?.password || "");

    if (confirmation !== "DELETE") {
      return NextResponse.json(
        { error: "Confirmation text must be DELETE." },
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

    if (user.passwordHash && !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Password is incorrect." }, { status: 400 });
    }

    const safeUserId = user.id.replace(/'/g, "''");
    const safeEmail = user.email.replace(/'/g, "''");

    const walletRows = await query<{ _id: string }>(
      `SELECT _id FROM ${TABLES.WALLETS} WHERE User_ID='${safeUserId}' LIMIT 50`,
    ).catch(() => []);

    const txRows = await query<{ _id: string }>(
      `SELECT _id FROM ${TABLES.WALLET_TRANSACTIONS} WHERE User_ID='${safeUserId}' LIMIT 1000`,
    ).catch(async () =>
      query<{ _id: string }>(
        `SELECT _id FROM ${TABLES.WALLET_TRANSACTIONS} WHERE User_Id='${safeUserId}' LIMIT 1000`,
      ).catch(() => []),
    );

    const payoutRows = await query<{ _id: string }>(
      `SELECT _id FROM ${TABLES.PAYOUT_RECIPIENTS} WHERE User_ID='${safeUserId}' LIMIT 200`,
    ).catch(async () =>
      query<{ _id: string }>(
        `SELECT _id FROM ${TABLES.PAYOUT_RECIPIENTS} WHERE User_Id='${safeUserId}' LIMIT 200`,
      ).catch(() => []),
    );

    const kycRows = await query<{ _id: string }>(
      `SELECT _id FROM ${TABLES.KYC_DOCUMENTS} WHERE user_email='${safeEmail}' LIMIT 500`,
    ).catch(() => []);

    for (const row of txRows) {
      await deleteRow(TABLES.WALLET_TRANSACTIONS, row._id).catch(() => {});
    }
    for (const row of payoutRows) {
      await deleteRow(TABLES.PAYOUT_RECIPIENTS, row._id).catch(() => {});
    }
    for (const row of walletRows) {
      await deleteRow(TABLES.WALLETS, row._id).catch(() => {});
    }
    for (const row of kycRows) {
      await deleteRow(TABLES.KYC_DOCUMENTS, row._id).catch(() => {});
    }

    await deleteRow(TABLES.USERS, user.rowId);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete account." },
      { status: 500 },
    );
  }
}
