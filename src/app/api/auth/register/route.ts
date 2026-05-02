import { NextRequest, NextResponse } from "next/server";
import { createStoredUser, findStoredUserByEmail, findStoredUserByIdentifier } from "@/lib/user-store";

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  pin?: string;
  dateOfBirth?: string;
  nin?: string;
  bvn?: string;
  address?: string;
  stateOfOrigin?: string;
  lga?: string;
  gender?: "M" | "F" | "other";
  idType?: string;
  idNumber?: string;
  occupation?: string;
  incomeRange?: string;
  sourceOfFunds?: string;
  termsAccepted?: boolean;
  kycData?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const {
      name,
      email,
      password,
      phone,
      pin,
      dateOfBirth,
      nin,
      bvn,
      address,
      stateOfOrigin,
      lga,
      gender,
      idType,
      idNumber,
      occupation,
      incomeRange,
      sourceOfFunds,
      termsAccepted,
      kycData,
    } = body;

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: "Name, email, password, and phone are required." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 },
      );
    }

    if (!/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }

    // Check for duplicate email
    const existingByEmail = await findStoredUserByEmail(email.trim().toLowerCase());
    if (existingByEmail) {
      return NextResponse.json(
        { error: "An account already exists for this email address. Please sign in instead." },
        { status: 409 },
      );
    }

    // Check for duplicate phone
    if (phone) {
      const existingByPhone = await findStoredUserByIdentifier(phone.trim());
      if (existingByPhone) {
        return NextResponse.json(
          { error: "This phone number is already registered. Please sign in instead." },
          { status: 409 },
        );
      }
    }

    const user = await createStoredUser({
      name,
      email,
      password,
      phone,
      pin,
      dateOfBirth,
      nin,
      bvn,
      address,
      stateOfOrigin,
      lga,
      gender,
      idType,
      idNumber,
      occupation,
      incomeRange,
      sourceOfFunds,
      termsAccepted,
      authProvider: "credentials",
      kycData: (kycData || undefined) as any,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        kycLevel: user.kycLevel,
      },
      message: "Account created successfully.",
    });
  } catch (error: any) {
    const message = error?.message || "Failed to create account.";
    const status = message.includes("already exists") ? 409 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
