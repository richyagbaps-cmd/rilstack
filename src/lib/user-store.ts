import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  dateOfBirth: string;
  nin: string;
  bvn?: string;
  address?: string;
  stateOfOrigin?: string;
  gender?: 'M' | 'F' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoredUserInput {
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

const dataDirectory = path.join(process.cwd(), 'data');
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

async function readUsers() {
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
    dateOfBirth: input.dateOfBirth,
    nin: input.nin.trim(),
    bvn: input.bvn?.trim() || undefined,
    address: input.address?.trim() || undefined,
    stateOfOrigin: input.stateOfOrigin?.trim() || undefined,
    gender: input.gender,
    createdAt: now,
    updatedAt: now,
  };

  users.push(user);
  await writeUsers(users);

  return user;
}
