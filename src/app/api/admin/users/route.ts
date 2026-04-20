import { NextRequest, NextResponse } from "next/server";
import { listStoredUsers } from "@/lib/user-store";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "eleko44";

function sanitizeUsers(users: Record<string, unknown>[]) {
  return users.map((u) => {
    const { passwordHash, ...rest } = u;
    return rest;
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const users = await listStoredUsers();
  const sanitized = sanitizeUsers(users);

  return NextResponse.json({
    count: sanitized.length,
    users: sanitized,
    storage: "seatable",
  });
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (secret !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await listStoredUsers();
  const sanitized = sanitizeUsers(users);

  return NextResponse.json({
    count: sanitized.length,
    users: sanitized,
    storage: "seatable",
  });
}
