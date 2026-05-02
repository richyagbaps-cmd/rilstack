import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { TABLES, query } from "@/lib/seatable";
import {
  ensureStoredUserForGoogleSession,
  findStoredUserByEmail,
} from "@/lib/user-store";
import { getWalletByUserId, getWalletTransactions } from "@/lib/wallet-store";

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

    const safeEmail = user.email.replace(/'/g, "''");
    const wallet = await getWalletByUserId(user.id);
    const walletTransactions = await getWalletTransactions(user.id, 500);

    const kycDocuments = await query<Record<string, unknown>>(
      `SELECT * FROM ${TABLES.KYC_DOCUMENTS} WHERE user_email='${safeEmail}' ORDER BY uploaded_at DESC LIMIT 200`,
    ).catch(() => []);

    return NextResponse.json({
      success: true,
      exportedAt: new Date().toISOString(),
      data: {
        profile: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          address: user.address,
          stateOfOrigin: user.stateOfOrigin,
          lga: user.lga,
          nin: user.nin,
          bvn: user.bvn,
          idType: user.idType,
          idNumber: user.idNumber,
          occupation: user.occupation,
          incomeRange: user.incomeRange,
          sourceOfFunds: user.sourceOfFunds,
          kycLevel: user.kycLevel,
          kycStatus: user.kycStatus,
          kycData: user.kycData,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        wallet,
        walletTransactions,
        kycDocuments,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to export account data." },
      { status: 500 },
    );
  }
}
