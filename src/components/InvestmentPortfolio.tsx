'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Investment {
  id: string;
  type: 'tbill' | 'bond' | 'mutual-fund';
  name: string;
  symbol: string;
  principal: number;
  interestRate: number;
  maturityDate: string;
  purchaseDate: string;
  currentValue: number;
  isClosed: boolean;
  saleCycles: {
    cycleNumber: number;
    amountAvailable: number;
    amountSold: number;
    status: 'open' | 'closed' | 'expired';
  }[];
}

type InvestmentType = 'tbill' | 'bond' | 'mutual-fund';

interface BuyInvestmentFormData {
  amount: number;
}

const INVESTMENT_CHOICES: Array<{
  type: InvestmentType;
  question: string;
  shortLabel: string;
  displayName: string;
  symbolPrefix: string;
  interestRate: number;
  maturityMonths: number;
}> = [
  {
    type: 'tbill',
    question: 'Do you want to buy T-Bills?',
    shortLabel: 'T-Bills',
    displayName: 'T-Bill Purchase',
    symbolPrefix: 'TBILL',
    interestRate: 5.2,
    maturityMonths: 6,
  },
  {
    type: 'bond',
    question: 'Do you want to buy Bonds?',
    shortLabel: 'Bonds',
    displayName: 'Bond Purchase',
    symbolPrefix: 'BOND',
    interestRate: 4.8,
    maturityMonths: 24,
  },
  {
    type: 'mutual-fund',
    question: 'Do you want to buy Mutual Funds?',
    shortLabel: 'Mutual Funds',
    displayName: 'Mutual Fund Purchase',
    symbolPrefix: 'MF',
    interestRate: 8.5,
    maturityMonths: 12,
  },
];

export default function InvestmentPortfolio() {
  const nigeriaNews = [
    {
      title: 'Q2 2026 Treasury Bills calendar points to heavy supply',
      source: 'Nairametrics',
    },
    {
      title: 'March 2026 NTB auction stop rates eased on strong liquidity',
      source: 'Nairametrics',
    },
    {
      title: 'DMO bond auction results remain a key signal for local investors',
      source: 'DMO Nigeria',
    },
  ];

  const [investments, setInvestments] = useState<Investment[]>([]);

  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(null);
  const [selectedInvestmentTypeForPurchase, setSelectedInvestmentTypeForPurchase] = useState<InvestmentType | null>(null);
  const [portfolioHistory] = useState([
    { month: 'Jan', value: 0 },
    { month: 'Feb', value: 0 },
    { month: 'Mar', value: 0 },
    { month: 'Apr', value: 0 },
    { month: 'May', value: 0 },
    { month: 'June', value: 0 },
  ]);

  const { register, handleSubmit, reset } = useForm<BuyInvestmentFormData>({
    defaultValues: {
      amount: 0,
    },
  });

  const onSubmit = (data: BuyInvestmentFormData) => {
    if (!selectedInvestmentTypeForPurchase) return;

    const selectedTypeConfig = INVESTMENT_CHOICES.find((choice) => choice.type === selectedInvestmentTypeForPurchase);
    if (!selectedTypeConfig) return;

    const purchaseAmount = Number(data.amount);
    const today = new Date();
    const maturity = new Date(today);
    maturity.setMonth(maturity.getMonth() + selectedTypeConfig.maturityMonths);

    const newInvestment: Investment = {
      id: Date.now().toString(),
      type: selectedTypeConfig.type,
      name: selectedTypeConfig.displayName,
      symbol: `${selectedTypeConfig.symbolPrefix}-${new Date().getFullYear()}`,
      principal: purchaseAmount,
      interestRate: selectedTypeConfig.interestRate,
      purchaseDate: today.toISOString().split('T')[0],
      maturityDate: maturity.toISOString().split('T')[0],
      currentValue: purchaseAmount,
      isClosed: selectedTypeConfig.type === 'mutual-fund',
      saleCycles: [
        {
          cycleNumber: 1,
          amountAvailable: purchaseAmount,
          amountSold: 0,
          status: 'open',
        },
      ],
    };

    setInvestments([...investments, newInvestment]);
    setSelectedInvestmentTypeForPurchase(null);
    reset();
  };

  const totalPortfolioValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalPrincipal = investments.reduce((sum, inv) => sum + inv.principal, 0);
  const totalGain = totalPortfolioValue - totalPrincipal;
  const gainPercentage = totalPrincipal > 0 ? ((totalGain / totalPrincipal) * 100).toFixed(2) : '0.00';

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tbill':
        return 'bg-blue-100 text-blue-800';
      case 'bond':
        return 'bg-purple-100 text-purple-800';
      case 'mutual-fund':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tbill':
        return 'T-Bill';
      case 'bond':
        return 'Bond';
      case 'mutual-fund':
        return 'Mutual Fund (CE)';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(176,140,255,0.2),_transparent_24%),linear-gradient(135deg,_rgba(8,17,29,0.96),_rgba(6,14,24,0.92))] p-5 text-white shadow-2xl md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.26em] text-violet-200">Investment View</p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Track holdings, yields, and Nigerian fixed-income signals in one place.</h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              This screen combines your holdings, portfolio performance, interest-rate summaries, and local market headlines
              so investments feel easier to interpret at a glance.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {nigeriaNews.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{item.source}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
            <Image
              src="/images/investment-grid.svg"
              alt="Investment illustration"
              width={1200}
              height={800}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-gray-500 text-sm mb-1">Portfolio Value</p>
              <p className="text-2xl font-bold text-blue-600">N{totalPortfolioValue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-gray-500 text-sm mb-1">Principal Invested</p>
              <p className="text-2xl font-bold text-gray-600">N{totalPrincipal.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-gray-500 text-sm mb-1">Interest Earned</p>
              <p className="text-2xl font-bold text-green-600">N{totalGain.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-gray-500 text-sm mb-1">Return Rate</p>
              <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {gainPercentage}%
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Portfolio Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={portfolioHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `N${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Portfolio Value" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Investment Holdings</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left font-semibold">Type</th>
                    <th className="px-4 py-2 text-left font-semibold">Name</th>
                    <th className="px-4 py-2 text-right font-semibold">Principal</th>
                    <th className="px-4 py-2 text-right font-semibold text-blue-600">Interest Rate %</th>
                    <th className="px-4 py-2 text-right font-semibold text-green-600">Interest Earned</th>
                    <th className="px-4 py-2 text-right font-semibold">Current Value</th>
                    <th className="px-4 py-2 text-center font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv) => {
                    const gain = inv.currentValue - inv.principal;
                    return (
                      <tr key={inv.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedInvestment(inv.id)}>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(inv.type)}`}>
                            {getTypeLabel(inv.type)}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div>{inv.name}</div>
                          <div className="text-xs text-gray-500">{inv.symbol}</div>
                        </td>
                        <td className="px-4 py-2 text-right">N{inv.principal.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">{inv.interestRate}%</td>
                        <td className="px-4 py-2 text-right">N{gain.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-semibold">N{inv.currentValue.toLocaleString()}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${inv.isClosed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {inv.isClosed ? 'Closed' : 'Open'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {selectedInvestment && investments.find((inv) => inv.id === selectedInvestment) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                Sale Cycles - {investments.find((inv) => inv.id === selectedInvestment)?.name}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-2 text-left font-semibold">Cycle</th>
                      <th className="px-4 py-2 text-right font-semibold">Available</th>
                      <th className="px-4 py-2 text-right font-semibold">Sold</th>
                      <th className="px-4 py-2 text-right font-semibold">Remaining</th>
                      <th className="px-4 py-2 text-center font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments
                      .find((inv) => inv.id === selectedInvestment)
                      ?.saleCycles.map((cycle) => (
                        <tr key={cycle.cycleNumber} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 font-semibold">Cycle {cycle.cycleNumber}</td>
                          <td className="px-4 py-2 text-right">N{cycle.amountAvailable.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right font-semibold">N{cycle.amountSold.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right">N{(cycle.amountAvailable - cycle.amountSold).toLocaleString()}</td>
                          <td className="px-4 py-2 text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                cycle.status === 'open'
                                  ? 'bg-blue-100 text-blue-800'
                                  : cycle.status === 'closed'
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {cycle.status.charAt(0).toUpperCase() + cycle.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Investment Types</h2>
            <div className="space-y-3">
              <div className="pb-3 border-b">
                <p className="font-semibold text-blue-600 mb-1">T-Bills</p>
                <p className="text-xs text-gray-600">Short-term government securities with guaranteed returns and low risk.</p>
              </div>
              <div className="pb-3 border-b">
                <p className="font-semibold text-purple-600 mb-1">Bonds</p>
                <p className="text-xs text-gray-600">Fixed income securities with periodic interest payments until maturity.</p>
              </div>
              <div>
                <p className="font-semibold text-green-600 mb-1">Mutual Funds</p>
                <p className="text-xs text-gray-600">Pooled funds with performance-driven returns over time.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Buy Investment</h2>
            <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-200 text-xs text-blue-800">
              Step 1: choose investment type. Step 2: enter amount to buy.
            </div>

            {!selectedInvestmentTypeForPurchase ? (
              <div className="space-y-3">
                {INVESTMENT_CHOICES.map((choice) => (
                  <button
                    key={choice.type}
                    onClick={() => setSelectedInvestmentTypeForPurchase(choice.type)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100"
                  >
                    <p className="text-sm font-semibold text-slate-900">{choice.question}</p>
                    <p className="text-xs text-slate-600">Select {choice.shortLabel} and continue.</p>
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  Selected: {getTypeLabel(selectedInvestmentTypeForPurchase)}. Enter amount to buy.
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Amount to Buy (N)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="Minimum N5,000"
                    {...register('amount', {
                      required: true,
                      valueAsNumber: true,
                      min: 5000,
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700">
                    Continue
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInvestmentTypeForPurchase(null)}
                    className="flex-1 rounded-lg bg-slate-200 py-2 font-semibold text-slate-800 hover:bg-slate-300"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
