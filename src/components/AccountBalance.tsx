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
  const [accounts, setAccounts] = useState<Account[]>([
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

  // Form hooks
  const { register, handleSubmit, reset } = useForm<{ amount: string; method: string; description: string }>();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalAvailable = accounts.reduce((sum, acc) => sum + acc.availableBalance, 0);
  const lockedBalance = totalBalance - totalAvailable;

  const onDepositSubmit = async (data: { amount: string; method: string; description: string }) => {
    setIsProcessing(true);
    setProcessError(null);
    setProcessSuccess(null);

    try {
      // Call payment API
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

      // Create transaction record
      const newTransaction: Transaction = {
        id: paymentResult.transactionId || Date.now().toString(),
        type: 'deposit',
        amount: parseFloat(data.amount),
        method: data.method as 'card' | 'transfer' | 'ussd',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
      };

      setTransactions([newTransaction, ...transactions]);
      setProcessSuccess(`✅ ${paymentResult.message || 'Deposit initiated successfully'}`);
      reset();
      
      // Close modal after 2 seconds
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

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'card':
        return 'bg-blue-100 text-blue-800';
      case 'transfer':
        return 'bg-purple-100 text-purple-800';
      case 'ussd':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return '💳';
      case 'transfer':
        return '🏦';
      case 'ussd':
        return '📱';
      default:
        return '💰';
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90 mb-2">TOTAL BALANCE</p>
          <p className="text-4xl font-bold mb-2">₦{totalBalance.toLocaleString()}</p>
          <p className="text-xs opacity-75">All accounts combined</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90 mb-2">AVAILABLE FOR WITHDRAWAL</p>
          <p className="text-4xl font-bold mb-2">₦{totalAvailable.toLocaleString()}</p>
          <p className="text-xs opacity-75">Ready to withdraw immediately</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90 mb-2">LOCKED/INVESTED</p>
          <p className="text-4xl font-bold mb-2">₦{lockedBalance.toLocaleString()}</p>
          <p className="text-xs opacity-75">In active investments</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowDepositModal(true)}
          className="bg-blue-800 text-white py-4 rounded-lg font-semibold hover:bg-blue-900 transition-all flex items-center justify-center gap-2"
        >
          💳 Deposit Funds
        </button>
        <button
          onClick={() => setShowWithdrawalModal(true)}
          className="bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
        >
          🏦 Withdraw Funds
        </button>
        <button className="bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2">
          ➡️ Transfer Money
        </button>
      </div>

      {/* Account Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Account Details</h3>
        <div className="space-y-3">
          {accounts.map((account) => (
            <div key={account.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-lg">{account.name}</p>
                  <p className="text-xs text-gray-600 capitalize">{account.type} Account</p>
                </div>
                <p className="text-lg font-bold text-blue-800">₦{account.balance.toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Available</p>
                  <p className="font-semibold text-green-600">₦{account.availableBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Locked</p>
                  <p className="font-semibold text-orange-600">₦{(account.balance - account.availableBalance).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
        <div className="space-y-2">
          {transactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getMethodIcon(transaction.method)}</span>
                  <div>
                    <p className="font-semibold capitalize">
                      {transaction.type} via {transaction.method === 'card' ? 'Card' : transaction.method === 'transfer' ? 'Bank Transfer' : 'USSD'}
                    </p>
                    <p className="text-xs text-gray-600">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'deposit' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(transaction.status)}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="bg-blue-800 text-white p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold">Deposit Funds</h3>
              <button onClick={() => setShowDepositModal(false)} className="text-2xl font-bold hover:bg-blue-900 px-2 rounded">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit(onDepositSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Amount (₦ Min: ₦5,000)</label>
                <input
                  type="number"
                  step="1"
                  placeholder="Enter amount (minimum ₦5,000)"
                  {...register('amount', { 
                    required: 'Amount is required',
                    valueAsNumber: true,
                    min: { value: 5000, message: 'Minimum deposit is ₦5,000' },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Deposit Method</label>
                <select
                  {...register('method', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select method</option>
                  <option value="card">💳 Credit/Debit Card</option>
                  <option value="transfer">🏦 Bank Transfer</option>
                  <option value="ussd">📱 USSD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Salary Deposit"
                  {...register('description')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
                  Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="bg-green-600 text-white p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold">Withdraw Funds</h3>
              <button onClick={() => setShowWithdrawalModal(false)} className="text-2xl font-bold hover:bg-green-700 px-2 rounded">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit(onWithdrawalSubmit)} className="p-6 space-y-4">
              <div className="bg-green-50 p-3 rounded border border-green-200 mb-4">
                <p className="text-sm text-green-800">
                  <strong>Available to withdraw:</strong> ₦{totalAvailable.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Amount (₦)</label>
                <input
                  type="number"
                  step="1"
                  placeholder="Enter amount"
                  {...register('amount', { 
                    required: 'Amount is required',
                    valueAsNumber: true,
                    min: { value: 5000, message: 'Minimum withdrawal is ₦5,000' },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Must not exceed ₦{totalAvailable.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Withdrawal Method</label>
                <select
                  {...register('method', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select method</option>
                  <option value="card">💳 To Card</option>
                  <option value="transfer">🏦 Bank Transfer</option>
                  <option value="ussd">📱 USSD</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700">
                  Withdraw
                </button>
                <button
                  type="button"
                  onClick={() => setShowWithdrawalModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400"
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
