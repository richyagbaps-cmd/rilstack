import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  ensureStoredUserForGoogleSession,
  findStoredUserByEmail,
  findStoredUserByIdentifier,
  hashPin,
  updateUserKyc,
} from "@/lib/user-store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
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
      occupation,
      incomeRange,
      sourceOfFunds,
    } = body;

    const composedName = [surname, firstName, middleName]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join(" ");
    const resolvedName = String(name || composedName).trim();

    // Only the core fields are required for Google onboarding
    if (!resolvedName || !phone || !pin || !termsAccepted || !dateOfBirth || !gender || !address || !stateOfOrigin) {
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
    const normalizedPhone = String(phone).trim();
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
      phone: String(phone).trim(),
      pinHash: hashPin(String(pin)),
      dateOfBirth: dateOfBirth ? String(dateOfBirth) : undefined,
      gender,
      nin: nin ? String(nin).trim() : undefined,
      bvn: bvn ? String(bvn).trim() : undefined,
      address: address ? String(address).trim() : undefined,
      stateOfOrigin: stateOfOrigin ? String(stateOfOrigin).trim() : undefined,
      lga: lga ? String(lga).trim() : undefined,
      idType: idType ? String(idType).trim() : undefined,
      idNumber: idNumber ? String(idNumber).trim() : undefined,
      selfieUrl: selfieUrl ? String(selfieUrl) : undefined,
      idDocUrl: idDocUrl ? String(idDocUrl) : undefined,
      occupation: occupation ? String(occupation).trim() : undefined,
      incomeRange: incomeRange ? String(incomeRange).trim() : undefined,
      sourceOfFunds: sourceOfFunds ? String(sourceOfFunds).trim() : undefined,
      termsAccepted: Boolean(termsAccepted),
      kycData: {
        ...existing.kycData,
        emailVerified: true,
        googleOnboardingSkipped: false,
        detailsComplete: true,
      },
    });

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