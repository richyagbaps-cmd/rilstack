'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

interface Account {
  id: string;
  type: 'checking' | 'savings' | 'investment';
  name: string;
  balance: number;
  availableBalance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  method: 'card' | 'transfer' | 'ussd';
  date: string;
  status: 'completed';
  description?: string;
}

interface FormData {
  amount: string;
  method: string;
  description: string;
}

const STORAGE_KEY = 'rilstack-accounts';
const TRANSACTION_KEY = 'rilstack-transactions';

const INITIAL_ACCOUNTS: Account[] = [
  { id: '1', type: 'checking', name: 'Primary Wallet', balance: 0, availableBalance: 0, currency: 'NGN' },
  { id: '2', type: 'savings', name: 'Savings Balance', balance: 0, availableBalance: 0, currency: 'NGN' },
  { id: '3', type: 'investment', name: 'Investment Balance', balance: 0, availableBalance: 0, currency: 'NGN' },
];

const formatCurrency = (amount: number) => `N${amount.toLocaleString()}`;

export default function AccountBalance() {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [processSuccess, setProcessSuccess] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    const storedAccounts = localStorage.getItem(STORAGE_KEY);
    const storedTransactions = localStorage.getItem(TRANSACTION_KEY);

    if (storedAccounts) {
      try {
        setAccounts(JSON.parse(storedAccounts) as Account[]);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (storedTransactions) {
      try {
        setTransactions(JSON.parse(storedTransactions) as Transaction[]);
      } catch {
        localStorage.removeItem(TRANSACTION_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(TRANSACTION_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const totalBalance = useMemo(() => accounts.reduce((sum, account) => sum + account.balance, 0), [accounts]);
  const totalAvailable = useMemo(
    () => accounts.reduce((sum, account) => sum + account.availableBalance, 0),
    [accounts],
  );
  const lockedBalance = totalBalance - totalAvailable;

  const updatePrimaryWallet = (amount: number, type: 'deposit' | 'withdrawal') => {
    setAccounts((current) =>
      current.map((account) => {
        if (account.type !== 'checking') return account;

        const nextBalance =
          type === 'deposit' ? account.balance + amount : Math.max(0, account.balance - amount);
        const nextAvailable =
          type === 'deposit'
            ? account.availableBalance + amount
            : Math.max(0, account.availableBalance - amount);

        return {
          ...account,
          balance: nextBalance,
          availableBalance: nextAvailable,
        };
      }),
    );
  };

  const recordTransaction = (payload: Omit<Transaction, 'id' | 'date' | 'status'>) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      ...payload,
    };

    setTransactions((current) => [newTransaction, ...current]);
  };

  const onDepositSubmit = (data: FormData) => {
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setProcessError('Enter a valid deposit amount.');
      return;
    }

    updatePrimaryWallet(amount, 'deposit');
    recordTransaction({
      type: 'deposit',
      amount,
      method: data.method as Transaction['method'],
      description: data.description,
    });

    setProcessError(null);
    setProcessSuccess(`Deposit successful. Your primary wallet increased by ${formatCurrency(amount)}.`);
    reset();
    setTimeout(() => {
      setShowDepositModal(false);
      setProcessSuccess(null);
    }, 1200);
  };

  const onWithdrawalSubmit = (data: FormData) => {
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setProcessError('Enter a valid withdrawal amount.');
      return;
    }

    if (amount > totalAvailable) {
      setProcessError('Withdrawal exceeds your available balance.');
      return;
    }

    updatePrimaryWallet(amount, 'withdrawal');
    recordTransaction({
      type: 'withdrawal',
      amount,
      method: data.method as Transaction['method'],
      description: data.description,
    });

    setProcessError(null);
    setProcessSuccess(`Withdrawal successful. ${formatCurrency(amount)} was removed from your wallet.`);
    reset();
    setTimeout(() => {
      setShowWithdrawalModal(false);
      setProcessSuccess(null);
    }, 1200);
  };

  const getMethodLabel = (method: Transaction['method']) => {
    if (method === 'card') return 'Card';
    if (method === 'transfer') return 'Bank Transfer';
    return 'USSD';
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(74,222,255,0.18),_transparent_24%),linear-gradient(135deg,_rgba(8,17,29,0.96),_rgba(6,14,24,0.92))] p-5 text-white shadow-2xl md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.26em] text-cyan-200">Wallet Overview</p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Every user now starts from N0 and grows from real activity.</h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              Your balance no longer shows demo money. Deposits add to the wallet, withdrawals reduce the wallet, and
              the account screen reflects those changes immediately.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Balance</p>
                <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(totalBalance)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Available</p>
                <p className="mt-2 text-2xl font-bold text-emerald-300">{formatCurrency(totalAvailable)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Locked / Invested</p>
                <p className="mt-2 text-2xl font-bold text-amber-300">{formatCurrency(lockedBalance)}</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
            <Image
              src="/images/savings-orbit.svg"
              alt="Savings illustration"
              width={1200}
              height={800}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        <button
          onClick={() => {
            setProcessError(null);
            setShowDepositModal(true);
          }}
          className="rounded-2xl bg-blue-800 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-900"
        >
          Deposit Funds
        </button>
        <button
          onClick={() => {
            setProcessError(null);
            setShowWithdrawalModal(true);
          }}
          className="rounded-2xl bg-green-600 py-3 text-sm font-semibold text-white transition-all hover:bg-green-700"
        >
          Withdraw Funds
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 shadow-sm">
          Primary wallet updates instantly
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <section className="rounded-[26px] bg-white p-5 shadow-md md:p-6">
          <h3 className="text-lg font-bold text-slate-900 md:text-xl">Account Details</h3>
          <div className="mt-4 space-y-3">
            {accounts.map((account) => (
              <div key={account.id} className="rounded-2xl border border-slate-200 p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{account.name}</p>
                    <p className="text-xs capitalize text-slate-500">{account.type} account</p>
                  </div>
                  <p className="text-base font-bold text-blue-800">{formatCurrency(account.balance)}</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500">Available</p>
                    <p className="font-semibold text-emerald-600">{formatCurrency(account.availableBalance)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Locked</p>
                    <p className="font-semibold text-amber-600">{formatCurrency(account.balance - account.availableBalance)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[26px] bg-white p-5 shadow-md md:p-6">
          <h3 className="text-lg font-bold text-slate-900 md:text-xl">Recent Transactions</h3>
          {transactions.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm font-semibold text-slate-700">No transactions yet</p>
              <p className="mt-1 text-sm text-slate-500">Your balance starts at N0. Make a deposit to begin.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {transactions.slice(0, 6).map((transaction) => (
                <div key={transaction.id} className="rounded-2xl border border-slate-200 p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold capitalize text-slate-900">
                        {transaction.type} via {getMethodLabel(transaction.method)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{transaction.date}</p>
                      {transaction.description && (
                        <p className="mt-1 text-xs text-slate-500">{transaction.description}</p>
                      )}
                    </div>
                    <p className={`text-base font-bold ${transaction.type === 'deposit' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {transaction.type === 'deposit' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between rounded-t-3xl bg-blue-800 p-5 text-white">
              <h3 className="text-lg font-bold">Deposit Funds</h3>
              <button onClick={() => setShowDepositModal(false)} className="rounded px-2 text-xl font-bold hover:bg-blue-900">
                x
              </button>
            </div>
            <form onSubmit={handleSubmit(onDepositSubmit)} className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">Amount (N)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  {...register('amount', { required: true })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Method</label>
                <select
                  {...register('method', { required: true })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select method</option>
                  <option value="card">Card</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="ussd">USSD</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Wallet top-up"
                  {...register('description')}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
              {processError && <p className="text-sm text-red-600">{processError}</p>}
              {processSuccess && <p className="text-sm text-emerald-600">{processSuccess}</p>}
              <div className="flex gap-3">
                <button type="submit" className="flex-1 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                  Confirm Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 rounded-2xl bg-slate-200 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWithdrawalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between rounded-t-3xl bg-green-600 p-5 text-white">
              <h3 className="text-lg font-bold">Withdraw Funds</h3>
              <button onClick={() => setShowWithdrawalModal(false)} className="rounded px-2 text-xl font-bold hover:bg-green-700">
                x
              </button>
            </div>
            <form onSubmit={handleSubmit(onWithdrawalSubmit)} className="space-y-4 p-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                Available to withdraw: {formatCurrency(totalAvailable)}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Amount (N)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  {...register('amount', { required: true })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Method</label>
                <select
                  {...register('method', { required: true })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-500"
                >
                  <option value="">Select method</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="ussd">USSD</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Cash withdrawal"
                  {...register('description')}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-500"
                />
              </div>
              {processError && <p className="text-sm text-red-600">{processError}</p>}
              {processSuccess && <p className="text-sm text-emerald-600">{processSuccess}</p>}
              <div className="flex gap-3">
                <button type="submit" className="flex-1 rounded-2xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700">
                  Confirm Withdrawal
                </button>
                <button
                  type="button"
                  onClick={() => setShowWithdrawalModal(false)}
                  className="flex-1 rounded-2xl bg-slate-200 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
