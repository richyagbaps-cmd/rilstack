import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  createStoredUser,
  ensureStoredUserForGoogleSession,
  findStoredUserByEmail,
  updateUserKyc,
} from "@/lib/user-store";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function resolveSessionUser(session: any) {
  if (!session?.user?.email) return null;

  const found =
    (await findStoredUserByEmail(session.user.email)) ||
    (await ensureStoredUserForGoogleSession({
      email: session.user.email,
      name: session.user.name,
      id: (session.user as any).id,
    }));

  if (found) return found;

  return createStoredUser({
    name: String(session.user.name || "Rilstack User").trim(),
    email: session.user.email,
    password: randomUUID(),
    phone: "",
    termsAccepted: true,
    authProvider: "credentials",
    kycData: { emailVerified: true },
  });
}

function normalizeIdTypeForUi(value?: string):
  | "nin"
  | "bvn"
  | "passport"
  | "drivers-license"
  | "voters-card" {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "nin";
  if (raw === "nin" || raw.includes("national id")) return "nin";
  if (raw === "bvn" || raw.includes("bank verification")) return "bvn";
  if (raw === "passport" || raw.includes("international passport")) return "passport";
  if (raw === "drivers-license" || raw === "driver's license" || raw.includes("driver")) return "drivers-license";
  if (raw === "voters-card" || raw === "voter's card" || raw.includes("voter")) return "voters-card";
  return "nin";
}

function toResponseProfile(user: Awaited<ReturnType<typeof findStoredUserByEmail>>) {
  if (!user) return null;

  return {
    fullName: user.name || "",
    phone: user.phone || "",
    email: user.email || "",
    dateOfBirth: user.dateOfBirth || "",
    gender: (user.gender || "M") as "M" | "F" | "other",
    stateOfOrigin: user.stateOfOrigin || "",
    lga: user.lga || "",
    address: user.address || "",
    nin: user.nin || "",
    idType: normalizeIdTypeForUi(user.idType || user.kycData?.idType),
    idNumber: user.idNumber || user.kycData?.idNumber || "",
    occupation: user.occupation || user.kycData?.occupation || "",
    incomeRange: user.incomeRange || user.kycData?.income || "",
    sourceOfFunds: user.sourceOfFunds || user.kycData?.source || "",
    bvn: user.bvn || "",
  };
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await resolveSessionUser(session);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, profile: toResponseProfile(user) },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile settings" },
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
    const {
      fullName,
      phone,
      dateOfBirth,
      gender,
      stateOfOrigin,
      lga,
      address,
      nin,
      idType,
      idNumber,
      occupation,
      incomeRange,
      sourceOfFunds,
    } = body;

    const existingUser = await resolveSessionUser(session);

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!fullName || !phone || !dateOfBirth || !gender || !stateOfOrigin || !address) {
      return NextResponse.json(
        { error: "Missing required profile fields" },
        { status: 400 },
      );
    }

    const updated = await updateUserKyc(session.user.email, {
      name: String(fullName).trim(),
      phone: String(phone).trim(),
      dateOfBirth: String(dateOfBirth),
      gender,
      stateOfOrigin: String(stateOfOrigin).trim(),
      lga: lga ? String(lga).trim() : undefined,
      address: String(address).trim(),
      nin: nin ? String(nin).trim() : undefined,
      idType: idType ? String(idType).trim() : undefined,
      idNumber: idNumber ? String(idNumber).trim() : undefined,
      occupation: occupation ? String(occupation).trim() : undefined,
      incomeRange: incomeRange ? String(incomeRange).trim() : undefined,
      sourceOfFunds: sourceOfFunds ? String(sourceOfFunds).trim() : undefined,
      kycData: {
        idType: idType ? String(idType).trim() : undefined,
        idNumber: idNumber ? String(idNumber).trim() : undefined,
        occupation: occupation ? String(occupation).trim() : undefined,
        income: incomeRange ? String(incomeRange).trim() : undefined,
        source: sourceOfFunds ? String(sourceOfFunds).trim() : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      profile: toResponseProfile(updated),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile settings" },
      { status: 500 },
    );
  }
}
