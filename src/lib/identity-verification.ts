export type VerificationProvider = "dojah" | "custom";

export interface BvnVerificationResult {
  verified: boolean;
  provider: VerificationProvider;
  referenceId?: string;
  firstName?: string;
  lastName?: string;
}

export interface NinVerificationResult {
  verified: boolean;
  provider: VerificationProvider;
  referenceId?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  stateOfOrigin?: string;
}

export interface IdentityVerificationResult {
  verified: boolean;
  provider: VerificationProvider;
  referenceId: string;
}

function safeJsonParse(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getProvider(): VerificationProvider {
  const explicit = String(process.env.KYC_VERIFICATION_PROVIDER || "").trim().toLowerCase();
  if (explicit === "custom") return "custom";
  return "dojah";
}

async function requestJson(url: string, init: RequestInit, timeoutMs = 15000): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });

    const text = await response.text();
    const data = safeJsonParse(text);

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `Provider request failed with status ${response.status}.`);
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function assertDojahConfig() {
  if (!process.env.DOJAH_API_KEY) {
    throw new Error("DOJAH_API_KEY is missing. Configure identity verification provider credentials.");
  }
}

function dojahHeaders(): Record<string, string> {
  assertDojahConfig();
  const headers: Record<string, string> = {
    Authorization: String(process.env.DOJAH_API_KEY),
    "Content-Type": "application/json",
  };

  if (process.env.DOJAH_APP_ID) {
    headers.AppId = String(process.env.DOJAH_APP_ID);
  }

  return headers;
}

function parseDojahIdentity(data: any): { verified: boolean; referenceId?: string; details?: any } {
  const ok = Boolean(data?.entity?.verified ?? data?.status ?? data?.verified);
  const referenceId = String(data?.entity?.reference_id || data?.data?.reference_id || data?.reference_id || "").trim() || undefined;
  return {
    verified: ok,
    referenceId,
    details: data?.entity || data?.data || data,
  };
}

async function verifyBvnWithDojah(bvn: string): Promise<BvnVerificationResult> {
  const data = await requestJson("https://api.dojah.io/api/v1/kyc/bvn", {
    method: "POST",
    headers: dojahHeaders(),
    body: JSON.stringify({ bvn }),
  });

  const parsed = parseDojahIdentity(data);
  if (!parsed.verified) {
    throw new Error("BVN verification failed with provider response.");
  }

  return {
    verified: true,
    provider: "dojah",
    referenceId: parsed.referenceId,
    firstName: parsed.details?.first_name || parsed.details?.firstname,
    lastName: parsed.details?.last_name || parsed.details?.lastname,
  };
}

async function verifyNinWithDojah(nin: string): Promise<NinVerificationResult> {
  const data = await requestJson("https://api.dojah.io/api/v1/kyc/nin", {
    method: "POST",
    headers: dojahHeaders(),
    body: JSON.stringify({ nin }),
  });

  const parsed = parseDojahIdentity(data);
  if (!parsed.verified) {
    throw new Error("NIN verification failed with provider response.");
  }

  return {
    verified: true,
    provider: "dojah",
    referenceId: parsed.referenceId,
    firstName: parsed.details?.first_name || parsed.details?.firstname,
    lastName: parsed.details?.last_name || parsed.details?.lastname,
    dateOfBirth: parsed.details?.dob || parsed.details?.date_of_birth,
    gender: parsed.details?.gender,
    stateOfOrigin: parsed.details?.state_of_origin || parsed.details?.state_of_residence,
  };
}

function assertCustomConfig() {
  if (!process.env.KYC_PROVIDER_BASE_URL) {
    throw new Error("KYC_PROVIDER_BASE_URL is missing for custom verification provider.");
  }
  if (!process.env.KYC_PROVIDER_API_KEY) {
    throw new Error("KYC_PROVIDER_API_KEY is missing for custom verification provider.");
  }
}

function customHeaders(): Record<string, string> {
  assertCustomConfig();
  return {
    Authorization: `Bearer ${String(process.env.KYC_PROVIDER_API_KEY)}`,
    "Content-Type": "application/json",
  };
}

async function verifyWithCustom(path: string, payload: Record<string, unknown>) {
  assertCustomConfig();
  const base = String(process.env.KYC_PROVIDER_BASE_URL).replace(/\/+$/, "");
  return requestJson(`${base}${path}`, {
    method: "POST",
    headers: customHeaders(),
    body: JSON.stringify(payload),
  });
}

async function verifyBvnWithCustom(bvn: string): Promise<BvnVerificationResult> {
  const data = await verifyWithCustom("/verify/bvn", { bvn });
  if (!data?.verified) {
    throw new Error(data?.message || "BVN verification failed with custom provider.");
  }

  return {
    verified: true,
    provider: "custom",
    referenceId: data.referenceId,
    firstName: data.firstName,
    lastName: data.lastName,
  };
}

async function verifyNinWithCustom(nin: string): Promise<NinVerificationResult> {
  const data = await verifyWithCustom("/verify/nin", { nin });
  if (!data?.verified) {
    throw new Error(data?.message || "NIN verification failed with custom provider.");
  }

  return {
    verified: true,
    provider: "custom",
    referenceId: data.referenceId,
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    stateOfOrigin: data.stateOfOrigin,
  };
}

async function verifyIdentityWithCustom(referenceId: string): Promise<IdentityVerificationResult> {
  const data = await verifyWithCustom("/verify/identity", { referenceId });
  if (!data?.verified) {
    throw new Error(data?.message || "Identity verification failed with custom provider.");
  }

  return {
    verified: true,
    provider: "custom",
    referenceId,
  };
}

async function verifyIdentityWithDojah(referenceId: string): Promise<IdentityVerificationResult> {
  const url = String(process.env.DOJAH_IDENTITY_VERIFY_URL || "").trim();
  if (!url) {
    throw new Error("DOJAH_IDENTITY_VERIFY_URL is missing. Configure a strict identity result endpoint.");
  }

  const data = await requestJson(url, {
    method: "POST",
    headers: dojahHeaders(),
    body: JSON.stringify({ referenceId }),
  });

  const parsed = parseDojahIdentity(data);
  if (!parsed.verified) {
    throw new Error("Identity verification failed with provider response.");
  }

  return {
    verified: true,
    provider: "dojah",
    referenceId,
  };
}

export async function verifyBvnExternally(bvn: string): Promise<BvnVerificationResult> {
  const provider = getProvider();
  return provider === "custom"
    ? verifyBvnWithCustom(bvn)
    : verifyBvnWithDojah(bvn);
}

export async function verifyNinExternally(nin: string): Promise<NinVerificationResult> {
  const provider = getProvider();
  return provider === "custom"
    ? verifyNinWithCustom(nin)
    : verifyNinWithDojah(nin);
}

export async function verifyIdentityExternally(referenceId: string): Promise<IdentityVerificationResult> {
  const provider = getProvider();
  return provider === "custom"
    ? verifyIdentityWithCustom(referenceId)
    : verifyIdentityWithDojah(referenceId);
}
