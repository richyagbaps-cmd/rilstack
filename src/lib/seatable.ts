/**
 * SeaTable client for Rilstack
 * All amounts stored in KOBO (integer). Divide by 100 for Naira display.
 *
 * Table names must match exactly what you create in SeaTable.
 */

const SEATABLE_SERVER = (
  process.env.SEATABLE_SERVER ||
  process.env.SEATABLE_BASE_URL ||
  "https://cloud.seatable.io"
).replace(/\/+$/, "");
const SEATABLE_API_TOKEN = process.env.SEATABLE_API_TOKEN || "";
const SEATABLE_WORKSPACE_ID =
  process.env.SEATABLE_WORKSPACE_ID || process.env.SEATABLE_WORKSPACE || "";
const SEATABLE_BASE_NAME =
  process.env.SEATABLE_BASE_NAME || process.env.SEATABLE_DTABLE_NAME || "";

function assertSeatableConfig() {
  if (!SEATABLE_API_TOKEN) {
    throw new Error(
      "SeaTable configuration missing: SEATABLE_API_TOKEN. " +
        "Set this environment variable in Vercel Project Settings.",
    );
  }
}

function isUuidLikeToken(token: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
}

async function getBaseTokenFromDtableApiToken(apiToken: string): Promise<{ token: string; dtable: string; server: string }> {
  const url = `${SEATABLE_SERVER}/api/v2.1/dtable/app-access-token/`;

  const res = await fetch(url, {
    headers: { Authorization: `Token ${apiToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`dtable-token auth failed (${res.status}): ${text.replace(/\s+/g, " ").slice(0, 240)}`);
  }

  const data = await res.json();
  const server = (data.use_api_gateway && data.dtable_server)
    ? (data.dtable_server as string).replace(/\/+$/, "")
    : `${SEATABLE_SERVER}/api-gateway`;

  return {
    token: data.access_token as string,
    dtable: data.dtable_uuid as string,
    server,
  };
}

async function getBaseTokenFromAccountToken(
  apiToken: string,
  workspaceId: string,
  baseName: string,
): Promise<{ token: string; dtable: string; server: string }> {
  if (!workspaceId || !baseName) {
    throw new Error("account-token auth requires SEATABLE_WORKSPACE_ID and SEATABLE_BASE_NAME");
  }

  const url =
    `${SEATABLE_SERVER}/api/v2.1/workspace/${encodeURIComponent(workspaceId)}` +
    `/dtable/${encodeURIComponent(baseName)}/access-token/?exp=3d`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`account-token auth failed (${res.status}): ${text.replace(/\s+/g, " ").slice(0, 240)}`);
  }

  const data = await res.json();
  return {
    token: data.access_token as string,
    dtable: data.dtable_uuid as string,
    server: `${SEATABLE_SERVER}/api-gateway`,
  };
}

// Table names  must match your SeaTable base exactly
export const TABLES = {
  USERS:               "Users",
  KYC_DOCUMENTS:       "KYC_Documents",
  BUDGETS:             "Budgets",
  SAVINGS_GOALS:       "Savings_Goals",
  INVESTMENTS:         "Investments",
  TRANSACTIONS:        "Transactions",
  INVESTMENT_PRODUCTS: "Investment_Products",
  ADMIN_LOG:           "Admin_Log",
  SUPPORT_TICKETS:     "Support_Tickets",
  WALLETS:             "Wallets",
  WALLET_TRANSACTIONS: "Wallet_Transactions",
  PAYOUT_RECIPIENTS:   "Payout_Recipients",
} as const;

let _token: string | null = null;
let _dtable: string | null = null;
let _dtableServer: string | null = null;
let _tokenExpiry = 0;

/**
 * Obtain a Base Access Token via the base API token endpoint.
 * Cached locally for 2 days 23 hours to avoid using an expired token.
 */
export async function getBaseToken(
  apiToken = SEATABLE_API_TOKEN,
): Promise<{ token: string; dtable: string }> {
  assertSeatableConfig();

  const now = Date.now();
  if (_token && _dtable && now < _tokenExpiry) {
    return { token: _token, dtable: _dtable };
  }

  const first = isUuidLikeToken(apiToken)
    ? () => getBaseTokenFromAccountToken(apiToken, SEATABLE_WORKSPACE_ID, SEATABLE_BASE_NAME)
    : () => getBaseTokenFromDtableApiToken(apiToken);
  const second = isUuidLikeToken(apiToken)
    ? () => getBaseTokenFromDtableApiToken(apiToken)
    : () => getBaseTokenFromAccountToken(apiToken, SEATABLE_WORKSPACE_ID, SEATABLE_BASE_NAME);

  let auth: { token: string; dtable: string; server: string };
  try {
    auth = await first();
  } catch (firstErr) {
    try {
      auth = await second();
    } catch (secondErr) {
      const firstMsg = firstErr instanceof Error ? firstErr.message : String(firstErr);
      const secondMsg = secondErr instanceof Error ? secondErr.message : String(secondErr);
      throw new Error(`SeaTable auth failed. Tried both token modes. First: ${firstMsg}. Second: ${secondMsg}`);
    }
  }

  _token = auth.token;
  _dtable = auth.dtable;
  _dtableServer = auth.server;
  // Cache for slightly less than 3 days so the token is always fresh
  _tokenExpiry = now + (3 * 24 * 60 - 5) * 60 * 1000;
  return { token: _token, dtable: _dtable };
}

/** Internal alias kept for all existing callers inside this file */
const getAccessToken = getBaseToken;

/** Returns the server base URL to use for API calls (may be the API gateway) */
function apiServer(): string {
  return _dtableServer ?? SEATABLE_SERVER;
}

/** Build URL for SeaTable SQL endpoint */
async function sqlUrl(): Promise<string> {
  const { dtable } = await getAccessToken();
  return `${apiServer()}/api/v2/dtables/${dtable}/sql/`;
}

/** Execute a SQL query against SeaTable */
export async function query<T = Record<string, unknown>>(
  sql: string,
  convert = true,
): Promise<T[]> {
  try {
    const { token } = await getAccessToken();
    const url = await sqlUrl();
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql }),
    });
    const data = await res.json();
    if (!res.ok || data.error_message || data.error_msg) {
      throw new Error(data.error_message || data.error_msg || `SeaTable query error: ${res.status}`);
    }
    return (data.results ?? data.rows ?? []) as T[];
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`SQL query failed: ${msg}`);
  }
}

/** Insert a row into a table via the REST API (not SQL) */
export async function insertRow(
  tableName: string,
  row: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  try {
    const { token, dtable } = await getAccessToken();
    const res = await fetch(
      `${apiServer()}/api/v2/dtables/${dtable}/rows/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ table_name: tableName, rows: [row] }),
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_message || data.error_msg || "SeaTable insert failed");
    return (data.first_row ?? data) as Record<string, unknown>;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Insert into ${tableName} failed: ${msg}`);
  }
}

/** Update a row by its SeaTable row_id */
export async function updateRow(
  tableName: string,
  rowId: string,
  updates: Record<string, unknown>,
): Promise<void> {
  try {
    const { token, dtable } = await getAccessToken();
    const res = await fetch(
      `${apiServer()}/api/v2/dtables/${dtable}/rows/`,
      {
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table_name: tableName,
          updates: [{ row_id: rowId, row: updates }],
        }),
      },
    );
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error_message || data.error_msg || "SeaTable update failed");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Update in ${tableName} (row ${rowId}) failed: ${msg}`);
  }
}

/** Delete a row by its SeaTable row_id */
export async function deleteRow(tableName: string, rowId: string): Promise<void> {
  try {
    const { token, dtable } = await getAccessToken();
    const res = await fetch(
      `${apiServer()}/api/v2/dtables/${dtable}/rows/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ table_name: tableName, row_ids: [rowId] }),
      },
    );
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error_message || data.error_msg || "SeaTable delete failed");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Delete from ${tableName} (row ${rowId}) failed: ${msg}`);
  }
}

// ---------------------------------------------------------------------------
// Typed helpers per table
// ---------------------------------------------------------------------------

/**
 * Actual SeaTable Users table columns (lowercase as defined in the base schema).
 * Spec-defined columns use lowercase snake_case. Legacy/extended columns retain their
 * original casing and are treated as optional extras.
 */
export type STUser = {
  _id: string;
  // Spec-defined columns (lowercase — actual SeaTable column names)
  email?: string;
  full_name?: string;
  phone_number?: string;
  password_hash?: string;      // bcrypt hash
  kyc_status?: "pending" | "incomplete" | "verified";
  date_of_birth?: string;
  state_of_origin?: string;
  lga?: string;
  id_type?: string;
  id_number?: string;
  selfie_url?: string;
  id_doc_url?: string;
  bvn?: string;
  nin?: string;
  address?: string;
  occupation?: string;
  income_range?: string;
  source_of_funds?: string;
  last_login?: string;
  login_count?: number;
  // Extended / legacy columns (may or may not exist in the base)
  User_ID?: string;            // custom rilstack001 identifier
  Google_ID?: string;
  Avatar_URL?: string;
  PIN_Hash?: string;
  State?: string;
  LGA?: string;
  ID_Type?: string;
  ID_Number?: string;
  Selfie_URL?: string;
  ID_Doc_URL?: string;
  Source_of_Funds?: string;
  Privacy_Mode?: boolean;
  Biometric?: boolean;
  Notifications?: boolean;
  Is_Active?: boolean;
  Gender?: "M" | "F" | "other";
  KYC_Level?: number;
  KYC_Data_JSON?: string;
  Terms_Accepted?: boolean;
  Auth_Provider?: "credentials" | "google";
  Created_At?: string;
  Updated_At?: string;
  // Legacy columns (older SeaTable schema)
  Email?: string;
  Full_Name?: string;
  Phone?: string;
  Password?: string;
  KYC_Status?: "Pending" | "Verified" | "Rejected";
  Date_Of_Birth?: string;
  BVN?: string;
  NIN?: string;
  Address?: string;
  Occupation?: string;
  Income_Range?: string;
  Last_Login?: string;
  Login_Count?: number;
};

/** KYC_Documents table row */
export type STKycDocument = {
  _id: string;
  user_email: string;
  document_type: "selfie" | "id_card";
  document_url: string;
  uploaded_at: string;
};

export type STBudget = {
  _id: string;
  Budget_ID: string;
  User_ID: string;
  Type: "strict" | "relaxed";
  Budget_Style: "50_30_20" | "zero_based" | "custom";
  Start_Date: string;
  End_Date: string;
  Total_Income: number;
  Total_Allocated: number;
  Total_Spent: number;
  Status: "active" | "completed";
  Categories: string; // JSON string
  Spending_Window?: "daily" | "weekly" | "monthly";
};

export type STSavingsGoal = {
  _id: string;
  Goal_ID: string;
  User_ID: string;
  Name: string;
  Target_Amount: number;
  Current_Amount: number;
  Due_Date?: string;
  Type: "personal" | "team" | "retirement";
  Safe_Locks?: string; // JSON string
  Interest_Accrued_Total?: number;
  Last_Interest_Date?: string;
};

export type STInvestment = {
  _id: string;
  Investment_ID: string;
  User_ID: string;
  Product_ID: string;
  Units: number;
  Amount_Invested: number;
  Expected_Return_Total: number;
  Start_Date: string;
  Expected_End_Date: string;
  Status: "active" | "matured" | "withdrawn_early";
  Actual_Return?: number;
  Accrued_Interest?: number;
  Penalty_Amount?: number;
};

export type STTransaction = {
  _id: string;
  Transaction_ID: string;
  User_ID: string;
  Type: string;
  Amount: number;
  Fee?: number;
  Net_Effect: number;
  Balance_After: number;
  Category_Or_Goal?: string;
  Reference_ID?: string;
};

export type STProduct = {
  _id: string;
  Product_ID: string;
  Name: string;
  Description?: string;
  Unit_Amount: number;
  Total_Units_Available: number;
  Tenor_Days: number;
  Is_Flexible?: boolean;
  Return_Rate_Percent: number;
  Return_Type: "fixed_at_maturity" | "daily_interest";
  Early_Withdrawal_Penalty_Percent?: number;
  Risk_Level?: "Low" | "Medium" | "High";
  Is_Active?: boolean;
};

export type STTicket = {
  _id: string;
  Ticket_ID: string;
  User_ID: string;
  Type: "support" | "fraud";
  Subject: string;
  Description: string;
  Status: "open" | "in_progress" | "resolved" | "closed";
  Priority: "low" | "normal" | "high";
};

// ---------------------------------------------------------------------------
// Convenience query helpers
// ---------------------------------------------------------------------------

/** kobo -> naira (2 decimal places) */
export const koboToNaira = (k: number) => k / 100;
/** naira -> kobo */
export const nairaToKobo = (n: number) => Math.round(n * 100);

function isMissingColumnError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /no such column/i.test(message);
}

export async function getUserByEmail(email: string): Promise<STUser | null> {
  const safeEmail = email.replace(/'/g, "''");
  try {
    const rows = await query<STUser>(
      `SELECT * FROM ${TABLES.USERS} WHERE email='${safeEmail}' LIMIT 1`,
    );
    return rows[0] ?? null;
  } catch (err) {
    if (!isMissingColumnError(err)) throw err;
    const rows = await query<STUser>(
      `SELECT * FROM ${TABLES.USERS} WHERE Email='${safeEmail}' LIMIT 1`,
    );
    return rows[0] ?? null;
  }
}

export async function getUserById(userId: string): Promise<STUser | null> {
  // Try by custom User_ID first, then by SeaTable row _id
  const byUserId = await query<STUser>(
    `SELECT * FROM ${TABLES.USERS} WHERE User_ID='${userId.replace(/'/g, "''")}' LIMIT 1`,
  ).catch(() => [] as STUser[]);
  if (byUserId[0]) return byUserId[0];
  const byRowId = await query<STUser>(
    `SELECT * FROM ${TABLES.USERS} WHERE _id='${userId.replace(/'/g, "''")}' LIMIT 1`,
  ).catch(() => [] as STUser[]);
  return byRowId[0] ?? null;
}

export async function getUserByPhone(phone: string): Promise<STUser | null> {
  const safePhone = phone.replace(/'/g, "''");
  try {
    const rows = await query<STUser>(
      `SELECT * FROM ${TABLES.USERS} WHERE phone_number='${safePhone}' LIMIT 1`,
    );
    return rows[0] ?? null;
  } catch (err) {
    if (!isMissingColumnError(err)) throw err;
    const rows = await query<STUser>(
      `SELECT * FROM ${TABLES.USERS} WHERE Phone='${safePhone}' LIMIT 1`,
    );
    return rows[0] ?? null;
  }
}

export async function listUsers(): Promise<STUser[]> {
  return query<STUser>(
    `SELECT * FROM ${TABLES.USERS}`,
  );
}

export async function getBudgetsByUser(userId: string): Promise<STBudget[]> {
  return query<STBudget>(
    `SELECT * FROM ${TABLES.BUDGETS} WHERE User_ID='${userId}' ORDER BY Start_Date DESC`,
  );
}

export async function getActiveBudget(userId: string): Promise<STBudget | null> {
  const rows = await query<STBudget>(
    `SELECT * FROM ${TABLES.BUDGETS} WHERE User_ID='${userId}' AND Status='active' LIMIT 1`,
  );
  return rows[0] ?? null;
}

export async function getSavingsGoalsByUser(userId: string): Promise<STSavingsGoal[]> {
  return query<STSavingsGoal>(
    `SELECT * FROM ${TABLES.SAVINGS_GOALS} WHERE User_ID='${userId}'`,
  );
}

export async function getInvestmentsByUser(userId: string): Promise<STInvestment[]> {
  return query<STInvestment>(
    `SELECT * FROM ${TABLES.INVESTMENTS} WHERE User_ID='${userId}'`,
  );
}

export async function getTransactionsByUser(
  userId: string,
  limit = 20,
): Promise<STTransaction[]> {
  return query<STTransaction>(
    `SELECT * FROM ${TABLES.TRANSACTIONS} WHERE User_ID='${userId}' ORDER BY Timestamp DESC LIMIT ${limit}`,
  );
}

export async function getActiveProducts(): Promise<STProduct[]> {
  return query<STProduct>(
    `SELECT * FROM ${TABLES.INVESTMENT_PRODUCTS} WHERE Is_Active=1`,
  );
}

export async function logTransaction(tx: Omit<STTransaction, "_id">): Promise<void> {
  await insertRow(TABLES.TRANSACTIONS, tx as Record<string, unknown>);
}
