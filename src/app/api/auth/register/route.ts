import { NextRequest, NextResponse } from 'next/server';
import { createStoredUser } from '@/lib/user-store';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  nin: string;
  bvn?: string;
  address?: string;
  stateOfOrigin?: string;
  gender?: 'M' | 'F' | 'other';
}

function isValidNin(nin: string) {
  return /^\d{11}$/.test(nin);
}

function isValidBvn(bvn?: string) {
  if (!bvn) return true;
  return /^\d{11}$/.test(bvn);
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { name, email, password, phone, dateOfBirth, nin, bvn, address, stateOfOrigin, gender } = body;

    if (!name || !email || !password || !phone || !dateOfBirth || !nin) {
      return NextResponse.json({ error: 'Name, email, password, phone, date of birth, and NIN are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    if (!isValidNin(nin)) {
      return NextResponse.json({ error: 'NIN must be 11 digits.' }, { status: 400 });
    }

    if (!isValidBvn(bvn)) {
      return NextResponse.json({ error: 'BVN must be 11 digits.' }, { status: 400 });
    }

    const user = await createStoredUser({
      name,
      email,
      password,
      phone,
      dateOfBirth,
      nin,
      bvn,
      address,
      stateOfOrigin,
      gender,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: 'Account created successfully.',
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to create account.';
    const status = message.includes('already exists') ? 409 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
