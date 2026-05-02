import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import {
  createStoredUser,
  findStoredUserByEmail,
  findStoredUserByIdentifier,
  hashPin,
  updateUserKyc,
} from "@/lib/user-store";
import { saveKycDocumentsForEmail } from "@/lib/kyc-documents";
import { expressJsonRequest, isExpressBackendEnabled } from "@/lib/express-backend";

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

    if (isExpressBackendEnabled()) {
      const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
      const sessionTempToken = String((token as any)?.googleTempToken || "").trim();
      const bodyTempToken = String(kyc.google_temp_token || kyc.googleTempToken || "").trim();
      const googleTempToken = bodyTempToken || sessionTempToken;

      if (!googleTempToken) {
        return NextResponse.json(
          { error: "Google completion token is missing. Restart Google signup." },
          { status: 400 },
        );
      }

      const expressPayload = {
        google_temp_token: googleTempToken,
        Middle_Name: String(middleName || "").trim(),
        Phone: String(phone || "").trim(),
        NIN: String(nin || "").trim(),
        BVN: String(bvn || "").trim(),
        Address: String(address || "").trim(),
        State: String(stateOfOrigin || "").trim(),
        LGA: String(lga || "").trim(),
        Occupation: String(occupation || "").trim(),
        Income_Range: String(incomeRange || "").trim(),
        Source_of_Funds: String(sourceOfFunds || "").trim(),
        PIN: String(pin || "").trim(),
        ID_Type: String(idType || "nin").trim(),
        ID_Number: String(idNumber || nin || "").trim(),
        Selfie_URL: String(selfieUrl || selfieName || "").trim(),
        ID_Doc_URL: String(idDocUrl || idPhotoName || "").trim(),
      };

      const result = await expressJsonRequest<any>("/auth/google/complete", {
        method: "POST",
        body: JSON.stringify(expressPayload),
      });

      if (!result.ok) {
        return NextResponse.json(
          { error: result.data?.error || "Failed to complete profile." },
          { status: result.status || 500 },
        );
      }

      return NextResponse.json({
        success: true,
        token: result.data?.token || "",
        user: {
          id: result.data?.user?.User_ID || result.data?.user?._id || "",
          email: String(result.data?.user?.Email || session.user.email || "").trim(),
          name: [
            result.data?.user?.Surname,
            result.data?.user?.First_Name,
            result.data?.user?.Middle_Name,
          ]
            .map((v: unknown) => String(v || "").trim())
            .filter(Boolean)
            .join(" "),
          kycLevel: 1,
        },
      });
    }

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

    const existing = await findStoredUserByEmail(session.user.email);

    // Check phone uniqueness — only if the phone is changing
    const normalizedPhone = resolvedPhone;
    if (normalizedPhone !== ((existing?.phone as string) || "").trim()) {
      const phoneOwner = await findStoredUserByIdentifier(normalizedPhone);
      if (phoneOwner && phoneOwner.email !== session.user.email) {
        return NextResponse.json(
          { error: "This phone number is already registered to another account." },
          { status: 409 },
        );
      }
    }

    const updated = existing
      ? await updateUserKyc(session.user.email, {
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
        })
      : await createStoredUser({
          name: resolvedName,
          email: session.user.email,
          password: randomUUID(),
          phone: resolvedPhone,
          pin: String(pin),
          googleId: String((session.user as any).id || `google:${session.user.email}`),
          avatarUrl: String((session.user as any).image || "").trim() || undefined,
          dateOfBirth: resolvedDateOfBirth,
          nin: resolvedNin,
          bvn: resolvedBvn,
          address: resolvedAddress,
          stateOfOrigin: resolvedStateOfOrigin,
          lga: resolvedLga,
          gender,
          idType: resolvedIdType,
          idNumber: resolvedIdNumber,
          selfieUrl: selfieUrl ? String(selfieUrl) : undefined,
          idDocUrl: idDocUrl ? String(idDocUrl) : undefined,
          occupation: resolvedOccupation,
          incomeRange: resolvedIncomeRange,
          sourceOfFunds: resolvedSourceOfFunds,
          termsAccepted: Boolean(termsAccepted),
          authProvider: "google",
          kycData: {
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