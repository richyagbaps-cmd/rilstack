'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
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
  reference: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  method: 'card' | 'transfer' | 'ussd';
  date: string;
  status: string;
  description?: string;
  recipientName?: string;
  accountNumber?: string;
  bankName?: string;
}

interface Bank {
  code: string;
  name: string;
}

interface DepositFormData {
  amount: string;
  method: 'card' | 'transfer' | 'ussd';
  description: string;
}

interface WithdrawalFormData {
  amount: string;
  bankCode: string;
  accountNumber: string;
  recipientName: string;
  narration: string;
}

interface OtpFormData {
  otp: string;
}

interface StatementFormData {
  deliveryEmail: string;
}

const EMPTY_ACCOUNTS: Account[] = [
  { id: '1', type: 'checking', name: 'Primary Wallet', balance: 0, availableBalance: 0, currency: 'NGN' },
  { id: '2', type: 'savings', name: 'Savings Balance', balance: 0, availableBalance: 0, currency: 'NGN' },
  { id: '3', type: 'investment', name: 'Investment Balance', balance: 0, availableBalance: 0, currency: 'NGN' },
];

const formatCurrency = (amount: number) => `N${amount.toLocaleString()}`;

const formatTransactionStatus = (status: string) => {
  if (status === 'success') return 'Completed';
  if (status === 'otp') return 'Awaiting OTP';
  if (status === 'pending') return 'Pending';
  if (status === 'processing') return 'Processing';
  if (status === 'queued') return 'Queued';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function AccountBalance() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>(EMPTY_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [processSuccess, setProcessSuccess] = useState<string | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isSendingStatement, setIsSendingStatement] = useState(false);
  const [pendingTransferCode, setPendingTransferCode] = useState<string | null>(null);
  const [pendingWithdrawalAmount, setPendingWithdrawalAmount] = useState<number | null>(null);

  const depositForm = useForm<DepositFormData>({
    defaultValues: {
      amount: '',
      method: 'card',
      description: '',
    },
  });
  const withdrawalForm = useForm<WithdrawalFormData>({
    defaultValues: {
      amount: '',
      bankCode: '',
      accountNumber: '',
      recipientName: '',
      narration: '',
    },
  });
  const otpForm = useForm<OtpFormData>({
    defaultValues: {
      otp: '',
    },
  });
  const statementForm = useForm<StatementFormData>({
    defaultValues: {
      deliveryEmail: session?.user?.email || '',
    },
  });

  const totalBalance = useMemo(() => accounts.reduce((sum, account) => sum + account.balance, 0), [accounts]);
  const totalAvailable = useMemo(
    () => accounts.reduce((sum, account) => sum + account.availableBalance, 0),
    [accounts],
  );
  const lockedBalance = Math.max(0, totalBalance - totalAvailable);

  const loadLedger = useCallback(async () => {
    if (!session?.user?.email) {
      setAccounts(EMPTY_ACCOUNTS);
      setTransactions([]);
      return;
    }

    setIsLoadingLedger(true);

    try {
      const response = await fetch(`/api/payment/account?email=${encodeURIComponent(session.user.email)}`, {
        cache: 'no-store',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to load your Paystack balance.');
      }

      setAccounts(result.accounts || EMPTY_ACCOUNTS);
      setTransactions(result.transactions || []);
    } catch (error: any) {
      setProcessError(error.message || 'Unable to load your Paystack balance.');
    } finally {
      setIsLoadingLedger(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    void loadLedger();
  }, [loadLedger]);

  useEffect(() => {
    statementForm.reset({
      deliveryEmail: session?.user?.email || '',
    });
  }, [session?.user?.email, statementForm]);

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    const section = searchParams.get('section');

    if (!reference || section !== 'account' || isVerifyingPayment) {
      return;
    }

    const verifyPayment = async () => {
      setIsVerifyingPayment(true);
      setProcessError(null);

      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || result.message || 'Payment verification failed.');
        }

        await loadLedger();
        setProcessSuccess(`Paystack deposit confirmed. ${formatCurrency(result.amount)} is now reflected in your balance.`);
      } catch (error: any) {
        setProcessError(error.message || 'Payment verification failed.');
      } finally {
        setIsVerifyingPayment(false);
        router.replace('/?section=account', { scroll: false });
      }
    };

    void verifyPayment();
  }, [isVerifyingPayment, loadLedger, router, searchParams]);

  const loadBanks = async () => {
    if (banks.length > 0 || isLoadingBanks) return;

    setIsLoadingBanks(true);

    try {
      const response = await fetch('/api/payment/withdraw', { cache: 'no-store' });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to load banks.');
      }

      setBanks(result.banks || []);
    } catch (error: any) {
      setProcessError(error.message || 'Unable to load bank list.');
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const onDepositSubmit = async (data: DepositFormData) => {
    const amount = Number(data.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setProcessError('Enter a valid deposit amount.');
      return;
    }

    setIsSubmittingDeposit(true);
    setProcessError(null);
    setProcessSuccess(null);

    try {
      const callbackUrl = `${window.location.origin}/?section=account`;
      const response = await fetch('/api/payment/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          method: data.method,
          description: data.description || 'Wallet top-up',
          userEmail: session?.user?.email || 'user@rilstack.com',
          callbackUrl,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success || !result.paymentUrl) {
        throw new Error(result.error || 'Unable to start Paystack deposit.');
      }

      window.location.href = result.paymentUrl;
    } catch (error: any) {
      setProcessError(error.message || 'Unable to start Paystack deposit.');
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  const onWithdrawalSubmit = async (data: WithdrawalFormData) => {
    const amount = Number(data.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setProcessError('Enter a valid withdrawal amount.');
      return;
    }

    if (amount > totalAvailable) {
      setProcessError('Withdrawal exceeds your available Paystack balance.');
      return;
    }

    setIsSubmittingWithdrawal(true);
    setProcessError(null);
    setProcessSuccess(null);

    try {
      const response = await fetch('/api/payment/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          accountNumber: data.accountNumber,
          bankCode: data.bankCode,
          recipientName: data.recipientName,
          narration: data.narration,
          userEmail: session?.user?.email || 'user@rilstack.com',
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to start Paystack withdrawal.');
      }

      setPendingWithdrawalAmount(amount);

      if (result.requiresOtp && result.transferCode) {
        setPendingTransferCode(result.transferCode);
        setProcessSuccess('Paystack sent an OTP challenge. Your balance will stay unchanged until Paystack confirms the withdrawal.');
      } else {
        setProcessSuccess(result.message || 'Withdrawal started successfully. Your balance will update only after Paystack confirms it.');
        setShowWithdrawalModal(false);
        withdrawalForm.reset();
        await loadLedger();
      }
    } catch (error: any) {
      setProcessError(error.message || 'Unable to start Paystack withdrawal.');
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  const onOtpSubmit = async (data: OtpFormData) => {
    if (!pendingTransferCode) return;

    setIsSubmittingWithdrawal(true);
    setProcessError(null);

    try {
      const response = await fetch('/api/payment/withdraw/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transferCode: pendingTransferCode,
          otp: data.otp,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to finalize Paystack withdrawal.');
      }

      setPendingTransferCode(null);
      setPendingWithdrawalAmount(null);
      otpForm.reset();
      withdrawalForm.reset();
      setShowWithdrawalModal(false);
      setProcessSuccess('Paystack withdrawal completed successfully.');
      await loadLedger();
    } catch (error: any) {
      setProcessError(error.message || 'Unable to finalize Paystack withdrawal.');
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  const getMethodLabel = (method: Transaction['method']) => {
    if (method === 'card') return 'Card';
    if (method === 'transfer') return 'Bank Transfer';
    return 'USSD';
  };

  const onStatementSubmit = async (data: StatementFormData) => {
    if (!session?.user?.email) {
      setProcessError('You need a signed-in email before requesting a statement.');
      return;
    }

    setIsSendingStatement(true);
    setProcessError(null);
    setProcessSuccess(null);

    try {
      const response = await fetch('/api/payment/statement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: session.user.email,
          deliveryEmail: data.deliveryEmail,
          accountName: session.user.name || session.user.email,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to send your account statement.');
      }

      setShowStatementModal(false);
      setProcessSuccess(
        `Your account statement, including the balance at generation and dated deposits and withdrawals, was sent to ${data.deliveryEmail}.`,
      );
      statementForm.reset({
        deliveryEmail: session.user.email,
      });
    } catch (error: any) {
      setProcessError(error.message || 'Unable to send your account statement.');
    } finally {
      setIsSendingStatement(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(74,222,255,0.18),_transparent_24%),linear-gradient(135deg,_rgba(8,17,29,0.96),_rgba(6,14,24,0.92))] p-5 text-white shadow-2xl md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.26em] text-cyan-200">Paystack Wallet Ledger</p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Deposits, withdrawals, and wallet balance now follow confirmed Paystack activity.</h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              RILSTACK now rebuilds your visible wallet balance from Paystack-confirmed deposits and Paystack-confirmed withdrawals,
              so pending or OTP-stage activity does not change the amount you see.
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
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pending Confirmation</p>
                <p className="mt-2 text-2xl font-bold text-amber-300">{formatCurrency(lockedBalance)}</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
            <Image
              src="/images/savings-orbit.svg"
              alt="Paystack wallet illustration"
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
            setProcessSuccess(null);
            depositForm.reset({ amount: '', method: 'card', description: '' });
            setShowDepositModal(true);
          }}
          className="rounded-2xl bg-blue-800 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-900"
        >
          Deposit with Paystack
        </button>
        <button
          onClick={() => {
            setProcessError(null);
            setProcessSuccess(null);
            void loadBanks();
            setShowWithdrawalModal(true);
          }}
          className="rounded-2xl bg-green-600 py-3 text-sm font-semibold text-white transition-all hover:bg-green-700"
        >
          Withdraw with Paystack
        </button>
        <button
          onClick={() => {
            setProcessError(null);
            setProcessSuccess(null);
            statementForm.reset({
              deliveryEmail: session?.user?.email || '',
            });
            setShowStatementModal(true);
          }}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
        >
          {isLoadingLedger ? 'Refreshing Paystack ledger...' : 'Email account statement'}
        </button>
      </div>

      {processError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {processError}
        </div>
      )}
      {processSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {processSuccess}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <section className="rounded-[26px] bg-white p-5 shadow-md md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900 md:text-xl">Account Details</h3>
            <button
              onClick={() => void loadLedger()}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>
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
                    <p className="text-slate-500">Pending Confirmation</p>
                    <p className="font-semibold text-amber-600">{formatCurrency(account.balance - account.availableBalance)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[26px] bg-white p-5 shadow-md md:p-6">
          <h3 className="text-lg font-bold text-slate-900 md:text-xl">Recent Paystack Transactions</h3>
          {transactions.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm font-semibold text-slate-700">No Paystack activity yet</p>
              <p className="mt-1 text-sm text-slate-500">Start with a Paystack deposit and your balance will update here.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {transactions.slice(0, 8).map((transaction) => (
                <div key={transaction.id} className="rounded-2xl border border-slate-200 p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold capitalize text-slate-900">
                        {transaction.type} via {getMethodLabel(transaction.method)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(transaction.date).toLocaleString()} · {formatTransactionStatus(transaction.status)}
                      </p>
                      {transaction.description && (
                        <p className="mt-1 text-xs text-slate-500">{transaction.description}</p>
                      )}
                      {transaction.type === 'withdrawal' && transaction.accountNumber && (
                        <p className="mt-1 text-xs text-slate-500">
                          {transaction.bankName || 'Bank'} · {transaction.accountNumber}
                        </p>
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
              <h3 className="text-lg font-bold">Deposit with Paystack</h3>
              <button onClick={() => setShowDepositModal(false)} className="rounded px-2 text-xl font-bold hover:bg-blue-900">
                x
              </button>
            </div>
            <form onSubmit={depositForm.handleSubmit(onDepositSubmit)} className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">Amount (N)</label>
                <input
                  type="number"
                  min="5000"
                  placeholder="Enter amount"
                  {...depositForm.register('amount', { required: true })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-slate-500">Minimum Paystack deposit is N5,000.</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Paystack Channel</label>
                <select
                  {...depositForm.register('method', { required: true })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
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
                  {...depositForm.register('description')}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingDeposit}
                  className="flex-1 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmittingDeposit ? 'Redirecting...' : 'Continue to Paystack'}
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
              <h3 className="text-lg font-bold">Withdraw with Paystack</h3>
              <button onClick={() => setShowWithdrawalModal(false)} className="rounded px-2 text-xl font-bold hover:bg-green-700">
                x
              </button>
            </div>

            {pendingTransferCode ? (
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4 p-5">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Paystack requires an OTP to finalize this withdrawal
                  {pendingWithdrawalAmount ? ` for ${formatCurrency(pendingWithdrawalAmount)}.` : '.'}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">OTP</label>
                  <input
                    type="text"
                    placeholder="Enter Paystack OTP"
                    {...otpForm.register('otp', { required: true })}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingWithdrawal}
                    className="flex-1 rounded-2xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmittingWithdrawal ? 'Confirming...' : 'Confirm OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingTransferCode(null);
                      setPendingWithdrawalAmount(null);
                      otpForm.reset();
                    }}
                    className="flex-1 rounded-2xl bg-slate-200 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-300"
                  >
                    Back
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={withdrawalForm.handleSubmit(onWithdrawalSubmit)} className="space-y-4 p-5">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  Available to withdraw: {formatCurrency(totalAvailable)}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Amount (N)</label>
                  <input
                    type="number"
                    min="5000"
                    placeholder="Enter amount"
                    {...withdrawalForm.register('amount', { required: true })}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">Minimum Paystack withdrawal is N5,000.</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Bank</label>
                  <select
                    {...withdrawalForm.register('bankCode', { required: true })}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-500"
                  >
                    <option value="">{isLoadingBanks ? 'Loading banks...' : 'Select bank'}</option>
                    {banks.map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Account Number</label>
                  <input
                    type="text"
                    placeholder="Enter account number"
                    {...withdrawalForm.register('accountNumber', { required: true })}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Recipient Name</label>
                  <input
                    type="text"
                    placeholder="Enter account name"
                    {...withdrawalForm.register('recipientName', { required: true })}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Narration</label>
                  <input
                    type="text"
                    placeholder="e.g. Wallet withdrawal"
                    {...withdrawalForm.register('narration')}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingWithdrawal}
                    className="flex-1 rounded-2xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmittingWithdrawal ? 'Submitting...' : 'Start Withdrawal'}
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
            )}
          </div>
        </div>
      )}

      {showStatementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between rounded-t-3xl bg-slate-900 p-5 text-white">
              <h3 className="text-lg font-bold">Email Account Statement</h3>
              <button onClick={() => setShowStatementModal(false)} className="rounded px-2 text-xl font-bold hover:bg-slate-800">
                x
              </button>
            </div>
            <form onSubmit={statementForm.handleSubmit(onStatementSubmit)} className="space-y-4 p-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                The statement will include your current balance as at generation, plus the dates and times for all deposits and withdrawals.
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Send Statement To</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  {...statementForm.register('deliveryEmail', { required: true })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSendingStatement}
                  className="flex-1 rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSendingStatement ? 'Sending...' : 'Send Statement'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowStatementModal(false)}
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
