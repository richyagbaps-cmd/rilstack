'use client';

import React, { useState } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

// Icon Components
const TrendUpIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8L5.257 19.643M5 7h8v8" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const WalletIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function Dashboard() {
  const [stats] = useState({
    totalBalance: 3076650,
    availableForWithdrawal: 1560000,
    lockedSavings: 450000,
    totalIncome: 450000,
    totalExpenses: 285000,
    savingsRate: 36.7,
    netWorth: 1250000,
    monthlyIncome: 150000,
    monthlyMilestoneProgress: 65,
    investmentGrowth: 12.5,
    previousMonthSavings: 32100,
  });

  const [monthlyData] = useState([
    { month: 'Jan', income: 150000, expenses: 96000, needs: 75000, wants: 45000, savings: 30000 },
    { month: 'Feb', income: 156000, expenses: 102000, needs: 78000, wants: 48000, savings: 31200 },
    { month: 'Mar', income: 165000, expenses: 108000, needs: 82500, wants: 49500, savings: 33000 },
    { month: 'Apr', income: 159000, expenses: 99000, needs: 79500, wants: 45000, savings: 31800 },
    { month: 'May', income: 162000, expenses: 105000, needs: 81000, wants: 48600, savings: 32400 },
    { month: 'June', income: 168000, expenses: 111000, needs: 84000, wants: 52500, savings: 33600 },
  ]);

  const [expenseBreakdown] = useState([
    { name: 'Needs', value: 480000, color: '#0ea5e9' },
    { name: 'Wants', value: 270000, color: '#a855f7' },
    { name: 'Savings', value: 195000, color: '#10b981' },
  ]);

  const [investmentPortfolio] = useState([
    { type: 'T-Bills', amount: 600000, percentage: 30, color: '#0ea5e9', growth: 2.1 },
    { type: 'Bonds', amount: 450000, percentage: 23, color: '#a855f7', growth: 1.8 },
    { type: 'Mutual Funds', amount: 550000, percentage: 27, color: '#10b981', growth: 8.4 },
    { type: 'Fixed Deposits', amount: 400000, percentage: 20, color: '#f59e0b', growth: 3.2 },
  ]);

  const milestones = [
    { 
      name: 'Emergency Fund', 
      current: 500000, 
      target: 750000, 
      percentage: 67,
      description: 'Essential liquid savings for unexpected expenses'
    },
    { 
      name: 'House Fund', 
      current: 1200000, 
      target: 5000000, 
      percentage: 24,
      description: 'Long-term savings for property investment'
    },
    { 
      name: 'Vacation Fund', 
      current: 150000, 
      target: 500000, 
      percentage: 30,
      description: 'Discretionary travel and leisure budget'
    },
  ];

  return (
    <div className="space-y-6 pb-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen p-6">
      {/* Welcome Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">Financial Overview</h1>
            <p className="text-slate-400 text-base">Real-time portfolio insights and performance metrics</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-sm mb-2">Total Portfolio Value</p>
            <p className="text-3xl font-bold text-cyan-400">₦{((stats.totalBalance + stats.lockedSavings) / 1000000).toFixed(2)}M</p>
          </div>
        </div>

        {/* Primary Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Total Balance Card */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl backdrop-blur-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 border border-cyan-500/20 rounded-2xl group-hover:border-cyan-500/50 transition-colors"></div>
            <div className="absolute top-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="relative p-7 bg-slate-800/40">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <p className="text-cyan-300/70 text-xs font-semibold tracking-widest mb-2 uppercase">Total Balance</p>
                  <p className="text-white text-3xl font-bold">₦{(stats.totalBalance / 1000000).toFixed(2)}M</p>
                </div>
                <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <WalletIcon />
                </div>
              </div>
              <div className="flex items-center gap-2 text-cyan-400 text-sm">
                <TrendUpIcon />
                <span>+₦{stats.previousMonthSavings.toLocaleString()} this month</span>
              </div>
            </div>
          </div>

          {/* Available Balance Card */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl backdrop-blur-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 border border-emerald-500/20 rounded-2xl group-hover:border-emerald-500/50 transition-colors"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="relative p-7 bg-slate-800/40">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <p className="text-emerald-300/70 text-xs font-semibold tracking-widest mb-2 uppercase">Liquid Cash</p>
                  <p className="text-white text-3xl font-bold">₦{(stats.availableForWithdrawal / 1000000).toFixed(2)}M</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <ChartIcon />
                </div>
              </div>
              <p className="text-emerald-300/70 text-sm">Ready for instant withdrawal</p>
            </div>
          </div>

          {/* Locked Savings Card */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl backdrop-blur-xl group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 border border-amber-500/20 rounded-2xl group-hover:border-amber-500/50 transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
            <div className="relative p-7 bg-slate-800/40">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <p className="text-amber-300/70 text-xs font-semibold tracking-widest mb-2 uppercase">Protected Savings</p>
                  <p className="text-white text-3xl font-bold">₦{(stats.lockedSavings / 1000000).toFixed(2)}M</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <LockIcon />
                </div>
              </div>
              <p className="text-amber-300/70 text-sm">Time-locked until goal date</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-colors backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-sm font-semibold">Savings Rate</p>
            <TrendUpIcon />
          </div>
          <p className="text-3xl font-bold text-cyan-400 mb-1">{stats.savingsRate}%</p>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2 rounded-full" style={{ width: `${stats.savingsRate}%` }}></div>
          </div>
          <p className="text-slate-500 text-xs mt-2">Percentage of income saved</p>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-colors backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-sm font-semibold">Net Worth</p>
            <ChartIcon />
          </div>
          <p className="text-3xl font-bold text-purple-400 mb-1">₦{(stats.netWorth / 1000000).toFixed(2)}M</p>
          <p className="text-emerald-400 text-sm font-semibold">+8% growth YTD</p>
          <p className="text-slate-500 text-xs mt-1">Total assets value</p>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-colors backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-sm font-semibold">Portfolio Growth</p>
            <TrendUpIcon />
          </div>
          <p className="text-3xl font-bold text-emerald-400 mb-1">{stats.investmentGrowth}%</p>
          <p className="text-emerald-400 text-sm font-semibold">+₦{(2064650 * (stats.investmentGrowth / 100)).toLocaleString()}</p>
          <p className="text-slate-500 text-xs mt-1">Year-to-date returns</p>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-colors backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-sm font-semibold">Monthly Income</p>
            <WalletIcon />
          </div>
          <p className="text-3xl font-bold text-amber-400 mb-1">₦{(stats.monthlyIncome / 1000).toFixed(0)}K</p>
          <p className="text-slate-500 text-xs mt-2">Stable recurring income</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income & Expenses Trend */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Financial Trends</h3>
              <p className="text-slate-400 text-sm">6-month income and spending analysis</p>
            </div>
            <span className="text-xs bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full">Last 6 Months</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9' }} />
              <Area type="monotone" dataKey="income" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Spending Breakdown */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Spending Breakdown</h3>
            <p className="text-slate-400 text-sm mb-6">Distribution of expenses by category</p>
          </div>
          <div className="flex gap-8">
            <ResponsiveContainer width="40%" height={280}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-4">
              {expenseBreakdown.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-slate-200 font-semibold text-sm">{item.name}</p>
                    <span className="text-slate-300 font-bold">₦{(item.value).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${(item.value / 945000) * 100}%`, backgroundColor: item.color }}></div>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">{Math.round((item.value / 945000) * 100)}% of total spending</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Investment Portfolio */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-2">Investment Portfolio</h3>
          <p className="text-slate-400 text-sm">Asset allocation and performance metrics</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={investmentPortfolio}
                cx="50%"
                cy="50%"
                paddingAngle={2}
                dataKey="amount"
                label={({ type, percentage }) => `${type} ${percentage}%`}
              >
                {investmentPortfolio.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `₦${(value/1000000).toFixed(1)}M`} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-3">
            {investmentPortfolio.map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors bg-slate-900/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <p className="font-semibold text-slate-200">{item.type}</p>
                  </div>
                  <span className="text-sm bg-slate-700/50 text-slate-300 px-2 py-1 rounded">{item.percentage}%</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-400">₦{(item.amount).toLocaleString()}</p>
                  <span className="text-sm text-emerald-400 font-semibold">+{item.growth}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Savings Goals */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-2">Savings Milestones</h3>
          <p className="text-slate-400 text-sm">Track your progress toward financial goals</p>
        </div>
        <div className="space-y-5">
          {milestones.map((goal, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-slate-200 font-semibold">{goal.name}</p>
                <span className="text-sm text-slate-400">₦{(goal.current).toLocaleString()} / ₦{(goal.target).toLocaleString()}</span>
              </div>
              <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500" 
                  style={{ width: `${goal.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">{goal.percentage}% Complete</p>
                <p className="text-xs text-slate-400 font-semibold">₦{(goal.target - goal.current).toLocaleString()} to goal</p>
              </div>
              <p className="text-xs text-slate-500 italic">{goal.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
