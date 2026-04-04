'use client';

import React, { useState } from 'react';
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
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  method: 'card' | 'transfer' | 'ussd';
  date: string;
  status: 'completed' | 'pending';
}

export default function AccountBalance() {
  const [accounts] = useState<Account[]>([
    { id: '1', type: 'checking', name: 'Primary Checking', balance: 450000, availableBalance: 360000, currency: 'NGN' },
    { id: '2', type: 'savings', name: 'Savings Account', balance: 1050000, availableBalance: 1050000, currency: 'NGN' },
    { id: '3', type: 'investment', name: 'Investment Portfolio', balance: 1576650, availableBalance: 150000, currency: 'NGN' },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'deposit', amount: 150000, method: 'card', date: '2024-03-15', status: 'completed' },
    { id: '2', type: 'deposit', amount: 90000, method: 'transfer', date: '2024-03-14', status: 'completed' },
    { id: '3', type: 'deposit', amount: 60000, method: 'ussd', date: '2024-03-13', status: 'completed' },
    { id: '4', type: 'withdrawal', amount: 45000, method: 'transfer', date: '2024-03-12', status: 'completed' },
  ]);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [processSuccess, setProcessSuccess] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<{ amount: string; method: string; description: string }>();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalAvailable = accounts.reduce((sum, acc) => sum + acc.availableBalance, 0);
  const lockedBalance = totalBalance - totalAvailable;

  const onDepositSubmit = async (data: { amount: string; method: string; description: string }) => {
    setIsProcessing(true);
    setProcessError(null);
    setProcessSuccess(null);

    try {
      const response = await fetch('/api/payment/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(data.amount),
          method: data.method as 'card' | 'transfer' | 'ussd',
          description: data.description,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment processing failed');
      }

      const paymentResult = await response.json();

      const newTransaction: Transaction = {
        id: paymentResult.transactionId || Date.now().toString(),
        type: 'deposit',
        amount: parseFloat(data.amount),
        method: data.method as 'card' | 'transfer' | 'ussd',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
      };

      setTransactions([newTransaction, ...transactions]);
      setProcessSuccess(`Deposit initiated: ${paymentResult.message || 'success'}`);
      reset();

      setTimeout(() => {
        setShowDepositModal(false);
        setProcessSuccess(null);
      }, 2000);
    } catch (err: any) {
      setProcessError(err.message || 'Failed to process deposit');
    } finally {
      setIsProcessing(false);
    }
  };

  const onWithdrawalSubmit = (data: { amount: string; method: string; description: string }) => {
    if (parseFloat(data.amount) <= totalAvailable) {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'withdrawal',
        amount: parseFloat(data.amount),
        method: data.method as 'card' | 'transfer' | 'ussd',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
      };
      setTransactions([newTransaction, ...transactions]);
      reset();
      setShowWithdrawalModal(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return 'Card';
      case 'transfer':
        return 'Bank';
      case 'ussd':
        return 'USSD';
      default:
        return 'Cash';
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <div className="rounded-lg bg-gradient-to-br from-blue-900 to-blue-800 p-5 text-white shadow-lg md:p-6">
          <p className="mb-2 text-xs opacity-90 md:text-sm">TOTAL BALANCE</p>
          <p className="mb-2 text-3xl font-bold md:text-4xl">N{totalBalance.toLocaleString()}</p>
          <p className="text-xs opacity-75">All accounts combined</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-5 text-white shadow-lg md:p-6">
          <p className="mb-2 text-xs opacity-90 md:text-sm">AVAILABLE FOR WITHDRAWAL</p>
          <p className="mb-2 text-3xl font-bold md:text-4xl">N{totalAvailable.toLocaleString()}</p>
          <p className="text-xs opacity-75">Ready to withdraw immediately</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white shadow-lg md:p-6">
          <p className="mb-2 text-xs opacity-90 md:text-sm">LOCKED OR INVESTED</p>
          <p className="mb-2 text-3xl font-bold md:text-4xl">N{lockedBalance.toLocaleString()}</p>
          <p className="text-xs opacity-75">In active investments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        <button
          onClick={() => setShowDepositModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-800 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-900 md:py-4 md:text-base"
        >
          Deposit Funds
        </button>
        <button
          onClick={() => setShowWithdrawalModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white transition-all hover:bg-green-700 md:py-4 md:text-base"
        >
          Withdraw Funds
        </button>
        <button className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 py-3 text-sm font-semibold text-white transition-all hover:bg-purple-700 md:py-4 md:text-base">
          Transfer Money
        </button>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-md md:p-6">
        <h3 className="mb-4 text-lg font-bold md:text-xl">Account Details</h3>
        <div className="space-y-3">
          {accounts.map((account) => (
            <div key={account.id} className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold md:text-lg">{account.name}</p>
                  <p className="text-xs capitalize text-gray-600">{account.type} Account</p>
                </div>
                <p className="text-base font-bold text-blue-800 md:text-lg">N{account.balance.toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs md:gap-4 md:text-sm">
                <div>
                  <p className="text-gray-600">Available</p>
                  <p className="font-semibold text-green-600">N{account.availableBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Locked</p>
                  <p className="font-semibold text-orange-600">N{(account.balance - account.availableBalance).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-md md:p-6">
        <h3 className="mb-4 text-lg font-bold md:text-xl">Recent Transactions</h3>
        <div className="space-y-2">
          {transactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 md:text-xs">
                    {getMethodIcon(transaction.method)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold capitalize md:text-base">
                      {transaction.type} via {transaction.method === 'card' ? 'Card' : transaction.method === 'transfer' ? 'Bank Transfer' : 'USSD'}
                    </p>
                    <p className="text-xs text-gray-600">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-base font-bold md:text-lg ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'deposit' ? '+' : '-'}N{transaction.amount.toLocaleString()}
                  </p>
                  <span className={`rounded px-2 py-1 text-xs ${getStatusBadge(transaction.status)}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-blue-800 p-5 text-white md:p-6">
              <h3 className="text-lg font-bold md:text-xl">Deposit Funds</h3>
              <button onClick={() => setShowDepositModal(false)} className="rounded px-2 text-xl font-bold hover:bg-blue-900">
                x
              </button>
            </div>
            <form onSubmit={handleSubmit(onDepositSubmit)} className="space-y-4 p-5 md:p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold">Amount (N Min: N5,000)</label>
                <input
                  type="number"
                  step="1"
                  placeholder="Enter amount"
                  {...register('amount', {
                    required: 'Amount is required',
                    valueAsNumber: true,
                    min: { value: 5000, message: 'Minimum deposit is N5,000' },
                  })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Deposit Method</label>
                <select
                  {...register('method', { required: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select method</option>
                  <option value="card">Credit or Debit Card</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="ussd">USSD</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Salary Deposit"
                  {...register('description')}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              {processError && <p className="text-sm text-red-600">{processError}</p>}
              {processSuccess && <p className="text-sm text-green-600">{processSuccess}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {isProcessing ? 'Processing...' : 'Deposit'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 rounded-lg bg-gray-300 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWithdrawalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-green-600 p-5 text-white md:p-6">
              <h3 className="text-lg font-bold md:text-xl">Withdraw Funds</h3>
              <button onClick={() => setShowWithdrawalModal(false)} className="rounded px-2 text-xl font-bold hover:bg-green-700">
                x
              </button>
            </div>
            <form onSubmit={handleSubmit(onWithdrawalSubmit)} className="space-y-4 p-5 md:p-6">
              <div className="rounded border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-800">
                  <strong>Available to withdraw:</strong> N{totalAvailable.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Amount (N)</label>
                <input
                  type="number"
                  step="1"
                  placeholder="Enter amount"
                  {...register('amount', {
                    required: 'Amount is required',
                    valueAsNumber: true,
                    min: { value: 5000, message: 'Minimum withdrawal is N5,000' },
                  })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">Must not exceed N{totalAvailable.toLocaleString()}</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Withdrawal Method</label>
                <select
                  {...register('method', { required: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select method</option>
                  <option value="card">To Card</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="ussd">USSD</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700">
                  Withdraw
                </button>
                <button
                  type="button"
                  onClick={() => setShowWithdrawalModal(false)}
                  className="flex-1 rounded-lg bg-gray-300 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-400"
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
