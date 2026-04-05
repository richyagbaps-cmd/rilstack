import { isReferenceForEmail, mapPaystackChannelToMethod, paystackRequest } from '@/lib/paystack';

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
  type: 'deposit' | 'withdrawal';
  amount: number;
  method: 'card' | 'transfer' | 'ussd';
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
    type: 'checking' | 'savings' | 'investment';
    name: string;
    balance: number;
    availableBalance: number;
    currency: 'NGN';
  }>;
  transactions: LedgerTransaction[];
}

export async function getPaystackLedgerForEmail(email: string): Promise<AccountLedger> {
  const normalizedEmail = email.trim().toLowerCase();
  const [transactionResponse, transferResponse] = await Promise.all([
    paystackRequest<PaystackTransaction[]>('/transaction?perPage=100&page=1'),
    paystackRequest<PaystackTransfer[]>('/transfer?perPage=100&page=1'),
  ]);

  const deposits: LedgerTransaction[] = transactionResponse.data
    .filter(
      (transaction) =>
        transaction.customer?.email?.trim().toLowerCase() === normalizedEmail &&
        transaction.metadata?.platform === 'rilstack' &&
        transaction.metadata?.type === 'deposit',
    )
    .map((transaction) => ({
      id: String(transaction.id),
      reference: transaction.reference,
      type: 'deposit',
      amount: transaction.amount / 100,
      method: mapPaystackChannelToMethod(transaction.channel),
      date: transaction.paid_at || transaction.created_at || '',
      status: transaction.status,
      description: transaction.metadata?.description || 'Paystack deposit',
    }));

  const withdrawals: LedgerTransaction[] = transferResponse.data
    .filter((transfer) => isReferenceForEmail(transfer.reference, normalizedEmail))
    .map((transfer) => ({
      id: String(transfer.id),
      reference: transfer.reference,
      type: 'withdrawal',
      amount: transfer.amount / 100,
      method: 'transfer',
      date: transfer.createdAt || transfer.created_at || '',
      status: transfer.status,
      description: transfer.reason || 'Paystack withdrawal',
      recipientName: transfer.recipient?.name || '',
      accountNumber: transfer.recipient?.details?.account_number || '',
      bankName: transfer.recipient?.details?.bank_name || '',
    }));

  const successfulDeposits = deposits.filter((transaction) => transaction.status === 'success');
  const successfulWithdrawals = withdrawals.filter((transaction) => transaction.status === 'success');

  const depositedTotal = successfulDeposits.reduce((sum, transaction) => sum + transaction.amount, 0);
  const withdrawnTotal = successfulWithdrawals.reduce((sum, transaction) => sum + transaction.amount, 0);
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
        id: '1',
        type: 'checking',
        name: 'Primary Wallet',
        balance: totalBalance,
        availableBalance: totalBalance,
        currency: 'NGN',
      },
      {
        id: '2',
        type: 'savings',
        name: 'Savings Balance',
        balance: 0,
        availableBalance: 0,
        currency: 'NGN',
      },
      {
        id: '3',
        type: 'investment',
        name: 'Investment Balance',
        balance: 0,
        availableBalance: 0,
        currency: 'NGN',
      },
    ],
    transactions,
  };
}
