import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { findStoredUserByEmail } from "@/lib/user-store";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await findStoredUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const kycData = user.kycData || {
      emailVerified: false,
      bvnVerified: false,
      ninVerified: false,
      identityVerified: false,
      detailsComplete: false,
    };

    return NextResponse.json({
      success: true,
      status: {
        kycLevel: user.kycLevel || 0,
        emailVerified: kycData.emailVerified,
        bvnVerified: kycData.bvnVerified,
        ninVerified: kycData.ninVerified,
        identityVerified: kycData.identityVerified,
        detailsComplete: kycData.detailsComplete,
        phone: user.phone || "",
        email: user.email,
        name: user.name,
        gender: user.gender || "",
        stateOfOrigin: user.stateOfOrigin || "",
        address: user.address || "",
        bvn: user.bvn ? `***${user.bvn.slice(-4)}` : "",
        nin: user.nin ? `***${user.nin.slice(-4)}` : "",
        profileComplete: Boolean(user.phone && user.pinHash && user.termsAccepted),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch KYC status" },
      { status: 500 },
    );
  }
}
