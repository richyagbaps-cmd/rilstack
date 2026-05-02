export function isExpressBackendEnabled(): boolean {
  return String(process.env.USE_EXPRESS_AUTH_BACKEND || "").toLowerCase() === "true" &&
    Boolean(String(process.env.EXPRESS_BACKEND_URL || "").trim());
}

export function getExpressBackendBaseUrl(): string {
  const base = String(process.env.EXPRESS_BACKEND_URL || "").trim();
  if (!base) {
    throw new Error("EXPRESS_BACKEND_URL is not configured");
  }
  return base.replace(/\/+$/, "");
}

export async function expressJsonRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ status: number; ok: boolean; data: T }> {
  const url = `${getExpressBackendBaseUrl()}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  return { status: response.status, ok: response.ok, data: data as T };
}
