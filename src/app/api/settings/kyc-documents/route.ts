import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { saveKycDocumentsForEmail } from "@/lib/kyc-documents";
import {
  ensureStoredUserForGoogleSession,
  findStoredUserByEmail,
  updateUserKyc,
} from "@/lib/user-store";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const selfieUrl = String(body?.selfieUrl || "").trim();
    const idDocUrl = String(body?.idDocUrl || "").trim();

    if (!selfieUrl && !idDocUrl) {
      return NextResponse.json(
        { error: "Provide at least one document URL." },
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

    await saveKycDocumentsForEmail(user.email, [
      { type: "selfie", url: selfieUrl },
      { type: "id_card", url: idDocUrl },
    ]);

    const updated = await updateUserKyc(user.email, {
      selfieUrl: selfieUrl || undefined,
      idDocUrl: idDocUrl || undefined,
      kycData: {
        selfieName: selfieUrl || user.kycData?.selfieName,
        idPhotoName: idDocUrl || user.kycData?.idPhotoName,
      },
    });

    return NextResponse.json({
      success: true,
      documents: {
        selfieUrl: updated.selfieUrl || "",
        idDocUrl: updated.idDocUrl || "",
      },
      message: "KYC documents updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update KYC documents." },
      { status: 500 },
    );
  }
}
