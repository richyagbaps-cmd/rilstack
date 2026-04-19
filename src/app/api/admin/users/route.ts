import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "eleko44";

// Redis for permanent storage
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = !!(REDIS_URL && REDIS_TOKEN);

let redis: Redis | null = null;
if (useRedis) {
  redis = new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! });
}

const REDIS_KEY = "rilstack:users";

// File fallback (use /tmp on Vercel since /var/task is read-only)
const dataDirectory = process.env.VERCEL
  ? path.join("/tmp", "data")
  : path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDirectory, "users.json");

async function getUsers() {
  // Try Redis first
  if (useRedis && redis) {
    try {
      const data = await redis.get<Record<string, unknown>[]>(REDIS_KEY);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  // File fallback
  try {
    const raw = await fs.readFile(dataFilePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

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

  const users = await getUsers();
  const sanitized = sanitizeUsers(users);

  return NextResponse.json({
    count: sanitized.length,
    users: sanitized,
    storage: useRedis ? "redis" : "file",
  });
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (secret !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await getUsers();
  const sanitized = sanitizeUsers(users);

  return NextResponse.json({
    count: sanitized.length,
    users: sanitized,
    storage: useRedis ? "redis" : "file",
  });
}
