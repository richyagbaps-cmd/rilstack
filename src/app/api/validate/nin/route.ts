import { NextRequest, NextResponse } from "next/server";
import { verifyNinExternally } from "@/lib/identity-verification";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nin } = body;

    // Validate NIN format
    if (!nin || !/^\d{11}$/.test(nin)) {
      return NextResponse.json(
        { error: "Invalid NIN format. NIN must be 11 digits." },
        { status: 400 },
      );
    }

    const result = await verifyNinExternally(nin);

    const verifiedData = {
      nin,
      firstName: result.firstName || "",
      lastName: result.lastName || "",
      dateOfBirth: result.dateOfBirth || "",
      gender: result.gender || "",
      stateOfOrigin: result.stateOfOrigin || "",
      verified: result.verified,
      referenceId: result.referenceId,
      verificationDate: new Date().toISOString(),
      verificationMethod: result.provider.toUpperCase(),
    };

    return NextResponse.json(verifiedData, { status: 200 });
  } catch (error: any) {
    console.error("NIN validation error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during NIN validation." },
      { status: 500 },
    );
  }
}
