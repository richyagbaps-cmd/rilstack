import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ensureStoredUserForGoogleSession, findStoredUserByEmail, updateUserKyc } from "@/lib/user-store";

function toResponseProfile(user: Awaited<ReturnType<typeof findStoredUserByEmail>>) {
  if (!user) return null;

  return {
    fullName: user.name || "",
    phone: user.phone || "",
    email: user.email || "",
    dateOfBirth: user.dateOfBirth || "",
    gender: (user.gender || "M") as "M" | "F" | "other",
    stateOfOrigin: user.stateOfOrigin || "",
    address: user.address || "",
    idType: (user.kycData?.idType || "nin") as
      | "nin"
      | "bvn"
      | "passport"
      | "drivers-license"
      | "voters-card",
    idNumber: user.kycData?.idNumber || "",
    bvn: user.bvn || "",
  };
}

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

    return NextResponse.json({ success: true, profile: toResponseProfile(user) });
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
      address,
      idType,
      idNumber,
    } = body;

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
      address: String(address).trim(),
      kycData: {
        idType: idType ? String(idType).trim() : undefined,
        idNumber: idNumber ? String(idNumber).trim() : undefined,
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
