import crypto from "crypto";
import {
  TABLES,
  type STUser,
  deleteRow,
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
  avatarUrl?: string;
  dateOfBirth?: string;
  nin?: string;
  bvn?: string;
  address?: string;
  stateOfOrigin?: string;
  lga?: string;
  gender?: "M" | "F" | "other";
  idType?: string;
  idNumber?: string;
  selfieUrl?: string;
  idDocUrl?: string;
  occupation?: string;
  incomeRange?: string;
  sourceOfFunds?: string;
  privacyMode?: boolean;
  biometric?: boolean;
  notifications?: boolean;
  kycLevel: number;
  kycStatus: "pending" | "incomplete" | "verified";
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
  avatarUrl?: string;
  dateOfBirth?: string;
  nin?: string;
  bvn?: string;
  address?: string;
  stateOfOrigin?: string;
  lga?: string;
  gender?: "M" | "F" | "other";
  idType?: string;
  idNumber?: string;
  selfieUrl?: string;
  idDocUrl?: string;
  occupation?: string;
  incomeRange?: string;
  sourceOfFunds?: string;
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

function parseRilstackUserNumber(userId: string): number {
  const m = /^rilstack(\d+)$/i.exec((userId || "").trim());
  return m ? Number(m[1]) : 0;
}

async function generateNextRilstackUserId(): Promise<string> {
  const rows = await listUsers();
  let max = 0;
  for (const row of rows) {
    max = Math.max(max, parseRilstackUserNumber(row.User_ID || ""));
  }
  return `rilstack${String(max + 1).padStart(3, "0")}`;
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

function deriveKycStatus(kycData: KycData): "pending" | "incomplete" | "verified" {
  if (kycData.identityVerified && kycData.detailsComplete) return "verified";
  if (kycData.detailsComplete) return "pending"; // KYC form submitted, awaiting admin review
  return "incomplete"; // default for new / partially-onboarded users
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

function isMissingColumnError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /no such column/i.test(message);
}

function rowEmail(row: STUser): string {
  return normalizeEmail(String(row.email || row.Email || ""));
}

function rowGoogleId(row: STUser): string {
  return String(row.Google_ID || "").trim();
}

function mapSeaTableUser(row: STUser): StoredUser {
  const kycData = parseKycData(row.KYC_Data_JSON);
  const kycLevel = Number(row.KYC_Level ?? calculateKycLevel(kycData));
  const createdAt = row.Created_At || new Date().toISOString();
  const updatedAt = row.Updated_At || createdAt;

  // Normalise kyc_status: spec uses lowercase; legacy rows may use PascalCase
  const rawStatus = String(row.kyc_status || row.KYC_Status || "").toLowerCase();
  const resolvedKycStatus: "pending" | "incomplete" | "verified" =
    rawStatus === "verified" ? "verified" :
    rawStatus === "pending"  ? "pending"  :
    rawStatus === "incomplete" ? "incomplete" :
    deriveKycStatus(kycData);

  return {
    id: row.User_ID || row._id,
    rowId: row._id,
    name: row.full_name || row.Full_Name || "",
    email: normalizeEmail(row.email || row.Email || ""),
    passwordHash: row.password_hash || row.Password || "",
    phone: row.phone_number || row.Phone || "",
    pinHash: row.PIN_Hash || undefined,
    googleId: row.Google_ID || undefined,
    avatarUrl: row.Avatar_URL || undefined,
    dateOfBirth: row.date_of_birth || row.Date_Of_Birth || undefined,
    nin: row.nin || row.NIN || undefined,
    bvn: row.bvn || row.BVN || undefined,
    address: row.address || row.Address || undefined,
    stateOfOrigin: row.State || undefined,
    lga: row.LGA || kycData.lga || undefined,
    gender: row.Gender,
    idType: row.ID_Type || kycData.idType || undefined,
    idNumber: row.ID_Number || kycData.idNumber || undefined,
    selfieUrl: row.Selfie_URL || kycData.selfieName || undefined,
    idDocUrl: row.ID_Doc_URL || kycData.idPhotoName || undefined,
    occupation: row.occupation || row.Occupation || kycData.occupation || undefined,
    incomeRange: row.income_range || row.Income_Range || kycData.income || undefined,
    sourceOfFunds: row.Source_of_Funds || kycData.source || undefined,
    privacyMode: parseSeatableBool(row.Privacy_Mode),
    biometric: parseSeatableBool(row.Biometric),
    notifications: parseSeatableBool(row.Notifications),
    kycLevel,
    kycStatus: resolvedKycStatus,
    termsAccepted: parseSeatableBool(row.Terms_Accepted),
    authProvider: row.Auth_Provider || (row.Google_ID ? "google" : "credentials"),
    loginCount: Number(row.login_count ?? row.Login_Count ?? 0),
    lastLogin: row.last_login || row.Last_Login || "",
    kycData,
    createdAt,
    updatedAt,
  };
}

function buildUserUpdates(user: StoredUser): Record<string, unknown> {
  return {
    // Spec-defined lowercase columns
    full_name: user.name,
    email: user.email,
    phone_number: user.phone,
    password_hash: user.passwordHash,
    kyc_status: user.kycStatus,
    date_of_birth: user.dateOfBirth || "",
    bvn: user.bvn || "",
    nin: user.nin || "",
    address: user.address || "",
    occupation: user.occupation || "",
    income_range: user.incomeRange || "",
    last_login: user.lastLogin,
    login_count: user.loginCount,
    // Legacy columns kept in sync to support existing SeaTable schemas
    Full_Name: user.name,
    Email: user.email,
    Phone: user.phone,
    Password: user.passwordHash,
    KYC_Status: user.kycStatus === "verified" ? "Verified" : "Pending",
    Date_Of_Birth: user.dateOfBirth || "",
    BVN: user.bvn || "",
    NIN: user.nin || "",
    Address: user.address || "",
    Occupation: user.occupation || "",
    Income_Range: user.incomeRange || "",
    Last_Login: user.lastLogin,
    Login_Count: user.loginCount,
    // Extended / legacy columns
    PIN_Hash: user.pinHash || "",
    Google_ID: user.googleId || "",
    Avatar_URL: user.avatarUrl || "",
    State: user.stateOfOrigin || "",
    LGA: user.lga || "",
    ID_Type: user.idType || "",
    ID_Number: user.idNumber || "",
    Selfie_URL: user.selfieUrl || "",
    ID_Doc_URL: user.idDocUrl || "",
    Source_of_Funds: user.sourceOfFunds || "",
    Privacy_Mode: user.privacyMode ? "true" : "false",
    Biometric: user.biometric ? "true" : "false",
    Notifications: user.notifications ? "true" : "false",
    Is_Active: "true",
    Gender: user.gender || "",
    KYC_Level: user.kycLevel,
    KYC_Data_JSON: JSON.stringify(user.kycData),
    Terms_Accepted: user.termsAccepted ? "true" : "false",
    Auth_Provider: user.authProvider,
    Created_At: user.createdAt,
    Updated_At: user.updatedAt,
  };
}

async function updateUserRecord(rowId: string, user: StoredUser): Promise<void> {
  await updateRow(TABLES.USERS, rowId, buildUserUpdates(user));
}

async function insertUserRecord(user: StoredUser): Promise<Record<string, unknown>> {
  return insertRow(TABLES.USERS, {
    User_ID: user.id,
    ...buildUserUpdates(user),
  });
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
  const normalized = normalizeEmail(email);

  const consolidated = await consolidateUsersByEmail(normalized);
  if (consolidated) return consolidated;

  const row = await getUserByEmail(normalized);
  if (row) return mapSeaTableUser(row);

  // Fallback: handle historical rows where Email casing differs.
  const rows = await listUsers();
  const found = rows.find((r) => rowEmail(r) === normalized);
  return found ? mapSeaTableUser(found) : null;
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

// ---------------------------------------------------------------------------
// Per-email Google upsert lock — reduces duplicate rows from concurrent OAuth
// callback requests within a single runtime instance.
// ---------------------------------------------------------------------------
const _googleUpsertLocks = new Map<string, Promise<void>>();

function withGoogleUpsertLock<T>(email: string, fn: () => Promise<T>): Promise<T> {
  const prev = _googleUpsertLocks.get(email) ?? Promise.resolve();
  let resolve!: () => void;
  const next = new Promise<void>((r) => { resolve = r; });
  _googleUpsertLocks.set(email, next);
  return prev.then(fn).finally(() => {
    resolve();
    if (_googleUpsertLocks.get(email) === next) _googleUpsertLocks.delete(email);
  });
}

function pickText(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    const v = (value || "").trim();
    if (v) return v;
  }
  return undefined;
}

function mergeUsers(canonical: StoredUser, duplicates: StoredUser[], normalizedEmail: string, googleId: string): StoredUser {
  const all = [canonical, ...duplicates];
  const now = new Date().toISOString();

  const mergedKycData: KycData = all.reduce((acc, u) => ({
    ...acc,
    ...u.kycData,
    emailVerified: acc.emailVerified || u.kycData.emailVerified,
    bvnVerified: acc.bvnVerified || u.kycData.bvnVerified,
    ninVerified: acc.ninVerified || u.kycData.ninVerified,
    identityVerified: acc.identityVerified || u.kycData.identityVerified,
    detailsComplete: acc.detailsComplete || u.kycData.detailsComplete,
  }), defaultKycData());

  const merged: StoredUser = {
    ...canonical,
    email: normalizedEmail,
    googleId: googleId || pickText(canonical.googleId, ...duplicates.map((u) => u.googleId)),
    name: pickText(canonical.name, ...duplicates.map((u) => u.name)) || canonical.name,
    passwordHash: pickText(canonical.passwordHash, ...duplicates.map((u) => u.passwordHash)) || canonical.passwordHash,
    phone: pickText(canonical.phone, ...duplicates.map((u) => u.phone)) || canonical.phone,
    pinHash: pickText(canonical.pinHash, ...duplicates.map((u) => u.pinHash)),
    avatarUrl: pickText(canonical.avatarUrl, ...duplicates.map((u) => u.avatarUrl)),
    dateOfBirth: pickText(canonical.dateOfBirth, ...duplicates.map((u) => u.dateOfBirth)),
    nin: pickText(canonical.nin, ...duplicates.map((u) => u.nin)),
    bvn: pickText(canonical.bvn, ...duplicates.map((u) => u.bvn)),
    address: pickText(canonical.address, ...duplicates.map((u) => u.address)),
    stateOfOrigin: pickText(canonical.stateOfOrigin, ...duplicates.map((u) => u.stateOfOrigin)),
    lga: pickText(canonical.lga, ...duplicates.map((u) => u.lga)),
    gender: canonical.gender || duplicates.find((u) => u.gender)?.gender,
    idType: pickText(canonical.idType, ...duplicates.map((u) => u.idType)),
    idNumber: pickText(canonical.idNumber, ...duplicates.map((u) => u.idNumber)),
    selfieUrl: pickText(canonical.selfieUrl, ...duplicates.map((u) => u.selfieUrl)),
    idDocUrl: pickText(canonical.idDocUrl, ...duplicates.map((u) => u.idDocUrl)),
    occupation: pickText(canonical.occupation, ...duplicates.map((u) => u.occupation)),
    incomeRange: pickText(canonical.incomeRange, ...duplicates.map((u) => u.incomeRange)),
    sourceOfFunds: pickText(canonical.sourceOfFunds, ...duplicates.map((u) => u.sourceOfFunds)),
    authProvider: canonical.authProvider === "google" || duplicates.some((u) => u.authProvider === "google") ? "google" : canonical.authProvider,
    termsAccepted: canonical.termsAccepted || duplicates.some((u) => u.termsAccepted),
    loginCount: all.reduce((sum, u) => sum + (u.loginCount ?? 0), 0),
    lastLogin: pickText(canonical.lastLogin, ...duplicates.map((u) => u.lastLogin)) || canonical.lastLogin,
    kycData: mergedKycData,
    updatedAt: now,
  };

  merged.kycLevel = calculateKycLevel(merged.kycData);
  merged.kycStatus = deriveKycStatus(merged.kycData);
  return merged;
}

function userRank(user: StoredUser, normalizedEmail: string, googleId: string): number {
  let score = 0;
  if (user.email === normalizedEmail) score += 100;
  if ((user.googleId || "") === googleId) score += 80;
  if (user.pinHash) score += 30;
  if (user.phone) score += 20;
  if (user.bvn || user.nin) score += 20;
  score += Number(user.kycLevel || 0) * 10;
  score += Number(user.loginCount || 0);
  return score;
}

function rankByEmail(user: StoredUser, normalizedEmail: string): number {
  let score = 0;
  if (user.email === normalizedEmail) score += 100;
  if (user.pinHash) score += 30;
  if (user.phone) score += 20;
  if (user.bvn || user.nin) score += 20;
  score += Number(user.kycLevel || 0) * 10;
  score += Number(user.loginCount || 0);
  return score;
}

async function consolidateUsersByEmail(normalizedEmail: string): Promise<StoredUser | null> {
  const rows = (await listUsers()).filter((row) => rowEmail(row) === normalizedEmail);
  if (!rows.length) return null;

  const users = rows.map(mapSeaTableUser);
  users.sort((a, b) => rankByEmail(b, normalizedEmail) - rankByEmail(a, normalizedEmail));

  const canonical = users[0];
  const duplicates = users.slice(1);
  if (!duplicates.length) return canonical;

  const fallbackGoogleId =
    canonical.googleId || duplicates.find((u) => u.googleId)?.googleId || `google:${normalizedEmail}`;

  const merged = mergeUsers(canonical, duplicates, normalizedEmail, fallbackGoogleId);
  await updateUserRecord(canonical.rowId, merged);

  for (const duplicate of duplicates) {
    if (duplicate.rowId === canonical.rowId) continue;
    try {
      await deleteRow(TABLES.USERS, duplicate.rowId);
    } catch {
      // Best-effort cleanup.
    }
  }

  return merged;
}

async function consolidateUsersByIdentity(normalizedEmail: string, googleId: string): Promise<StoredUser | null> {
  const rows = (await listUsers()).filter(
    (row) => rowEmail(row) === normalizedEmail || rowGoogleId(row) === googleId,
  );
  if (!rows.length) return null;

  const users = rows.map(mapSeaTableUser);
  users.sort((a, b) => userRank(b, normalizedEmail, googleId) - userRank(a, normalizedEmail, googleId));

  const canonical = users[0];
  const duplicates = users.slice(1);

  const merged = mergeUsers(canonical, duplicates, normalizedEmail, googleId);
  await updateUserRecord(canonical.rowId, merged);

  for (const duplicate of duplicates) {
    if (duplicate.rowId === canonical.rowId) continue;
    try {
      await deleteRow(TABLES.USERS, duplicate.rowId);
    } catch {
      // Continue even if one duplicate row cannot be deleted.
    }
  }

  return merged;
}

async function findGoogleAuthCandidate(email: string, googleId: string): Promise<StoredUser | null> {
  const rows = (await listUsers()).filter(
    (row) => rowEmail(row) === email || rowGoogleId(row) === googleId,
  );
  if (!rows.length) return null;

  // Prefer the strongest match first: exact email + googleId, then email, then googleId.
  const ranked = rows.sort((a, b) => {
    const rank = (row: STUser) => {
      const emailMatch = rowEmail(row) === email;
      const googleMatch = rowGoogleId(row) === googleId;
      if (emailMatch && googleMatch) return 3;
      if (emailMatch) return 2;
      if (googleMatch) return 1;
      return 0;
    };
    return rank(b) - rank(a);
  });

  return mapSeaTableUser(ranked[0]);
}

export async function createStoredUser(input: CreateStoredUserInput) {
  const normalizedEmail = normalizeEmail(input.email);
  return withSignupLock(normalizedEmail, async () => {
    const existing = await findStoredUserByEmail(normalizedEmail);
    if (existing) {
      const mergedKycData: KycData = {
        ...existing.kycData,
        ...(input.kycData || {}),
      };
      const nowExisting = new Date().toISOString();
      const updatedExisting: StoredUser = {
        ...existing,
        name: input.name.trim() || existing.name,
        email: normalizedEmail,
        passwordHash: existing.passwordHash || hashPassword(input.password),
        phone: normalizePhone(input.phone || existing.phone || ""),
        pinHash: input.pin ? hashPin(input.pin) : existing.pinHash,
        googleId: input.googleId || existing.googleId,
        avatarUrl: input.avatarUrl || existing.avatarUrl,
        dateOfBirth: input.dateOfBirth || existing.dateOfBirth,
        nin: input.nin?.trim() || existing.nin,
        bvn: input.bvn?.trim() || existing.bvn,
        address: input.address?.trim() || existing.address,
        stateOfOrigin: input.stateOfOrigin?.trim() || existing.stateOfOrigin,
        lga: input.lga?.trim() || existing.lga,
        gender: input.gender || existing.gender,
        idType: input.idType?.trim() || existing.idType,
        idNumber: input.idNumber?.trim() || existing.idNumber,
        selfieUrl: input.selfieUrl || existing.selfieUrl,
        idDocUrl: input.idDocUrl || existing.idDocUrl,
        occupation: input.occupation?.trim() || existing.occupation,
        incomeRange: input.incomeRange?.trim() || existing.incomeRange,
        sourceOfFunds: input.sourceOfFunds?.trim() || existing.sourceOfFunds,
        termsAccepted: Boolean(input.termsAccepted ?? existing.termsAccepted),
        authProvider: input.authProvider || existing.authProvider,
        kycData: mergedKycData,
        updatedAt: nowExisting,
      };
      updatedExisting.kycLevel = calculateKycLevel(updatedExisting.kycData);
      updatedExisting.kycStatus = deriveKycStatus(updatedExisting.kycData);

      await updateUserRecord(existing.rowId, updatedExisting);
      return updatedExisting;
    }

  const now = new Date().toISOString();
  const mergedKycData: KycData = {
    ...defaultKycData(),
    ...(input.kycData || {}),
  };
  const kycLevel = calculateKycLevel(mergedKycData);
  const loginCount = 1;
  const generatedUserId = await generateNextRilstackUserId();

  const user: StoredUser = {
    id: generatedUserId,
    rowId: "",
    name: input.name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(input.password),
    phone: normalizePhone(input.phone || ""),
    pinHash: input.pin ? hashPin(input.pin) : undefined,
    googleId: input.googleId || undefined,
    avatarUrl: input.avatarUrl || undefined,
    dateOfBirth: input.dateOfBirth || undefined,
    nin: input.nin?.trim() || undefined,
    bvn: input.bvn?.trim() || undefined,
    address: input.address?.trim() || undefined,
    stateOfOrigin: input.stateOfOrigin?.trim() || undefined,
    lga: input.lga?.trim() || undefined,
    gender: input.gender,
    idType: input.idType?.trim() || undefined,
    idNumber: input.idNumber?.trim() || undefined,
    selfieUrl: input.selfieUrl || undefined,
    idDocUrl: input.idDocUrl || undefined,
    occupation: input.occupation?.trim() || undefined,
    incomeRange: input.incomeRange?.trim() || undefined,
    sourceOfFunds: input.sourceOfFunds?.trim() || undefined,
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

  const row = await insertUserRecord(user);

    const created = {
      ...user,
      rowId: String((row as { _id?: string })._id || user.id),
    };

    // In case a concurrent insert happened, immediately collapse to one row.
    const consolidated = await consolidateUsersByEmail(normalizedEmail);
    return consolidated ?? created;
  });
}

export async function upsertGoogleUser(input: {
  name: string;
  email: string;
  googleId: string;
}) {
  const normalizedEmail = normalizeEmail(input.email);
  return withGoogleUpsertLock(normalizedEmail, async () => {
    const consolidated = await consolidateUsersByIdentity(normalizedEmail, input.googleId);
    if (consolidated) {
      const now = new Date().toISOString();
      const merged: StoredUser = {
        ...consolidated,
        name: consolidated.name || input.name,
        email: normalizedEmail,
        googleId: input.googleId,
        authProvider: "google",
        loginCount: (consolidated.loginCount ?? 0) + 1,
        lastLogin: now,
        kycData: {
          ...consolidated.kycData,
          emailVerified: true,
        },
        updatedAt: now,
      };
      merged.kycLevel = calculateKycLevel(merged.kycData);
      merged.kycStatus = deriveKycStatus(merged.kycData);
      await updateUserRecord(consolidated.rowId, merged);
      return merged;
    }

    const existing =
      (await findGoogleAuthCandidate(normalizedEmail, input.googleId)) ||
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

    await updateUserRecord(existing.rowId, updated);
    return updated;
  });
}

/**
 * Increment Login_Count and stamp Last_Login for any sign-in.
 * Call this from the credentials authorize callback after password verify.
 */
export async function recordUserLogin(email: string): Promise<void> {
  const user = await findStoredUserByEmail(email);
  if (!user) return;
  const now = new Date().toISOString();
  try {
    await updateRow(TABLES.USERS, user.rowId, {
      login_count: (user.loginCount ?? 0) + 1,
      last_login: now,
      Updated_At: now,
    });
  } catch (err) {
    if (!isMissingColumnError(err)) throw err;
    await updateRow(TABLES.USERS, user.rowId, {
      Login_Count: (user.loginCount ?? 0) + 1,
      Last_Login: now,
      Updated_At: now,
    });
  }
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
  const normalized = normalizeEmail(email);
  const existing =
    (await consolidateUsersByEmail(normalized)) ||
    (await findStoredUserByEmail(normalized));
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
    lga: updates.lga ?? existing.lga,
    idType: updates.idType ?? existing.idType,
    idNumber: updates.idNumber ?? existing.idNumber,
    selfieUrl: updates.selfieUrl ?? existing.selfieUrl,
    idDocUrl: updates.idDocUrl ?? existing.idDocUrl,
    occupation: updates.occupation ?? existing.occupation,
    incomeRange: updates.incomeRange ?? existing.incomeRange,
    sourceOfFunds: updates.sourceOfFunds ?? existing.sourceOfFunds,
    termsAccepted: Boolean(updates.termsAccepted ?? existing.termsAccepted),
    kycData: mergedKycData,
    updatedAt: new Date().toISOString(),
  };

  updatedUser.kycLevel = Number(
    updates.kycLevel ?? calculateKycLevel(mergedKycData),
  );
  updatedUser.kycStatus =
    updates.kycStatus || deriveKycStatus(mergedKycData);

  await updateUserRecord(existing.rowId, updatedUser);

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
