'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface Budget {
  id: string;
  category: string;
  type: 'strict' | 'lax';
  limit: number;
  spent: number;
  percentage?: number;
  currency: string;
}

interface LockedSaving {
  id: string;
  amount: number;
  lockPeriod: 'hourly' | 'daily' | 'monthly' | 'yearly';
  createdDate: string;
  unlockDate: string;
  status: 'locked' | 'unlocked' | 'withdrawn';
  description: string;
  interestRate: number;
  timeRemaining?: string;
}

const STRICT_CATEGORIES = [
  { name: 'Housing', examples: 'Rent, Mortgage, Property Tax, Home Insurance' },
  { name: 'Utilities', examples: 'Electricity, Water, Gas, Internet, Phone' },
  { name: 'Transportation', examples: 'Car Payment, Gas, Insurance, Maintenance' },
  { name: 'Insurance', examples: 'Health, Auto, Life, Home Insurance' },
  { name: 'Debt Payments', examples: 'Loan Payments, Credit Card Minimum' },
];

const LAX_CATEGORIES = [
  { name: 'Groceries', examples: 'Food, Household Items' },
  { name: 'Dining Out', examples: 'Restaurants, Coffee, Takeout' },
  { name: 'Entertainment', examples: 'Movies, Concerts, Subscriptions, Gaming' },
  { name: 'Shopping', examples: 'Clothes, Accessories, Gifts, Personal Items' },
  { name: 'Hobbies', examples: 'Sports, Art Supplies, Books, Gaming Equipment' },
  { name: 'Travel', examples: 'Vacation, Hotels, Flights, Tours' },
];

interface BudgetModel {
  needs: number;
  wants: number;
  savings: number;
}

export default function BudgetSection() {
  const [budgetModel, setBudgetModel] = useState<'50-30-20' | 'zero-based'>('50-30-20');
  const [monthlyIncome, setMonthlyIncome] = useState(150000);
  const [activeTab, setActiveTab] = useState<'budget' | 'locked-savings'>('budget');
  
  const [budgets, setBudgets] = useState<Budget[]>([
    { id: '1', category: 'Housing', type: 'strict', limit: 75000, spent: 72000, currency: 'NGN', percentage: 50 },
    { id: '2', category: 'Utilities', type: 'strict', limit: 12000, spent: 10500, currency: 'NGN' },
    { id: '3', category: 'Transportation', type: 'strict', limit: 18000, spent: 16500, currency: 'NGN' },
    { id: '4', category: 'Dining Out', type: 'lax', limit: 18000, spent: 13500, currency: 'NGN', percentage: 12 },
    { id: '5', category: 'Entertainment', type: 'lax', limit: 27000, spent: 22500, currency: 'NGN', percentage: 18 },
    { id: '6', category: 'Savings', type: 'strict', limit: 30000, spent: 15000, currency: 'NGN', percentage: 20 },
  ]);

  const [lockedSavings, setLockedSavings] = useState<LockedSaving[]>([
    {
      id: '1',
      amount: 50000,
      lockPeriod: 'monthly',
      createdDate: '2024-03-01',
      unlockDate: '2024-04-01',
      status: 'locked',
      description: 'Monthly Savings Goal',
      interestRate: 4.5,
    },
    {
      id: '2',
      amount: 100000,
      lockPeriod: 'yearly',
      createdDate: '2024-03-03',
      unlockDate: '2025-03-03',
      status: 'locked',
      description: 'Annual Emergency Fund',
      interestRate: 7.2,
    },
    {
      id: '3',
      amount: 15000,
      lockPeriod: 'daily',
      createdDate: '2024-03-02',
      unlockDate: '2024-03-03',
      status: 'unlocked',
      description: 'Daily Savings',
      interestRate: 2.0,
    },
  ]);

  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>({});
  const { register: budgetRegister, handleSubmit: budgetHandleSubmit, reset: budgetReset } = useForm<{ category: string; limit: string }>();
  const { register: lockRegister, handleSubmit: lockHandleSubmit, reset: lockReset, formState: { errors: lockErrors } } = useForm<{
    amount: string;
    lockPeriod: string;
    description: string;
  }>();

  const budgetModelAllocation: BudgetModel = {
    needs: 50,
    wants: 30,
    savings: 20,
  };

  // Calculate time remaining for locked savings
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
    const timer = setInterval(calculateTimeRemaining, 60000);

    return () => clearInterval(timer);
  }, [lockedSavings]);

  const onBudgetSubmit = (data: { category: string; limit: string }) => {
    const newBudget: Budget = {
      id: Date.now().toString(),
      category: data.category,
      type: 'lax',
      limit: parseFloat(data.limit),
      spent: 0,
      currency: 'NGN',
    };
    setBudgets([...budgets, newBudget]);
    budgetReset();
  };

  const onLockedSavingsSubmit = (data: { amount: string; lockPeriod: string; description: string }) => {
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
    lockReset();
  };

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPeriodColor = (period: string) => {
    const colors: { [key: string]: string } = {
      hourly: 'from-blue-400 to-blue-500',
      daily: 'from-green-400 to-green-500',
      monthly: 'from-purple-400 to-purple-500',
      yearly: 'from-orange-400 to-orange-500',
    };
    return colors[period] || 'from-gray-400 to-gray-500';
  };

  const strictBudgets = budgets.filter(b => b.type === 'strict');
  const laxBudgets = budgets.filter(b => b.type === 'lax');
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const strictSpent = strictBudgets.reduce((sum, b) => sum + b.spent, 0);
  const laxSpent = laxBudgets.reduce((sum, b) => sum + b.spent, 0);

  const totalLocked = lockedSavings
    .filter((s) => s.status === 'locked')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalUnlocked = lockedSavings
    .filter((s) => s.status === 'unlocked')
    .reduce((sum, s) => sum + s.amount, 0);

  const getTotalInterest = () => {
    return lockedSavings.reduce((sum, s) => sum + (s.amount * s.interestRate) / 100, 0).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-300">
        <button
          onClick={() => setActiveTab('budget')}
          className={`px-6 py-3 font-semibold border-b-2 transition-all ${
            activeTab === 'budget'
              ? 'border-blue-800 text-blue-800'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          💰 Budget Management
        </button>
        <button
          onClick={() => setActiveTab('locked-savings')}
          className={`px-6 py-3 font-semibold border-b-2 transition-all ${
            activeTab === 'locked-savings'
              ? 'border-blue-800 text-blue-800'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          🔒 Locked Savings
        </button>
      </div>

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Budget Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              {/* Budget Model Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Select Budget Model</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setBudgetModel('50-30-20')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      budgetModel === '50-30-20'
                        ? 'border-blue-800 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-2">50/30/20 Budget</div>
                    <div className="text-xs text-gray-600">
                      <div>50% Needs</div>
                      <div>30% Wants</div>
                      <div>20% Savings</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setBudgetModel('zero-based')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      budgetModel === 'zero-based'
                        ? 'border-blue-800 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-2">Zero-Based Budget</div>
                    <div className="text-xs text-gray-600">
                      <div>Every dollar assigned</div>
                      <div>Custom allocation</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Income Input */}
              <div className="mb-6 pb-6 border-b">
                <label className="block text-sm font-semibold mb-2">Monthly Income</label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 50-30-20 Model Overview */}
              {budgetModel === '50-30-20' && (
                <div className="mb-6 pb-6 border-b">
                  <h3 className="text-lg font-semibold mb-4">50/30/20 Breakdown</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm mb-1">NEEDS (50%)</p>
                      <p className="text-2xl font-bold text-blue-600">₦{(monthlyIncome * 0.5).toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-2">Housing, Utilities, Food, Insurance</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm mb-1">WANTS (30%)</p>
                      <p className="text-2xl font-bold text-purple-600">₦{(monthlyIncome * 0.3).toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-2">Entertainment, Dining, Shopping</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm mb-1">SAVINGS (20%)</p>
                      <p className="text-2xl font-bold text-green-600">₦{(monthlyIncome * 0.2).toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-2">Emergency Fund, Investments</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Strict Categories (Needs) */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">!</span>
                  Strict Categories (Essential)
                </h3>
                <div className="space-y-4">
                  {strictBudgets.map((budget) => {
                    const percentage = (budget.spent / budget.limit) * 100;
                    return (
                      <div key={budget.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <h3 className="font-semibold text-lg">{budget.category}</h3>
                          <span className="text-gray-600">₦{budget.spent.toLocaleString()} / ₦{budget.limit.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(budget.spent, budget.limit)}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{percentage.toFixed(1)}% of budget spent</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lax Categories (Wants) */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">*</span>
                  Lax Categories (Flexible)
                </h3>
                <div className="space-y-4">
                  {laxBudgets.map((budget) => {
                    const percentage = (budget.spent / budget.limit) * 100;
                    return (
                      <div key={budget.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <h3 className="font-semibold text-lg">{budget.category}</h3>
                          <span className="text-gray-600">₦{budget.spent.toLocaleString()} / ₦{budget.limit.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(budget.spent, budget.limit)}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{percentage.toFixed(1)}% of budget spent</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Budget Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Budget Summary</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600 text-sm">Total Spent</p>
                  <p className="text-2xl font-bold text-blue-800">₦{totalSpent.toLocaleString()}</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-gray-600 text-sm">Strict Expenses</p>
                  <p className="text-xl font-semibold text-red-600">₦{strictSpent.toLocaleString()}</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-gray-600 text-sm">Flexible Expenses</p>
                  <p className="text-xl font-semibold text-yellow-600">₦{laxSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Add Budget Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Add Budget</h2>
              <form onSubmit={budgetHandleSubmit(onBudgetSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <select
                    {...budgetRegister('category', { required: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    <optgroup label="Strict Categories">
                      {STRICT_CATEGORIES.map(cat => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Lax Categories">
                      {LAX_CATEGORIES.map(cat => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Budget Limit (₦)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g., 50000"
                    {...budgetRegister('limit', { 
                      required: 'Budget limit is required',
                      valueAsNumber: true,
                      min: { value: 5000, message: 'Minimum budget is ₦5,000' },
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button type="submit" className="w-full bg-blue-800 text-white py-2 rounded-lg font-semibold hover:bg-blue-900">
                  Add Budget
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Locked Savings Tab */}
      {activeTab === 'locked-savings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Locked Savings Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-lg">
                <p className="text-sm mb-1">Total Locked</p>
                <p className="text-2xl font-bold">₦{totalLocked.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 shadow-lg">
                <p className="text-sm mb-1">Ready to Unlock</p>
                <p className="text-2xl font-bold">₦{totalUnlocked.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-4 shadow-lg">
                <p className="text-sm mb-1">Interest at Unlock</p>
                <p className="text-2xl font-bold">₦{(parseFloat(getTotalInterest())).toLocaleString()}</p>
              </div>
            </div>

            {/* Active Locked Savings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">🔒 Currently Locked</h3>
              <div className="space-y-4">
                {lockedSavings.filter(s => s.status === 'locked').map((saving) => (
                  <div key={saving.id} className={`bg-gradient-to-r ${getPeriodColor(saving.lockPeriod)} text-white rounded-lg p-4`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-lg">{saving.description}</h4>
                        <p className="text-sm opacity-90">₦{saving.amount.toLocaleString()} locked</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm opacity-90">Unlocks in:</p>
                        <p className="font-bold">{timeRemaining[saving.id] || 'calculating...'}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm mt-3 pt-3 border-t border-white border-opacity-30">
                      <span>Period: {saving.lockPeriod}</span>
                      <span>Interest Rate: {saving.interestRate}%</span>
                      <span className="font-semibold">Est. Interest: ₦{(saving.amount * saving.interestRate / 100).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {lockedSavings.filter(s => s.status === 'locked').length === 0 && (
                  <p className="text-center text-gray-500 py-4">No active locked savings</p>
                )}
              </div>
            </div>

            {/* Ready to Unlock */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">✅ Ready to Unlock</h3>
              <div className="space-y-3">
                {lockedSavings.filter(s => s.status === 'unlocked').map((saving) => (
                  <div key={saving.id} className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{saving.description}</h4>
                      <p className="text-sm text-gray-600">Principal: ₦{saving.amount.toLocaleString()} + Interest: ₦{(saving.amount * saving.interestRate / 100).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => {
                        setLockedSavings(lockedSavings.map(s => 
                          s.id === saving.id ? { ...s, status: 'withdrawn' as const } : s
                        ));
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold text-sm"
                    >
                      Withdraw
                    </button>
                  </div>
                ))}
                {lockedSavings.filter(s => s.status === 'unlocked').length === 0 && (
                  <p className="text-center text-gray-500 py-4">No unlocked savings available</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Create New Locked Savings */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Create Locked Savings</h2>
              <form onSubmit={lockHandleSubmit(onLockedSavingsSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Amount (₦)</label>
                  <input
                    type="number"
                    placeholder="Minimum ₦5,000"
                    {...lockRegister('amount', {
                      required: 'Amount is required',
                      valueAsNumber: true,
                      min: { value: 5000, message: 'Minimum is ₦5,000' },
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-800"
                  />
                  {lockErrors.amount && <p className="text-red-600 text-xs mt-1">{lockErrors.amount.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Lock Period</label>
                  <select
                    {...lockRegister('lockPeriod', { required: 'Lock period is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-800"
                  >
                    <option value="">Select Period</option>
                    <option value="hourly">⏰ Hourly (0.5% APY)</option>
                    <option value="daily">📅 Daily (2.0% APY)</option>
                    <option value="monthly">📆 Monthly (4.5% APY)</option>
                    <option value="yearly">📊 Yearly (7.2% APY)</option>
                  </select>
                  {lockErrors.lockPeriod && <p className="text-red-600 text-xs mt-1">{lockErrors.lockPeriod.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <input
                    type="text"
                    placeholder="e.g., Emergency Fund"
                    {...lockRegister('description', { required: 'Description is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-800"
                  />
                  {lockErrors.description && <p className="text-red-600 text-xs mt-1">{lockErrors.description.message}</p>}
                </div>

                <button type="submit" className="w-full bg-blue-800 text-white py-2 rounded-lg font-semibold hover:bg-blue-900">
                  Lock Savings
                </button>
              </form>
            </div>

            {/* Interest Rates Info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">💡 Interest Rates</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-blue-800">
                  <span>⏰ Hourly:</span>
                  <span className="font-bold">0.5%</span>
                </div>
                <div className="flex justify-between text-blue-800">
                  <span>📅 Daily:</span>
                  <span className="font-bold">2.0%</span>
                </div>
                <div className="flex justify-between text-blue-800">
                  <span>📆 Monthly:</span>
                  <span className="font-bold">4.5%</span>
                </div>
                <div className="flex justify-between text-blue-800">
                  <span>📊 Yearly:</span>
                  <span className="font-bold">7.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
