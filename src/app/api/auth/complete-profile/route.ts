import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  ensureStoredUserForGoogleSession,
  findStoredUserByEmail,
  findStoredUserByIdentifier,
  hashPin,
  updateUserKyc,
} from "@/lib/user-store";
import { saveKycDocumentsForEmail } from "@/lib/kyc-documents";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const kyc = (body || {}) as Record<string, unknown>;
    const {
      name,
      surname,
      firstName,
      middleName,
      phone,
      pin,
      termsAccepted,
      dateOfBirth,
      gender,
      bvn,
      nin,
      address,
      stateOfOrigin,
      lga,
      idType,
      idNumber,
      selfieUrl,
      idDocUrl,
      selfieName,
      idPhotoName,
      occupation,
      incomeRange,
      sourceOfFunds,
    } = body;

    const resolvedPhone = String(phone || kyc.phone || "").trim();
    const resolvedDateOfBirth = String(dateOfBirth || kyc.dateOfBirth || kyc.dob || "").trim() || undefined;
    const resolvedNin = String(nin || kyc.nin || "").trim() || undefined;
    const resolvedBvn = String(bvn || kyc.bvn || "").trim() || undefined;
    const resolvedAddress = String(address || kyc.address || "").trim() || undefined;
    const resolvedStateOfOrigin =
      String(stateOfOrigin || kyc.stateOfOrigin || kyc.state || "").trim() || undefined;
    const resolvedLga = String(lga || kyc.lga || "").trim() || undefined;
    const resolvedIdType = String(idType || kyc.idType || (resolvedNin ? "nin" : "")).trim() || undefined;
    const resolvedIdNumber =
      String(idNumber || kyc.idNumber || (resolvedIdType === "nin" ? resolvedNin || "" : "")).trim() || undefined;
    const resolvedOccupation = String(occupation || kyc.occupation || "").trim() || undefined;
    const resolvedIncomeRange = String(incomeRange || kyc.incomeRange || kyc.income || "").trim() || undefined;
    const resolvedSourceOfFunds = String(sourceOfFunds || kyc.sourceOfFunds || kyc.source || "").trim() || undefined;

    const composedName = [surname, firstName, middleName]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join(" ");
    const resolvedName = String(name || composedName).trim();

    // Only the core fields are required for Google onboarding
    if (!resolvedName || !resolvedPhone || !pin || !termsAccepted || !resolvedDateOfBirth || !gender || !resolvedAddress || !resolvedStateOfOrigin) {
      return NextResponse.json(
        { error: "Surname/first name, phone, PIN, date of birth, gender, address and state are required." },
        { status: 400 },
      );
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN must be exactly 4 digits." },
        { status: 400 },
      );
    }

    const existing =
      (await findStoredUserByEmail(session.user.email)) ||
      (await ensureStoredUserForGoogleSession({
        email: session.user.email,
        name: session.user.name || "",
        id: (session.user as any).id,
      }));

    if (!existing) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check phone uniqueness — only if the phone is changing
    const normalizedPhone = resolvedPhone;
    if (normalizedPhone !== (existing.phone || "").trim()) {
      const phoneOwner = await findStoredUserByIdentifier(normalizedPhone);
      if (phoneOwner && phoneOwner.email !== existing.email) {
        return NextResponse.json(
          { error: "This phone number is already registered to another account." },
          { status: 409 },
        );
      }
    }

    const updated = await updateUserKyc(session.user.email, {
      name: resolvedName,
      phone: resolvedPhone,
      pinHash: hashPin(String(pin)),
      dateOfBirth: resolvedDateOfBirth,
      gender,
      nin: resolvedNin,
      bvn: resolvedBvn,
      address: resolvedAddress,
      stateOfOrigin: resolvedStateOfOrigin,
      lga: resolvedLga,
      idType: resolvedIdType,
      idNumber: resolvedIdNumber,
      selfieUrl: selfieUrl ? String(selfieUrl) : undefined,
      idDocUrl: idDocUrl ? String(idDocUrl) : undefined,
      occupation: resolvedOccupation,
      incomeRange: resolvedIncomeRange,
      sourceOfFunds: resolvedSourceOfFunds,
      termsAccepted: Boolean(termsAccepted),
      kycData: {
        ...existing.kycData,
        emailVerified: true,
        googleOnboardingSkipped: false,
        detailsComplete: true,
        lga: resolvedLga,
        idType: resolvedIdType,
        idNumber: resolvedIdNumber,
        occupation: resolvedOccupation,
        income: resolvedIncomeRange,
        source: resolvedSourceOfFunds,
      },
    });

    await saveKycDocumentsForEmail(updated.email, [
      { type: "selfie", url: String(selfieUrl || selfieName || "").trim() },
      { type: "id_card", url: String(idDocUrl || idPhotoName || "").trim() },
    ]);

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        kycLevel: updated.kycLevel,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to complete profile." },
      { status: 500 },
    );
  }
}