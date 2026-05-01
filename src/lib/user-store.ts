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
    termsAccepted: Boolean(row.Terms_Accepted),
    authProvider: row.Auth_Provider || (row.Google_ID ? "google" : "credentials"),
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
    Privacy_Mode_Enabled: false,
    Is_Active: true,
    Date_Of_Birth: user.dateOfBirth || "",
    NIN: user.nin || "",
    BVN: user.bvn || "",
    Address: user.address || "",
    State_Of_Origin: user.stateOfOrigin || "",
    Gender: user.gender || "",
    KYC_Level: user.kycLevel,
    KYC_Data_JSON: JSON.stringify(user.kycData),
    Terms_Accepted: user.termsAccepted,
    Auth_Provider: user.authProvider,
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

export async function createStoredUser(input: CreateStoredUserInput) {
  const normalizedEmail = normalizeEmail(input.email);
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

  const updated: StoredUser = {
    ...existing,
    name: existing.name || input.name,
    googleId: input.googleId,
    authProvider: "google",
    kycData: {
      ...existing.kycData,
      emailVerified: true,
    },
    updatedAt: new Date().toISOString(),
  };
  updated.kycLevel = calculateKycLevel(updated.kycData);
  updated.kycStatus = deriveKycStatus(updated.kycData);

  await updateRow(TABLES.USERS, existing.rowId, buildUserUpdates(updated));
  return updated;
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
