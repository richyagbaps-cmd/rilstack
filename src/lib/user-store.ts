import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Redis } from '@upstash/redis';

export interface KycData {
  emailVerified: boolean;
  emailOtp?: string;
  emailOtpExpiry?: string;
  bvnVerified: boolean;
  ninVerified: boolean;
  identityVerified: boolean;
  dojahReferenceId?: string;
  detailsComplete: boolean;
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  dateOfBirth?: string;
  nin?: string;
  bvn?: string;
  address?: string;
  stateOfOrigin?: string;
  gender?: 'M' | 'F' | 'other';
  kycLevel: number;
  kycData: KycData;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoredUserInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth?: string;
  nin?: string;
  bvn?: string;
  address?: string;
  stateOfOrigin?: string;
  gender?: 'M' | 'F' | 'other';
}

// Redis for permanent storage (Upstash)
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = !!(REDIS_URL && REDIS_TOKEN);

let redis: Redis | null = null;
if (useRedis) {
  redis = new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! });
}

const REDIS_KEY = 'rilstack:users';

// File fallback (use /tmp on Vercel since /var/task is read-only)
const dataDirectory = process.env.VERCEL
  ? path.join('/tmp', 'data')
  : path.join(process.cwd(), 'data');
const dataFilePath = path.join(dataDirectory, 'users.json');

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function ensureDataFile() {
  await fs.mkdir(dataDirectory, { recursive: true });
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, '[]', 'utf8');
  }
}

async function readUsers(): Promise<StoredUser[]> {
  // Use Redis if available (Vercel production)
  if (useRedis && redis) {
    try {
      const data = await redis.get<StoredUser[]>(REDIS_KEY);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  // File fallback (local dev)
  await ensureDataFile();
  const raw = await fs.readFile(dataFilePath, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]) {
  // Write to Redis if available
  if (useRedis && redis) {
    await redis.set(REDIS_KEY, users);
    return;
  }

  // File fallback (local dev)
  await ensureDataFile();
  await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), 'utf8');
}

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(':');

  if (!salt || !key) return false;

  const hashedBuffer = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');

  if (hashedBuffer.length !== keyBuffer.length) return false;

  return crypto.timingSafeEqual(hashedBuffer, keyBuffer);
}

export async function findStoredUserByEmail(email: string) {
  const users = await readUsers();
  const normalizedEmail = normalizeEmail(email);
  return users.find((user) => normalizeEmail(user.email) === normalizedEmail) || null;
}

export async function createStoredUser(input: CreateStoredUserInput) {
  const users = await readUsers();
  const normalizedEmail = normalizeEmail(input.email);

  const exists = users.some((user) => normalizeEmail(user.email) === normalizedEmail);
  if (exists) {
    throw new Error('An account with this email already exists.');
  }

  const now = new Date().toISOString();
  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(input.password),
    phone: input.phone.trim(),
    dateOfBirth: input.dateOfBirth || undefined,
    nin: input.nin?.trim() || undefined,
    bvn: input.bvn?.trim() || undefined,
    address: input.address?.trim() || undefined,
    stateOfOrigin: input.stateOfOrigin?.trim() || undefined,
    gender: input.gender,
    kycLevel: 0,
    kycData: {
      emailVerified: false,
      bvnVerified: false,
      ninVerified: false,
      identityVerified: false,
      detailsComplete: false,
    },
    createdAt: now,
    updatedAt: now,
  };

  users.push(user);
  await writeUsers(users);

  return user;
}

export async function updateUserKyc(email: string, updates: Partial<StoredUser>) {
  const users = await readUsers();
  const normalizedEmail = normalizeEmail(email);
  const index = users.findIndex((u) => normalizeEmail(u.email) === normalizedEmail);

  if (index === -1) {
    throw new Error('User not found.');
  }

  const user = users[index];
  const updatedUser: StoredUser = {
    ...user,
    ...updates,
    kycData: {
      ...user.kycData,
      ...(updates.kycData || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  users[index] = updatedUser;
  await writeUsers(users);

  return updatedUser;
}

export async function findStoredUserById(id: string) {
  const users = await readUsers();
  return users.find((u) => u.id === id) || null;
}
