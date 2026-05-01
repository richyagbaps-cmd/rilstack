import {
  isReferenceForEmail,
  mapPaystackChannelToMethod,
  paystackRequest,
  type PaystackWalletDetails,
} from "@/lib/paystack";
import {
  getWalletByUserId,
  getWalletTransactions,
} from "@/lib/wallet-store";
import { findStoredUserByEmail } from "@/lib/user-store";

interface PaystackTransaction {
  id: number;
  reference: string;
  amount: number;
  channel?: string;
  status: string;
  created_at?: string;
  paid_at?: string;
  customer?: {
    email?: string;
  };
  metadata?: {
    type?: string;
    platform?: string;
    description?: string;
    userEmail?: string;
  };
}

interface PaystackTransfer {
  id: number;
  reference: string;
  amount: number;
  status: string;
  reason?: string;
  createdAt?: string;
  created_at?: string;
  recipient?: {
    name?: string;
    details?: {
      account_number?: string;
      bank_name?: string;
    };
  };
}

export interface LedgerTransaction {
  id: string;
  reference: string;
  type: "deposit" | "withdrawal";
  amount: number;
  method: "card" | "transfer" | "ussd";
  date: string;
  status: string;
  description: string;
  recipientName?: string;
  accountNumber?: string;
  bankName?: string;
}

export interface AccountLedger {
  summary: {
    totalBalance: number;
    availableBalance: number;
    lockedBalance: number;
    generatedAt: string;
  };
  accounts: Array<{
    id: string;
    type: "checking" | "savings" | "investment";
    name: string;
    balance: number;
    availableBalance: number;
    currency: "NGN";
    walletId?: string;
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
  }>;
  transactions: LedgerTransaction[];
}

export async function getPaystackLedgerForEmail(
  email: string,
  options?: { wallet?: PaystackWalletDetails | null },
): Promise<AccountLedger> {
  const normalizedEmail = email.trim().toLowerCase();

  // --- Primary path: use DB wallet record (accurate, fast, no Paystack API calls) ---
  try {
    const user = await findStoredUserByEmail(normalizedEmail);
    if (user) {
      const dbWallet = await getWalletByUserId(user.id);
      if (dbWallet) {
        const dbTxs = await getWalletTransactions(user.id, 100);
        const balanceNaira = Number(dbWallet.Balance ?? 0) / 100;

        const transactions: LedgerTransaction[] = dbTxs.map((tx) => ({
          id: tx._id,
          reference: tx.Reference,
          type: tx.Type === "deposit" ? "deposit" : "withdrawal",
          amount: tx.Amount / 100,
          method: "transfer",
          date: tx.Created_At,
          status: "success",
          description:
            tx.Type === "deposit" ? "Wallet deposit" : "Wallet withdrawal",
        }));

        const generatedAt = new Date().toISOString();
        return {
          summary: {
            totalBalance: balanceNaira,
            availableBalance: balanceNaira,
            lockedBalance: 0,
            generatedAt,
          },
          accounts: [
            {
              id: "1",
              type: "checking",
              name: "Primary Wallet",
              balance: balanceNaira,
              availableBalance: balanceNaira,
              currency: "NGN",
              walletId: dbWallet._id,
              accountNumber: String(dbWallet.Account_Number ?? ""),
              accountName: dbWallet.Account_Name,
              bankName: dbWallet.Bank_Name,
            },
            {
              id: "2",
              type: "savings",
              name: "Savings Balance",
              balance: 0,
              availableBalance: 0,
              currency: "NGN",
            },
            {
              id: "3",
              type: "investment",
              name: "Investment Balance",
              balance: 0,
              availableBalance: 0,
              currency: "NGN",
            },
          ],
          transactions,
        };
      }
    }
  } catch (dbErr) {
    console.warn("getPaystackLedgerForEmail: DB wallet lookup failed, falling back to Paystack API:", dbErr);
  }

  // --- Fallback path: poll Paystack API directly (used before wallet is set up) ---

  // Query multiple pages so users with older or less recent deposits still
  // have accurate wallet balances reflected on dashboard.
  const txPages = [1, 2, 3, 4, 5];
  const transactionResponses = await Promise.all(
    txPages.map((page) =>
      paystackRequest<PaystackTransaction[]>(
        `/transaction?perPage=100&page=${page}`,
      ).catch(() => ({ status: true, message: "", data: [] })),
    ),
  );

  const transferResponse = await paystackRequest<PaystackTransfer[]>(
    "/transfer?perPage=100&page=1",
  ).catch(() => ({ status: true, message: "", data: [] }));

  const allTransactions = transactionResponses.flatMap((res) => res.data || []);

  const deposits: LedgerTransaction[] = allTransactions
    .filter(
      (transaction) => {
        const customerEmail = transaction.customer?.email?.trim().toLowerCase();
        const metadataEmail = transaction.metadata?.userEmail?.trim().toLowerCase();
        const isUserTx =
          customerEmail === normalizedEmail || metadataEmail === normalizedEmail;

        // Count any successful transaction belonging to this user as a deposit.
        // The previous strict check (platform=rilstack + RIL_ prefix) was filtering
        // out valid deposits that arrived via different flows.
        return isUserTx && transaction.status === "success";
      },
    )
    .map((transaction) => ({
      id: String(transaction.id),
      reference: transaction.reference,
      type: "deposit",
      amount: transaction.amount / 100,
      method: mapPaystackChannelToMethod(transaction.channel),
      date: transaction.paid_at || transaction.created_at || "",
      status: transaction.status,
      description: transaction.metadata?.description || "Paystack deposit",
    }));

  const withdrawals: LedgerTransaction[] = transferResponse.data
    .filter((transfer) =>
      isReferenceForEmail(transfer.reference, normalizedEmail),
    )
    .map((transfer) => ({
      id: String(transfer.id),
      reference: transfer.reference,
      type: "withdrawal",
      amount: transfer.amount / 100,
      method: "transfer",
      date: transfer.createdAt || transfer.created_at || "",
      status: transfer.status,
      description: transfer.reason || "Paystack withdrawal",
      recipientName: transfer.recipient?.name || "",
      accountNumber: transfer.recipient?.details?.account_number || "",
      bankName: transfer.recipient?.details?.bank_name || "",
    }));

  const successfulDeposits = deposits.filter(
    (transaction) => transaction.status === "success",
  );
  const successfulWithdrawals = withdrawals.filter(
    (transaction) => transaction.status === "success",
  );

  const depositedTotal = successfulDeposits.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );
  const withdrawnTotal = successfulWithdrawals.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );
  const totalBalance = Math.max(0, depositedTotal - withdrawnTotal);
  const generatedAt = new Date().toISOString();

  const transactions = [...deposits, ...withdrawals].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return {
    summary: {
      totalBalance,
      availableBalance: totalBalance,
      lockedBalance: 0,
      generatedAt,
    },
    accounts: [
      {
        id: "1",
        type: "checking",
        name: "Primary Wallet",
        balance: totalBalance,
        availableBalance: totalBalance,
        currency: "NGN",
        walletId: options?.wallet?.walletId,
        accountNumber: options?.wallet?.accountNumber,
        accountName: options?.wallet?.accountName,
        bankName: options?.wallet?.bankName,
      },
      {
        id: "2",
        type: "savings",
        name: "Savings Balance",
        balance: 0,
        availableBalance: 0,
        currency: "NGN",
      },
      {
        id: "3",
        type: "investment",
        name: "Investment Balance",
        balance: 0,
        availableBalance: 0,
        currency: "NGN",
      },
    ],
    transactions,
  };
}
