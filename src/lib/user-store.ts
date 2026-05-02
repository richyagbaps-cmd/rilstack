import crypto from "crypto";
import {
  TABLES,
  type STUser,
  getUserByEmail,
  getUserById,
  getUserByPhone,
  insertRow,
  listUsers,
  query,
  updateRow,
} from "@/lib/seatable";

export interface KycData {
  emailVerified: boolean;
  emailOtp?: string;
  emailOtpExpiry?: string;
  bvnVerified: boolean;
  ninVerified: boolean;
  identityVerified: boolean;
  googleOnboardingSkipped?: boolean;
  dojahReferenceId?: string;
  detailsComplete: boolean;
  lga?: string;
  idType?: string;
  idNumber?: string;
  occupation?: string;
  income?: string;
  source?: string;
  selfieName?: string;
  idPhotoName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  // User preferences stored in KYC_Data_JSON
  preferences?: {
    privacyMode?: boolean;
    biometric?: boolean;
    loginAlerts?: boolean;
    twoFaEnabled?: boolean;
    pushNotifications?: boolean;
    budgetAlerts?: boolean;
    savingsReminders?: boolean;
    investmentUpdates?: boolean;
    promoTips?: boolean;
  };
}

export interface StoredUser {
  id: string;
  rowId: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  pinHash?: string;
  googleId?: string;
  dateOfBirth?: string;
  nin?: string;
  bvn?: string;
  address?: string;
  stateOfOrigin?: string;
  gender?: "M" | "F" | "other";
  kycLevel: number;
  kycStatus: "Pending" | "Verified" | "Rejected";
  termsAccepted: boolean;
  authProvider: "credentials" | "google";
  loginCount: number;
  lastLogin: string;
  kycData: KycData;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoredUserInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  pin?: string;
  googleId?: string;
  dateOfBirth?: string;
  nin?: string;
  bvn?: string;
  address?: string;
  stateOfOrigin?: string;
  gender?: "M" | "F" | "other";
  termsAccepted?: boolean;
  authProvider?: "credentials" | "google";
  kycData?: Partial<KycData>;
}

function normalizeEmail(email: string) {
  return (email ?? "").trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return (phone ?? "").replace(/\s+/g, "").trim();
}

function hashSecret(secret: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(secret, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function hashPassword(password: string) {
  return hashSecret(password);
}

export function hashPin(pin: string) {
  return hashSecret(pin);
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(":");

  if (!salt || !key) return false;

  const hashedBuffer = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");

  if (hashedBuffer.length !== keyBuffer.length) return false;

  return crypto.timingSafeEqual(hashedBuffer, keyBuffer);
}

function defaultKycData(): KycData {
  return {
    emailVerified: false,
    bvnVerified: false,
    ninVerified: false,
    identityVerified: false,
    googleOnboardingSkipped: false,
    detailsComplete: false,
  };
}

function parseKycData(raw: unknown): KycData {
  if (typeof raw !== "string" || !raw.trim()) {
    return defaultKycData();
  }

  try {
    return {
      ...defaultKycData(),
      ...(JSON.parse(raw) as Partial<KycData>),
    };
  } catch {
    return defaultKycData();
  }
}

function calculateKycLevel(kycData: KycData): number {
  let level = 0;
  if (kycData.emailVerified) level += 1;
  if (kycData.bvnVerified) level += 1;
  if (kycData.ninVerified) level += 1;
  if (kycData.identityVerified) level += 1;
  if (kycData.detailsComplete) level += 1;
  return level;
}

function deriveKycStatus(kycData: KycData): "Pending" | "Verified" | "Rejected" {
  return kycData.identityVerified && kycData.detailsComplete
    ? "Verified"
    : "Pending";
}

function parseSeatableBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
  }
  return false;
}

function mapSeaTableUser(row: STUser): StoredUser {
  const kycData = parseKycData(row.KYC_Data_JSON);
  const kycLevel = Number(row.KYC_Level ?? calculateKycLevel(kycData));
  const createdAt = row.Created_At || new Date().toISOString();
  const updatedAt = row.Updated_At || createdAt;

  return {
    id: row.User_ID,
    rowId: row._id,
    name: row.Full_Name || "",
    email: normalizeEmail(row.Email || ""),
    passwordHash: row.Password_Hash || "",
    phone: row.Phone || "",
    pinHash: row.PIN_Hash || undefined,
    googleId: row.Google_ID || undefined,
    dateOfBirth: row.Date_Of_Birth || undefined,
    nin: row.NIN || undefined,
    bvn: row.BVN || undefined,
    address: row.Address || undefined,
    stateOfOrigin: row.State_Of_Origin || undefined,
    gender: row.Gender,
    kycLevel,
    kycStatus: row.KYC_Status || deriveKycStatus(kycData),
    termsAccepted: parseSeatableBool(row.Terms_Accepted),
    authProvider: row.Auth_Provider || (row.Google_ID ? "google" : "credentials"),
    loginCount: Number(row.Login_Count ?? 0),
    lastLogin: row.Last_Login || "",
    kycData,
    createdAt,
    updatedAt,
  };
}

function buildUserUpdates(user: StoredUser): Record<string, unknown> {
  return {
    Full_Name: user.name,
    Email: user.email,
    Phone: user.phone,
    Password_Hash: user.passwordHash,
    PIN_Hash: user.pinHash || "",
    Google_ID: user.googleId || "",
    KYC_Status: user.kycStatus,
    Privacy_Mode_Enabled: "false",
    Is_Active: "true",
    Date_Of_Birth: user.dateOfBirth || "",
    NIN: user.nin || "",
    BVN: user.bvn || "",
    Address: user.address || "",
    State_Of_Origin: user.stateOfOrigin || "",
    Gender: user.gender || "",
    KYC_Level: user.kycLevel,
    KYC_Data_JSON: JSON.stringify(user.kycData),
    Terms_Accepted: user.termsAccepted ? "true" : "false",
    Auth_Provider: user.authProvider,
    Login_Count: user.loginCount,
    Last_Login: user.lastLogin,
    Created_At: user.createdAt,
    Updated_At: user.updatedAt,
  };
}

export function isStoredUserProfileComplete(user: StoredUser) {
  return Boolean(
    user.phone &&
      user.pinHash &&
      user.termsAccepted &&
      user.kycData.detailsComplete,
  );
}

export function hasStoredUserDashboardAccess(user: StoredUser) {
  if (user.authProvider !== "google") {
    return true;
  }

  return isStoredUserProfileComplete(user) || Boolean(user.kycData.googleOnboardingSkipped);
}

export async function findStoredUserByEmail(email: string) {
  const row = await getUserByEmail(normalizeEmail(email));
  return row ? mapSeaTableUser(row) : null;
}

export async function findStoredUserByIdentifier(identifier: string) {
  const normalized = identifier.trim();
  if (normalized.includes("@")) {
    return findStoredUserByEmail(normalized);
  }

  const row = await getUserByPhone(normalizePhone(normalized));
  return row ? mapSeaTableUser(row) : null;
}

export async function findStoredUserByGoogleId(googleId: string) {
  const rows = await query<STUser>(
    `SELECT * FROM ${TABLES.USERS} WHERE Google_ID='${googleId.replace(/'/g, "''")}' LIMIT 1`,
  );
  return rows[0] ? mapSeaTableUser(rows[0]) : null;
}

export async function listStoredUsers() {
  const rows = await listUsers();
  return rows.map(mapSeaTableUser);
}

// ---------------------------------------------------------------------------
// Per-email signup lock — prevents duplicate user rows if two signup requests
// race for the same email (e.g., double-tap or network retry).
// ---------------------------------------------------------------------------
const _signupLocks = new Map<string, Promise<void>>();

function withSignupLock<T>(email: string, fn: () => Promise<T>): Promise<T> {
  const prev = _signupLocks.get(email) ?? Promise.resolve();
  let resolve!: () => void;
  const next = new Promise<void>((r) => { resolve = r; });
  _signupLocks.set(email, next);
  return prev.then(fn).finally(() => {
    resolve();
    if (_signupLocks.get(email) === next) _signupLocks.delete(email);
  });
}

export async function createStoredUser(input: CreateStoredUserInput) {
  const normalizedEmail = normalizeEmail(input.email);
  return withSignupLock(normalizedEmail, async () => {
    const existing = await findStoredUserByEmail(normalizedEmail);
    if (existing) {
      throw new Error("An account with this email already exists.");
    }

  const now = new Date().toISOString();
  const mergedKycData: KycData = {
    ...defaultKycData(),
    ...(input.kycData || {}),
  };
  const kycLevel = calculateKycLevel(mergedKycData);
  const loginCount = 1;

  const user: StoredUser = {
    id: crypto.randomUUID(),
    rowId: "",
    name: input.name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(input.password),
    phone: normalizePhone(input.phone || ""),
    pinHash: input.pin ? hashPin(input.pin) : undefined,
    googleId: input.googleId || undefined,
    dateOfBirth: input.dateOfBirth || undefined,
    nin: input.nin?.trim() || undefined,
    bvn: input.bvn?.trim() || undefined,
    address: input.address?.trim() || undefined,
    stateOfOrigin: input.stateOfOrigin?.trim() || undefined,
    gender: input.gender,
    kycLevel,
    kycStatus: deriveKycStatus(mergedKycData),
    termsAccepted: Boolean(input.termsAccepted),
    authProvider: input.authProvider || (input.googleId ? "google" : "credentials"),
    loginCount,
    lastLogin: now,
    kycData: mergedKycData,
    createdAt: now,
    updatedAt: now,
  };

  const row = await insertRow(TABLES.USERS, {
    User_ID: user.id,
    ...buildUserUpdates(user),
  });

    return {
      ...user,
      rowId: String((row as { _id?: string })._id || user.id),
    };
  });
}

export async function upsertGoogleUser(input: {
  name: string;
  email: string;
  googleId: string;
}) {
  const normalizedEmail = normalizeEmail(input.email);
  const existing =
    (await findStoredUserByGoogleId(input.googleId)) ||
    (await findStoredUserByEmail(normalizedEmail));

  if (!existing) {
    return createStoredUser({
      name: input.name,
      email: normalizedEmail,
      password: crypto.randomUUID(),
      phone: "",
      googleId: input.googleId,
      authProvider: "google",
      kycData: { emailVerified: true },
    });
  }

  const now = new Date().toISOString();
  const updated: StoredUser = {
    ...existing,
    name: existing.name || input.name,
    googleId: input.googleId,
    authProvider: "google",
    loginCount: (existing.loginCount ?? 0) + 1,
    lastLogin: now,
    kycData: {
      ...existing.kycData,
      emailVerified: true,
    },
    updatedAt: now,
  };
  updated.kycLevel = calculateKycLevel(updated.kycData);
  updated.kycStatus = deriveKycStatus(updated.kycData);

  await updateRow(TABLES.USERS, existing.rowId, buildUserUpdates(updated));
  return updated;
}

/**
 * Increment Login_Count and stamp Last_Login for any sign-in.
 * Call this from the credentials authorize callback after password verify.
 */
export async function recordUserLogin(email: string): Promise<void> {
  const user = await findStoredUserByEmail(email);
  if (!user) return;
  const now = new Date().toISOString();
  await updateRow(TABLES.USERS, user.rowId, {
    Login_Count: (user.loginCount ?? 0) + 1,
    Last_Login: now,
    Updated_At: now,
  });
}

// ---------------------------------------------------------------------------
// Idempotency guard for webhook events (in-memory; resets on cold start)
// ---------------------------------------------------------------------------
const _processedWebhookIds = new Set<string>();

export function isWebhookEventProcessed(eventId: string): boolean {
  return _processedWebhookIds.has(eventId);
}

export function markWebhookEventProcessed(eventId: string): void {
  _processedWebhookIds.add(eventId);
  // Prevent unbounded growth — cap at 10 000 entries
  if (_processedWebhookIds.size > 10_000) {
    const oldest = _processedWebhookIds.values().next().value;
    if (oldest !== undefined) _processedWebhookIds.delete(oldest);
  }
}

export async function updateUserKyc(
  email: string,
  updates: Partial<Omit<StoredUser, "kycData">> & { kycData?: Partial<KycData> },
) {
  const existing = await findStoredUserByEmail(email);
  if (!existing) {
    throw new Error("User not found.");
  }

  const mergedKycData: KycData = {
    ...existing.kycData,
    ...(updates.kycData || {}),
  };

  const updatedUser: StoredUser = {
    ...existing,
    ...updates,
    email: existing.email,
    rowId: existing.rowId,
    passwordHash: updates.passwordHash || existing.passwordHash,
    pinHash: updates.pinHash ?? existing.pinHash,
    phone: updates.phone ? normalizePhone(updates.phone) : existing.phone,
    stateOfOrigin: updates.stateOfOrigin ?? existing.stateOfOrigin,
    termsAccepted: Boolean(updates.termsAccepted ?? existing.termsAccepted),
    kycData: mergedKycData,
    updatedAt: new Date().toISOString(),
  };

  updatedUser.kycLevel = Number(
    updates.kycLevel ?? calculateKycLevel(mergedKycData),
  );
  updatedUser.kycStatus =
    updates.kycStatus || deriveKycStatus(mergedKycData);

  await updateRow(TABLES.USERS, existing.rowId, buildUserUpdates(updatedUser));

  return updatedUser;
}

export async function findStoredUserById(id: string) {
  const row = await getUserById(id);
  return row ? mapSeaTableUser(row) : null;
}

export async function ensureStoredUserForGoogleSession(sessionUser: {
  email?: string | null;
  name?: string | null;
  id?: string | number | null;
}) {
  const email = normalizeEmail(sessionUser.email || "");
  if (!email) return null;

  const existing = await findStoredUserByEmail(email);
  if (existing) return existing;

  const fallbackGoogleId = `google:${email}`;
  const googleId = String(sessionUser.id || fallbackGoogleId).trim() || fallbackGoogleId;

  return upsertGoogleUser({
    name: sessionUser.name || "",
    email,
    googleId,
  });
}
