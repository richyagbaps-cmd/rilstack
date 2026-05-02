import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import {
  createStoredUser,
  ensureStoredUserForGoogleSession,
  findStoredUserByEmail,
  updateUserKyc,
} from "@/lib/user-store";
import { randomUUID } from "crypto";
import { expressJsonRequest, isExpressBackendEnabled } from "@/lib/express-backend";

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

  const kyc = (user.kycData || {}) as any;
  const nameParts = String(user.name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    surname: nameParts[0] || "",
    firstName: nameParts[1] || "",
    middleName: nameParts.slice(2).join(" "),
    fullName: user.name || "",
    phone: user.phone || kyc.phone || "",
    email: user.email || "",
    dateOfBirth: user.dateOfBirth || kyc.dateOfBirth || kyc.dob || "",
    gender: (user.gender || "M") as "M" | "F" | "other",
    stateOfOrigin: user.stateOfOrigin || kyc.stateOfOrigin || kyc.state || "",
    lga: user.lga || kyc.lga || "",
    address: user.address || kyc.address || "",
    nin: user.nin || kyc.nin || "",
    idType: normalizeIdTypeForUi(user.idType || user.kycData?.idType),
    idNumber: user.idNumber || user.kycData?.idNumber || kyc.nin || "",
    occupation: user.occupation || user.kycData?.occupation || "",
    incomeRange: user.incomeRange || user.kycData?.income || kyc.incomeRange || "",
    sourceOfFunds: user.sourceOfFunds || user.kycData?.source || kyc.sourceOfFunds || "",
    bvn: user.bvn || kyc.bvn || "",
  };
}

function toResponseProfileFromExpress(user: any) {
  const fullName = [user?.Surname, user?.First_Name, user?.Middle_Name]
    .map((v: unknown) => String(v || "").trim())
    .filter(Boolean)
    .join(" ");

  return {
    surname: String(user?.Surname || ""),
    firstName: String(user?.First_Name || ""),
    middleName: String(user?.Middle_Name || ""),
    fullName,
    phone: String(user?.Phone || ""),
    email: String(user?.Email || ""),
    dateOfBirth: String(user?.Date_Of_Birth || ""),
    gender: (String(user?.Gender || "M") as "M" | "F" | "other"),
    stateOfOrigin: String(user?.State || ""),
    lga: String(user?.LGA || ""),
    address: String(user?.Address || ""),
    nin: String(user?.NIN || ""),
    idType: normalizeIdTypeForUi(String(user?.ID_Type || "nin")),
    idNumber: String(user?.ID_Number || user?.NIN || ""),
    occupation: String(user?.Occupation || ""),
    incomeRange: String(user?.Income_Range || ""),
    sourceOfFunds: String(user?.Source_of_Funds || ""),
    bvn: String(user?.BVN || ""),
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isExpressBackendEnabled()) {
      const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
      const accessToken = (token as any)?.expressAccessToken;
      if (accessToken) {
        const result = await expressJsonRequest<any>("/profile", {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (result.ok && result.data?.user) {
          return NextResponse.json(
            { success: true, profile: toResponseProfileFromExpress(result.data.user) },
            { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
          );
        }
      }
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
      surname,
      firstName,
      middleName,
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

    if (isExpressBackendEnabled()) {
      const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
      const accessToken = (token as any)?.expressAccessToken;

      if (accessToken) {
        const hasExplicitNames =
          Boolean(String(surname || "").trim()) ||
          Boolean(String(firstName || "").trim()) ||
          Boolean(String(middleName || "").trim());
        const fullNameParts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
        const expressSurname = String(surname || "").trim() || fullNameParts[0] || "";
        const expressFirstName = String(firstName || "").trim() || fullNameParts[1] || "";
        const expressMiddleName =
          String(middleName || "").trim() ||
          (fullNameParts.length > 2 ? fullNameParts.slice(2).join(" ") : "");

        if (!hasExplicitNames && !String(fullName || "").trim()) {
          return NextResponse.json(
            { error: "Surname and first name are required" },
            { status: 400 },
          );
        }

        const expressPayload = {
          Surname: expressSurname,
          First_Name: expressFirstName,
          Middle_Name: expressMiddleName,
          Phone: String(phone || "").trim(),
          Address: String(address || "").trim(),
          State: String(stateOfOrigin || "").trim(),
          LGA: String(lga || "").trim(),
          ID_Type: String(idType || "nin").trim(),
          ID_Number: String(idNumber || nin || "").trim(),
          Occupation: String(occupation || "").trim(),
          Income_Range: String(incomeRange || "").trim(),
          Source_of_Funds: String(sourceOfFunds || "").trim(),
          BVN: "",
        };

        const result = await expressJsonRequest<any>("/profile", {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(expressPayload),
        });

        if (!result.ok) {
          return NextResponse.json(
            { error: result.data?.error || "Failed to save settings" },
            { status: result.status || 500 },
          );
        }

        return NextResponse.json({
          success: true,
          profile: toResponseProfileFromExpress(result.data?.user || {}),
        });
      }
    }

    const existingUser = await resolveSessionUser(session);

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const composedFullName = [surname, firstName, middleName]
      .map((v: unknown) => String(v || "").trim())
      .filter(Boolean)
      .join(" ");
    const resolvedFullName = String(fullName || composedFullName).trim();

    if (!resolvedFullName || !phone || !dateOfBirth || !gender || !stateOfOrigin || !address) {
      return NextResponse.json(
        { error: "Missing required profile fields" },
        { status: 400 },
      );
    }

    const updated = await updateUserKyc(session.user.email, {
      name: resolvedFullName,
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
