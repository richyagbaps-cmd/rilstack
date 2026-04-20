import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  findStoredUserByEmail,
  hashPin,
  updateUserKyc,
} from "@/lib/user-store";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
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
      occupation,
      income,
      source,
      selfieName,
      idPhotoName,
    } = body;

    if (
      !name ||
      !phone ||
      !pin ||
      !termsAccepted ||
      !dateOfBirth ||
      !gender ||
      !nin ||
      !address ||
      !stateOfOrigin ||
      !lga ||
      !idType ||
      !idNumber ||
      !occupation ||
      !income ||
      !source
    ) {
      return NextResponse.json(
        { error: "Complete profile details are required." },
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
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await updateUserKyc(session.user.email, {
      name: String(name).trim(),
      phone: String(phone).trim(),
      pinHash: hashPin(String(pin)),
      dateOfBirth: String(dateOfBirth),
      gender,
      nin: String(nin).trim(),
      bvn: bvn ? String(bvn).trim() : undefined,
      address: String(address).trim(),
      stateOfOrigin: String(stateOfOrigin).trim(),
      termsAccepted: Boolean(termsAccepted),
      kycData: {
        ...existing.kycData,
        emailVerified: true,
        detailsComplete: true,
        lga: String(lga).trim(),
        idType: String(idType).trim(),
        idNumber: String(idNumber).trim(),
        occupation: String(occupation).trim(),
        income: String(income).trim(),
        source: String(source).trim(),
        selfieName: selfieName ? String(selfieName) : undefined,
        idPhotoName: idPhotoName ? String(idPhotoName) : undefined,
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