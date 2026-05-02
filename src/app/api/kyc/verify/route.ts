import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ensureStoredUserForGoogleSession, findStoredUserByEmail, updateUserKyc } from "@/lib/user-store";
import {
  verifyBvnExternally,
  verifyIdentityExternally,
  verifyNinExternally,
} from "@/lib/identity-verification";
import crypto from "crypto";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { step } = body;

    const kycData = user.kycData || {
      emailVerified: false,
      bvnVerified: false,
      ninVerified: false,
      identityVerified: false,
      detailsComplete: false,
    };

    switch (step) {
      case "send-otp": {
        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

        await updateUserKyc(session.user.email, {
          kycData: {
            ...kycData,
            emailOtp: otp,
            emailOtpExpiry: expiry,
          },
        });

        if (!process.env.RESEND_API_KEY) {
          return NextResponse.json(
            { error: "OTP email provider is not configured." },
            { status: 503 },
          );
        }

        const { Resend } = await import("resend");
        const resendClient = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.EMAIL_FROM || "no-reply@rilstack.xyz";

        await resendClient.emails.send({
          from: fromEmail,
          to: session.user.email,
          subject: "Rilstack Verification Code",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
              <h2 style="color: #2c5f2d;">Rilstack Verification</h2>
              <p>Your verification code is:</p>
              <div style="background: #f1f4f9; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1E2A3A;">${otp}</span>
              </div>
              <p style="color: #4A5B6E; font-size: 14px;">This code expires in 10 minutes. Do not share it with anyone.</p>
            </div>
          `,
        });

        return NextResponse.json({
          success: true,
          message: "Verification code sent to your email.",
        });
      }

      case "verify-otp": {
        const { otp } = body;
        if (!otp || otp.length !== 6) {
          return NextResponse.json(
            { error: "Invalid OTP format." },
            { status: 400 },
          );
        }

        if (!kycData.emailOtp || !kycData.emailOtpExpiry) {
          return NextResponse.json(
            { error: "No OTP was sent. Please request a new one." },
            { status: 400 },
          );
        }

        if (new Date() > new Date(kycData.emailOtpExpiry)) {
          return NextResponse.json(
            { error: "OTP has expired. Please request a new one." },
            { status: 400 },
          );
        }

        if (kycData.emailOtp !== otp) {
          return NextResponse.json(
            { error: "Invalid OTP. Please try again." },
            { status: 400 },
          );
        }

        const newKycData = {
          ...kycData,
          emailVerified: true,
          emailOtp: undefined,
          emailOtpExpiry: undefined,
        };

        const newLevel = calculateKycLevel(newKycData);
        await updateUserKyc(session.user.email, {
          kycLevel: newLevel,
          kycData: newKycData,
        });

        return NextResponse.json({
          success: true,
          message: "Email verified successfully.",
          kycLevel: newLevel,
        });
      }

      case "verify-bvn": {
        const { bvn } = body;
        if (!bvn || !/^\d{11}$/.test(bvn)) {
          return NextResponse.json(
            { error: "BVN must be exactly 11 digits." },
            { status: 400 },
          );
        }

        const bvnResult = await verifyBvnExternally(bvn);
        if (!bvnResult.verified) {
          return NextResponse.json(
            { error: "BVN verification failed." },
            { status: 422 },
          );
        }

        const newKycData = { ...kycData, bvnVerified: true };
        const newLevel = calculateKycLevel(newKycData);

        await updateUserKyc(session.user.email, {
          bvn,
          kycLevel: newLevel,
          kycData: {
            ...newKycData,
            dojahReferenceId: bvnResult.referenceId || kycData.dojahReferenceId,
          },
        });

        return NextResponse.json({
          success: true,
          message: "BVN verified successfully.",
          kycLevel: newLevel,
        });
      }

      case "verify-nin": {
        const { nin } = body;
        if (!nin || !/^\d{11}$/.test(nin)) {
          return NextResponse.json(
            { error: "NIN must be exactly 11 digits." },
            { status: 400 },
          );
        }

        const ninResult = await verifyNinExternally(nin);
        if (!ninResult.verified) {
          return NextResponse.json(
            { error: "NIN verification failed." },
            { status: 422 },
          );
        }

        const newKycData = { ...kycData, ninVerified: true };
        const newLevel = calculateKycLevel(newKycData);

        await updateUserKyc(session.user.email, {
          nin,
          kycLevel: newLevel,
          kycData: {
            ...newKycData,
            dojahReferenceId: ninResult.referenceId || kycData.dojahReferenceId,
          },
        });

        return NextResponse.json({
          success: true,
          message: "NIN verified successfully.",
          kycLevel: newLevel,
        });
      }

      case "verify-identity": {
        const { dojahReferenceId } = body;
        const referenceId = String(dojahReferenceId || "").trim();
        if (!referenceId) {
          return NextResponse.json(
            { error: "Identity reference ID is required." },
            { status: 400 },
          );
        }

        const identityResult = await verifyIdentityExternally(referenceId);
        if (!identityResult.verified) {
          return NextResponse.json(
            { error: "Identity verification failed." },
            { status: 422 },
          );
        }

        const newKycData = {
          ...kycData,
          identityVerified: true,
          dojahReferenceId: identityResult.referenceId,
        };
        const newLevel = calculateKycLevel(newKycData);

        await updateUserKyc(session.user.email, {
          kycLevel: newLevel,
          kycData: newKycData,
        });

        return NextResponse.json({
          success: true,
          message: "Identity verified successfully.",
          kycLevel: newLevel,
        });
      }

      case "complete-details": {
        const { dateOfBirth, gender, stateOfOrigin, address } = body;

        if (!dateOfBirth || !gender || !stateOfOrigin || !address) {
          return NextResponse.json(
            { error: "All personal details are required." },
            { status: 400 },
          );
        }

        const validGenders = ["M", "F", "other"];
        if (!validGenders.includes(gender)) {
          return NextResponse.json(
            { error: "Invalid gender value." },
            { status: 400 },
          );
        }

        const newKycData = { ...kycData, detailsComplete: true };
        const newLevel = calculateKycLevel(newKycData);

        await updateUserKyc(session.user.email, {
          dateOfBirth,
          gender,
          name: user.name,
          stateOfOrigin: stateOfOrigin.trim(),
          address: address.trim(),
          kycLevel: newLevel,
          kycData: newKycData,
        });

        return NextResponse.json({
          success: true,
          message: "Profile completed successfully.",
          kycLevel: newLevel,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid verification step." },
          { status: 400 },
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Verification failed." },
      { status: 500 },
    );
  }
}

function calculateKycLevel(kycData: {
  emailVerified: boolean;
  bvnVerified: boolean;
  ninVerified: boolean;
  identityVerified: boolean;
  detailsComplete: boolean;
}): number {
  let level = 0;
  if (kycData.emailVerified) level++;
  if (kycData.bvnVerified) level++;
  if (kycData.ninVerified) level++;
  if (kycData.identityVerified) level++;
  if (kycData.detailsComplete) level++;
  return level;
}
