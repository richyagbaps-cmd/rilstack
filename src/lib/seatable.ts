/**
 * SeaTable client for Rilstack
 * All amounts stored in KOBO (integer). Divide by 100 for Naira display.
 *
 * Table names must match exactly what you create in SeaTable.
 */

const SEATABLE_SERVER = "https://cloud.seatable.io";
const SEATABLE_TOKEN = process.env.SEATABLE_API_TOKEN!;

// Table names — must match your SeaTable base exactly
export const TABLES = {
  USERS:               "Users",
  BUDGETS:             "Budgets",
  SAVINGS_GOALS:       "Savings_Goals",
  INVESTMENTS:         "Investments",
  TRANSACTIONS:        "Transactions",
  INVESTMENT_PRODUCTS: "Investment_Products",
  ADMIN_LOG:           "Admin_Log",
  SUPPORT_TICKETS:     "Support_Tickets",
} as const;

let _token: string | null = null;
let _dtable: string | null = null;
let _tokenExpiry = 0;

/** Get a short-lived API access token (cached for 45 min) */
async function getAccessToken(): Promise<{ token: string; dtable: string }> {
  const now = Date.now();
  if (_token && _dtable && now < _tokenExpiry) {
    return { token: _token, dtable: _dtable };
  }
  const res = await fetch(`${SEATABLE_SERVER}/api/v2.1/dtable/app-access-token/`, {
    headers: { Authorization: `Token ${SEATABLE_TOKEN}` },
  });
  if (!res.ok) throw new Error(`SeaTable auth failed: ${res.status}`);
  const data = await res.json();
  _token = data.access_token;
  _dtable = data.dtable_uuid;
  _tokenExpiry = now + 45 * 60 * 1000;
  return { token: _token!, dtable: _dtable! };
}

/** Build base URL for the dtable-db SQL endpoint */
async function baseUrl(): Promise<string> {
  const { dtable } = await getAccessToken();
  return `${SEATABLE_SERVER}/dtable-db/api/v1/query/${dtable}/`;
}

/** Execute a SQL query against SeaTable */
export async function query<T = Record<string, unknown>>(
  sql: string,
  convert = true,
): Promise<T[]> {
  const { token } = await getAccessToken();
  const url = await baseUrl();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, convert_keys: convert }),
  });
  const data = await res.json();
  if (!res.ok || data.error_message) {
    throw new Error(data.error_message || `SeaTable query error: ${res.status}`);
  }
  return (data.results ?? []) as T[];
}

/** Insert a row into a table via the REST API (not SQL) */
export async function insertRow(
  tableName: string,
  row: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { token, dtable } = await getAccessToken();
  const res = await fetch(
    `${SEATABLE_SERVER}/dtable-server/api/v1/dtables/${dtable}/rows/`,
    {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ table_name: tableName, row }),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_message || "SeaTable insert failed");
  return data;
}

/** Update a row by its SeaTable row_id */
export async function updateRow(
  tableName: string,
  rowId: string,
  updates: Record<string, unknown>,
): Promise<void> {
  const { token, dtable } = await getAccessToken();
  const res = await fetch(
    `${SEATABLE_SERVER}/dtable-server/api/v1/dtables/${dtable}/rows/`,
    {
      method: "PUT",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ table_name: tableName, row_id: rowId, row: updates }),
    },
  );
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error_message || "SeaTable update failed");
  }
}

/** Delete a row by its SeaTable row_id */
export async function deleteRow(tableName: string, rowId: string): Promise<void> {
  const { token, dtable } = await getAccessToken();
  const res = await fetch(
    `${SEATABLE_SERVER}/dtable-server/api/v1/dtables/${dtable}/rows/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ table_name: tableName, row_id: rowId }),
    },
  );
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error_message || "SeaTable delete failed");
  }
}

// ---------------------------------------------------------------------------
// Typed helpers per table
// ---------------------------------------------------------------------------

export type STUser = {
  _id: string;
  User_ID: string;
  Full_Name: string;
  Email: string;
  Phone: string;
  Password_Hash: string;
  PIN_Hash?: string;
  Google_ID?: string;
  KYC_Status: "Pending" | "Verified" | "Rejected";
  Privacy_Mode_Enabled?: boolean;
  Is_Active?: boolean;
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
  Type: "personal" | "team";
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

/** kobo → naira (2 decimal places) */
export const koboToNaira = (k: number) => k / 100;
/** naira → kobo */
export const nairaToKobo = (n: number) => Math.round(n * 100);

export async function getUserByEmail(email: string): Promise<STUser | null> {
  const rows = await query<STUser>(
    `SELECT * FROM ${TABLES.USERS} WHERE Email='${email.replace(/'/g, "''")}' LIMIT 1`,
  );
  return rows[0] ?? null;
}

export async function getUserById(userId: string): Promise<STUser | null> {
  const rows = await query<STUser>(
    `SELECT * FROM ${TABLES.USERS} WHERE User_ID='${userId}' LIMIT 1`,
  );
  return rows[0] ?? null;
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
