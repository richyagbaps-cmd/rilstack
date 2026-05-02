/**
 * Wallet store — SeaTable-backed wallet, transaction ledger, and payout recipients.
 *
 * SeaTable table schemas required (create manually in your SeaTable base):
 *
 * Table "Wallets":
 *   User_ID (text), Paystack_Customer_Code (text), Paystack_DVA_Code (text),
 *   Account_Number (text), Account_Name (text), Bank_Name (text),
 *   Balance (number, in kobo), Created_At (text), Updated_At (text)
 *
 * Table "Wallet_Transactions":
 *   Wallet_ID (text), User_ID (text), Type (text: deposit|withdrawal|fee),
 *   Amount (number, in kobo), Balance_Before (number), Balance_After (number),
 *   Reference (text, unique), Metadata (text/JSON), Created_At (text)
 *
 * Table "Payout_Recipients":
 *   User_ID (text), Recipient_Code (text), Bank_Name (text),
 *   Account_Number (text), Account_Name (text), Bank_Code (text),
 *   Is_Active (checkbox/bool), Created_At (text)
 */

import { TABLES, query, insertRow, updateRow } from "@/lib/seatable";

// ---------------------------------------------------------------------------
// Per-user write queue — serialises concurrent creditWallet / debitWallet
// calls within a single serverless instance so reads and writes don't race.
// ---------------------------------------------------------------------------
const _walletLocks = new Map<string, Promise<void>>();

function withWalletLock<T>(userId: string, fn: () => Promise<T>): Promise<T> {
  const prev = _walletLocks.get(userId) ?? Promise.resolve();
  let resolve!: () => void;
  const next = new Promise<void>((r) => { resolve = r; });
  _walletLocks.set(userId, next);
  return prev.then(fn).finally(() => {
    resolve();
    // Clean up stale entries so the map doesn't grow forever
    if (_walletLocks.get(userId) === next) _walletLocks.delete(userId);
  });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface STWallet {
  _id: string;
  User_ID: string;
  Paystack_Customer_code: string;
  Paystack_DVA_Code?: string;
  Account_Number: string | number;
  Account_Name: string;
  Bank_Name: string;
  Balance: number; // in kobo
  Created_At: string;
  Updated_At: string;
}

export interface STWalletTransaction {
  _id: string;
  Wallet_ID?: string;
  Wallet_Id: string;
  User_ID?: string;
  User_Id: string;
  Type: "deposit" | "withdrawal" | "fee";
  Amount: number; // in kobo
  Balance_Before: number;
  Balance_After: number;
  Reference: string;
  Metadata: string; // JSON string
  Created_At: string;
}

export interface STPayoutRecipient {
  _id: string;
  User_ID?: string;
  User_Id: string;
  Recipient_Code: string;
  Bank_Name: string;
  Account_Number: string | number;
  Account_Name: string;
  Bank_Code: string;
  Is_Active: boolean;
  Created_At: string;
}

// ---------------------------------------------------------------------------
// Wallet helpers
// ---------------------------------------------------------------------------

export async function getWalletByUserId(userId: string): Promise<STWallet | null> {
  if (!userId) return null;
  try {
    const rows = await query<STWallet>(
      `SELECT * FROM ${TABLES.WALLETS} WHERE User_ID='${userId.replace(/'/g, "''")}' LIMIT 1`,
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getWalletByCustomerCode(customerCode: string): Promise<STWallet | null> {
  if (!customerCode) return null;
  try {
    const safe = customerCode.replace(/'/g, "''");
    const rows = await query<STWallet>(
      `SELECT * FROM ${TABLES.WALLETS} WHERE Paystack_Customer_code='${safe}' LIMIT 1`,
    ).catch(async () =>
      query<STWallet>(
        `SELECT * FROM ${TABLES.WALLETS} WHERE Paystack_Customer_Code='${safe}' LIMIT 1`,
      ),
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Create or update a wallet record for a user.
 * Returns the upserted wallet row.
 */
export async function upsertWallet(data: {
  userId: string;
  paystackCustomerCode: string;
  paystackDvaCode?: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
}): Promise<STWallet> {
  if (!data.userId) throw new Error("userId is required for upsertWallet");
  const existing = await getWalletByUserId(data.userId);
  const now = new Date().toISOString();

  if (existing) {
    await updateRow(TABLES.WALLETS, existing._id, {
      Paystack_Customer_code: data.paystackCustomerCode,
      Paystack_Customer_Code: data.paystackCustomerCode,
      ...(data.paystackDvaCode ? { Paystack_DVA_Code: data.paystackDvaCode } : {}),
      Account_Number: data.accountNumber,
      Account_Name: data.accountName,
      Bank_Name: data.bankName,
      Updated_At: now,
    });
    return { ...existing, ...data, Updated_At: now };
  }

  await insertRow(TABLES.WALLETS, {
    User_ID: data.userId,
    Paystack_Customer_code: data.paystackCustomerCode,
    Paystack_Customer_Code: data.paystackCustomerCode,
    Paystack_DVA_Code: data.paystackDvaCode ?? "",
    Account_Number: data.accountNumber,
    Account_Name: data.accountName,
    Bank_Name: data.bankName,
    Balance: 0,
    Created_At: now,
    Updated_At: now,
  });

  const created = await getWalletByUserId(data.userId);
  if (!created) throw new Error("Wallet creation failed — row not found after insert.");
  return created;
}

/**
 * Check if a reference has already been processed (idempotency guard).
 */
export async function isReferenceProcessed(reference: string): Promise<boolean> {
  if (!reference) return false;
  try {
    const rows = await query<STWalletTransaction>(
      `SELECT _id FROM ${TABLES.WALLET_TRANSACTIONS} WHERE Reference='${reference.replace(/'/g, "''")}' LIMIT 1`,
    );
    return rows.length > 0;
  } catch {
    return false;
  }
}

/**
 * Credit (add funds) to a wallet atomically.
 * Records a WalletTransaction and updates the Wallet balance.
 */
export async function creditWallet(
  wallet: STWallet,
  amountKobo: number,
  reference: string,
  metadata?: Record<string, unknown>,
): Promise<STWallet> {
  return withWalletLock(wallet.User_ID, async () => {
    const alreadyProcessed = await isReferenceProcessed(reference);
    if (alreadyProcessed) return wallet;

    // Re-fetch live balance to avoid stale-read race condition
    const live = await getWalletByUserId(wallet.User_ID);
    const current = live ?? wallet;

    const balanceBefore = Number(current.Balance ?? 0);
    const balanceAfter = balanceBefore + amountKobo;
    const now = new Date().toISOString();

    // Record the transaction first
    await insertRow(TABLES.WALLET_TRANSACTIONS, {
      Wallet_ID: current._id,
      Wallet_Id: current._id,
      User_ID: current.User_ID,
      User_Id: current.User_ID,
      Type: "deposit",
      Amount: amountKobo,
      Balance_Before: balanceBefore,
      Balance_After: balanceAfter,
      Reference: reference,
      Metadata: JSON.stringify(metadata ?? {}),
      Created_At: now,
    });

    // Update wallet balance
    await updateRow(TABLES.WALLETS, current._id, {
      Balance: balanceAfter,
      Updated_At: now,
    });

    return { ...current, Balance: balanceAfter, Updated_At: now };
  });
}

/**
 * Debit (remove funds) from a wallet.
 * Throws if balance is insufficient.
 */
export async function debitWallet(
  wallet: STWallet,
  amountKobo: number,
  reference: string,
  type: "withdrawal" | "fee" = "withdrawal",
  metadata?: Record<string, unknown>,
): Promise<STWallet> {
  return withWalletLock(wallet.User_ID, async () => {
    const alreadyProcessed = await isReferenceProcessed(reference);
    if (alreadyProcessed) return wallet;

    // Re-fetch live balance to avoid stale-read race condition
    const live = await getWalletByUserId(wallet.User_ID);
    const current = live ?? wallet;

    const balanceBefore = Number(current.Balance ?? 0);
    if (amountKobo > balanceBefore) {
      throw new Error(
        `Insufficient wallet balance. Available: ₦${(balanceBefore / 100).toLocaleString("en-NG")}.`,
      );
    }

    const balanceAfter = balanceBefore - amountKobo;
    const now = new Date().toISOString();

    await insertRow(TABLES.WALLET_TRANSACTIONS, {
      Wallet_ID: current._id,
      Wallet_Id: current._id,
      User_ID: current.User_ID,
      User_Id: current.User_ID,
      Type: type,
      Amount: amountKobo,
      Balance_Before: balanceBefore,
      Balance_After: balanceAfter,
      Reference: reference,
      Metadata: JSON.stringify(metadata ?? {}),
      Created_At: now,
    });

    await updateRow(TABLES.WALLETS, current._id, {
      Balance: balanceAfter,
      Updated_At: now,
    });

    return { ...current, Balance: balanceAfter, Updated_At: now };
  });
}

/**
 * Get wallet transaction history for a user.
 */
export async function getWalletTransactions(
  userId: string,
  limit = 50,
): Promise<STWalletTransaction[]> {
  if (!userId) return [];
  try {
    const safe = userId.replace(/'/g, "''");
    return await query<STWalletTransaction>(
      `SELECT * FROM ${TABLES.WALLET_TRANSACTIONS} WHERE User_ID='${safe}' ORDER BY Created_At DESC LIMIT ${limit}`,
    ).catch(async () =>
      query<STWalletTransaction>(
        `SELECT * FROM ${TABLES.WALLET_TRANSACTIONS} WHERE User_Id='${safe}' ORDER BY Created_At DESC LIMIT ${limit}`,
      ),
    );
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Payout Recipients
// ---------------------------------------------------------------------------

export async function getPayoutRecipient(
  userId: string,
  accountNumber: string,
): Promise<STPayoutRecipient | null> {
  if (!userId || !accountNumber) return null;
  try {
    const safeUserId = userId.replace(/'/g, "''");
    const safeAcc = accountNumber.replace(/'/g, "''");
    const rows = await query<STPayoutRecipient>(
      `SELECT * FROM ${TABLES.PAYOUT_RECIPIENTS} WHERE User_ID='${safeUserId}' AND Account_Number='${safeAcc}' AND Is_Active=1 LIMIT 1`,
    ).catch(async () =>
      query<STPayoutRecipient>(
        `SELECT * FROM ${TABLES.PAYOUT_RECIPIENTS} WHERE User_Id='${safeUserId}' AND Account_Number='${safeAcc}' AND Is_Active=1 LIMIT 1`,
      ),
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function savePayoutRecipient(data: {
  userId: string;
  recipientCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
}): Promise<void> {
  const now = new Date().toISOString();
  await insertRow(TABLES.PAYOUT_RECIPIENTS, {
    User_ID: data.userId,
    User_Id: data.userId,
    Recipient_Code: data.recipientCode,
    Bank_Name: data.bankName,
    Account_Number: data.accountNumber,
    Account_Name: data.accountName,
    Bank_Code: data.bankCode,
    Is_Active: true,
    Created_At: now,
  });
}
