'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface LockedSaving {
  id: string;
  amount: number;
  lockPeriod: 'hourly' | 'daily' | 'monthly' | 'yearly';
  createdDate: string;
  unlockDate: string;
  status: 'locked' | 'unlocked' | 'withdrawn';
  description: string;
  interestRate: number;
  interestEarned?: number;
  timeRemaining?: string;
}

export default function LockedSavings() {
  const [lockedSavings, setLockedSavings] = useState<LockedSaving[]>([]);

  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>({});
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    amount: string;
    lockPeriod: string;
    description: string;
  }>();

  // Calculate time remaining
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const remaining: { [key: string]: string } = {};

      lockedSavings.forEach((saving) => {
        if (saving.status === 'locked') {
          const unlockTime = new Date(saving.unlockDate).getTime();
          const nowTime = new Date().getTime();
          const diffTime = unlockTime - nowTime;

          if (diffTime > 0) {
            const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
              remaining[saving.id] = `${days}d ${hours}h remaining`;
            } else if (hours > 0) {
              remaining[saving.id] = `${hours}h ${minutes}m remaining`;
            } else {
              remaining[saving.id] = `${minutes}m remaining`;
            }
          } else {
            remaining[saving.id] = 'Ready to unlock';
          }
        }
      });

      setTimeRemaining(remaining);
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [lockedSavings]);

  const onSubmit = (data: { amount: string; lockPeriod: string; description: string }) => {
    const now = new Date();
    let unlockDate = new Date(now);

    switch (data.lockPeriod) {
      case 'hourly':
        unlockDate.setHours(unlockDate.getHours() + 1);
        break;
      case 'daily':
        unlockDate.setDate(unlockDate.getDate() + 1);
        break;
      case 'monthly':
        unlockDate.setMonth(unlockDate.getMonth() + 1);
        break;
      case 'yearly':
        unlockDate.setFullYear(unlockDate.getFullYear() + 1);
        break;
    }

    const newSaving: LockedSaving = {
      id: Date.now().toString(),
      amount: parseFloat(data.amount),
      lockPeriod: data.lockPeriod as 'hourly' | 'daily' | 'monthly' | 'yearly',
      createdDate: now.toISOString().split('T')[0],
      unlockDate: unlockDate.toISOString().split('T')[0],
      status: 'locked',
      description: data.description,
      interestRate: data.lockPeriod === 'yearly' ? 7.2 : data.lockPeriod === 'monthly' ? 4.5 : data.lockPeriod === 'daily' ? 2.0 : 0.5,
    };

    setLockedSavings([newSaving, ...lockedSavings]);
    reset();
  };

  const totalLocked = lockedSavings
    .filter((s) => s.status === 'locked')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalUnlocked = lockedSavings
    .filter((s) => s.status === 'unlocked')
    .reduce((sum, s) => sum + s.amount, 0);

  const getTotalInterest = () => {
    return lockedSavings.reduce((sum, s) => sum + (s.amount * s.interestRate) / 100, 0).toFixed(2);
  };

  const getLockPeriodLabel = (period: string) => {
    const labels: { [key: string]: string } = {
      hourly: '⏰ Hourly Lock',
      daily: '📅 Daily Lock',
      monthly: '📆 Monthly Lock',
      yearly: '📊 Yearly Lock',
    };
    return labels[period] || period;
  };

  const getPeriodColor = (period: string) => {
    const colors: { [key: string]: string } = {
      hourly: 'from-[#4A8B6E] to-[#2c3e5f]',
      daily: 'from-[#6BAF8D] to-[#4A8B6E]',
      monthly: 'from-[#2c3e5f] to-[#1e2d46]',
      yearly: 'from-[#1e2d46] to-[#143316]',
    };
    return colors[period] || 'from-gray-400 to-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#2c3e5f] text-white p-6 rounded-[28px] shadow-sm">
          <p className="text-sm opacity-90 mb-2">TOTAL LOCKED</p>
          <p className="text-4xl font-bold mb-2">₦{totalLocked.toLocaleString()}</p>
          <p className="text-xs opacity-75">Funds in active lock period</p>
        </div>

        <div className="bg-[#4A8B6E] text-white p-6 rounded-[28px] shadow-sm">
          <p className="text-sm opacity-90 mb-2">READY TO UNLOCK</p>
          <p className="text-4xl font-bold mb-2">₦{totalUnlocked.toLocaleString()}</p>
          <p className="text-xs opacity-75">Available to withdraw</p>
        </div>

        <div className="bg-[#6BAF8D] text-white p-6 rounded-[28px] shadow-sm">
          <p className="text-sm opacity-90 mb-2">INTEREST (PAID AT UNLOCK)</p>
          <p className="text-4xl font-bold mb-2">₦{getTotalInterest()}</p>
          <p className="text-xs opacity-75">Earnings upon unlock date</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-3">💡 How Locked Savings Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="font-semibold text-blue-800">⏰ Hourly</p>
            <p className="text-blue-700 text-xs">Lock for 1 hour, 0.5% interest</p>
          </div>
          <div>
            <p className="font-semibold text-blue-800">📅 Daily</p>
            <p className="text-blue-700 text-xs">Lock for 1 day, 2% interest</p>
          </div>
          <div>
            <p className="font-semibold text-blue-800">📆 Monthly</p>
            <p className="text-blue-700 text-xs">Lock for 1 month, 4.5% interest</p>
          </div>
          <div>
            <p className="font-semibold text-blue-800">📊 Yearly</p>
            <p className="text-blue-700 text-xs">Lock for 1 year, 7.2% interest</p>
          </div>
        </div>
      </div>

      {/* Active Locked Savings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">🔒 Locked Savings</h3>
        <div className="space-y-4">
          {lockedSavings
            .filter((s) => s.status === 'locked')
            .map((saving) => (
              <div key={saving.id} className={`bg-gradient-to-r ${getPeriodColor(saving.lockPeriod)} text-white p-5 rounded-lg`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-lg">{saving.description}</p>
                    <p className="text-xs opacity-90">{getLockPeriodLabel(saving.lockPeriod)}</p>
                  </div>
                  <p className="text-2xl font-bold">₦{saving.amount.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="opacity-90">⏳ Time Remaining</p>
                    <p className="font-semibold">{timeRemaining[saving.id] || 'Calculating...'}</p>
                  </div>
                  <div>
                    <p className="opacity-90">💰 Interest Rate</p>
                    <p className="font-semibold">{saving.interestRate}% APY</p>
                  </div>
                  <div>
                    <p className="opacity-90">💵 Interest (At Unlock)</p>
                    <p className="font-semibold">₦{((saving.amount * saving.interestRate) / 100).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-3 bg-white bg-opacity-20 backdrop-blur px-3 py-2 rounded text-xs">
                  <p>Unlock Date: {new Date(saving.unlockDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  <p className="mt-1">You will receive ₦{(saving.amount + (saving.amount * saving.interestRate) / 100).toLocaleString()} total</p>
                </div>
              </div>
            ))}
          {lockedSavings.filter((s) => s.status === 'locked').length === 0 && (
            <p className="text-gray-500 text-center py-4">No active locked savings</p>
          )}
        </div>
      </div>

      {/* Unlocked Savings */}
      {lockedSavings.some((s) => s.status === 'unlocked') && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">🔓 Ready to Withdraw</h3>
          <div className="space-y-3">
            {lockedSavings
              .filter((s) => s.status === 'unlocked')
              .map((saving) => (
                <div key={saving.id} className="p-4 border-2 border-green-300 bg-green-50 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{saving.description}</p>
                    <p className="text-xs text-gray-600">Unlocked on {new Date(saving.unlockDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-700 mb-1">Principal: ₦{saving.amount.toLocaleString()}</p>
                    <p className="text-sm text-green-600 mb-2">Interest: ₦{saving.interestEarned?.toLocaleString() || '0'}</p>
                    <p className="text-2xl font-bold text-green-600">₦{(saving.amount + (saving.interestEarned || 0)).toLocaleString()}</p>
                    <button className="mt-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                      Withdraw
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Create New Locked Savings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">➕ Create Locked Savings</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Amount (₦ Min: ₦5,000)</label>
              <input
                type="number"
                step="1"
                placeholder="Enter amount (minimum ₦5,000)"
                {...register('amount', { 
                  required: 'Amount is required',
                  valueAsNumber: true,
                  min: { value: 5000, message: 'Minimum investment is ₦5,000' },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Lock Period</label>
              <select
                {...register('lockPeriod', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Select period</option>
                <option value="hourly">⏰ Hourly (0.5% APY)</option>
                <option value="daily">📅 Daily (2% APY)</option>
                <option value="monthly">📆 Monthly (4.5% APY)</option>
                <option value="yearly">📊 Yearly (7.2% APY)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <input
                type="text"
                placeholder="e.g., Emergency Fund"
                {...register('description', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800">
            <p>
              <strong>⚠️ Important:</strong> Once locked, you cannot withdraw funds until the lock period expires. Interest is automatically added to your account when the lock period ends. Choose your lock period carefully!
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-[#2c3e5f] text-white py-3 rounded-[40px] font-semibold hover:bg-[#1e2d46] transition-all"
          >
            Lock Savings
          </button>
        </form>
      </div>
    </div>
  );
}
