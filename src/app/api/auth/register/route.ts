import { NextRequest, NextResponse } from 'next/server';
import { createStoredUser } from '@/lib/user-store';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: 'Name, email, password, and phone are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    if (!/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const user = await createStoredUser({
      name,
      email,
      password,
      phone,
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
