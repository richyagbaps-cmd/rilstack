'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

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

export default function InvestmentPortfolio() {
  const [investments, setInvestments] = useState<Investment[]>([
    {
      id: '1',
      type: 'tbill',
      name: '6-Month T-Bill',
      symbol: 'TBILL-6M',
      principal: 300000,
      interestRate: 5.2,
      purchaseDate: '2024-01-15',
      maturityDate: '2024-07-15',
      currentValue: 307500,
      isClosed: false,
      saleCycles: [
        { cycleNumber: 1, amountAvailable: 150000, amountSold: 90000, status: 'closed' },
        { cycleNumber: 2, amountAvailable: 120000, amountSold: 0, status: 'open' },
      ],
    },
    {
      id: '2',
      type: 'bond',
      name: 'Government Bond - 10Y',
      symbol: 'GBOND-10Y',
      principal: 750000,
      interestRate: 4.8,
      purchaseDate: '2024-02-01',
      maturityDate: '2034-02-01',
      currentValue: 25820,
      isClosed: false,
      saleCycles: [
        { cycleNumber: 1, amountAvailable: 10000, amountSold: 10000, status: 'closed' },
        { cycleNumber: 2, amountAvailable: 8000, amountSold: 5000, status: 'open' },
      ],
    },
    {
      id: '3',
      type: 'mutual-fund',
      name: 'Balanced Mutual Fund - Close-Ended',
      symbol: 'BMF-CE',
      principal: 15000,
      interestRate: 8.5,
      purchaseDate: '2024-03-10',
      maturityDate: '2026-03-10',
      currentValue: 16480,
      isClosed: true,
      saleCycles: [
        { cycleNumber: 1, amountAvailable: 7500, amountSold: 4500, status: 'closed' },
        { cycleNumber: 2, amountAvailable: 5000, amountSold: 0, status: 'open' },
      ],
    },
  ]);

  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(null);
  const [portfolioHistory] = useState([
    { month: 'Jan', value: 45000 },
    { month: 'Feb', value: 46500 },
    { month: 'Mar', value: 48000 },
    { month: 'Apr', value: 49200 },
    { month: 'May', value: 50400 },
    { month: 'June', value: 52550 },
  ]);

  const { register, handleSubmit, reset } = useForm<{
    type: string;
    name: string;
    symbol: string;
    principal: string;
    interestRate: string;
    maturityDate: string;
    amountForSale: string;
  }>();

  const onSubmit = (data: {
    type: string;
    name: string;
    symbol: string;
    principal: string;
    interestRate: string;
    maturityDate: string;
    amountForSale: string;
  }) => {
    const newInvestment: Investment = {
      id: Date.now().toString(),
      type: data.type as 'tbill' | 'bond' | 'mutual-fund',
      name: data.name,
      symbol: data.symbol.toUpperCase(),
      principal: parseFloat(data.principal),
      interestRate: parseFloat(data.interestRate),
      purchaseDate: new Date().toISOString().split('T')[0],
      maturityDate: data.maturityDate,
      currentValue: parseFloat(data.principal),
      isClosed: data.type === 'mutual-fund',
      saleCycles: [
        {
          cycleNumber: 1,
          amountAvailable: parseFloat(data.amountForSale),
          amountSold: 0,
          status: 'open',
        },
      ],
    };
    setInvestments([...investments, newInvestment]);
    reset();
  };

  const totalPortfolioValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalPrincipal = investments.reduce((sum, inv) => sum + inv.principal, 0);
  const totalGain = totalPortfolioValue - totalPrincipal;
  const gainPercentage = ((totalGain / totalPrincipal) * 100).toFixed(2);

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Portfolio Summary & Chart */}
      <div className="lg:col-span-2 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-500 text-sm mb-1">Portfolio Value</p>
            <p className="text-2xl font-bold text-blue-600">₦{totalPortfolioValue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-500 text-sm mb-1">Principal Invested</p>
            <p className="text-2xl font-bold text-gray-600">₦{totalPrincipal.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-500 text-sm mb-1">Interest Earned</p>
            <p className="text-2xl font-bold text-green-600">₦{totalGain.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-500 text-sm mb-1">Return Rate</p>
            <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {gainPercentage}%
            </p>
          </div>
        </div>

        {/* Portfolio Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Portfolio Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={portfolioHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Portfolio Value" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Holdings Table */}
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
                  const gainPct = ((gain / inv.principal) * 100).toFixed(2);
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
                      <td className="px-4 py-2 text-right">₦{inv.principal.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold text-sm">{inv.interestRate}%</span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-semibold text-sm">
                          ₦{gain.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">₦{inv.currentValue.toLocaleString()}</td>
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

        {/* Sale Cycles for Selected Investment */}
        {selectedInvestment && investments.find(inv => inv.id === selectedInvestment) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              Sale Cycles - {investments.find(inv => inv.id === selectedInvestment)?.name}
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
                    .find(inv => inv.id === selectedInvestment)
                    ?.saleCycles.map((cycle) => (
                      <tr key={cycle.cycleNumber} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-semibold">Cycle {cycle.cycleNumber}</td>
                        <td className="px-4 py-2 text-right">₦{cycle.amountAvailable.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right font-semibold">₦{cycle.amountSold.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">₦{(cycle.amountAvailable - cycle.amountSold).toLocaleString()}</td>
                        <td className="px-4 py-2 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              cycle.status === 'open' ? 'bg-blue-100 text-blue-800' : cycle.status === 'closed' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
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

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Interest Rate Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Interest Rate Summary</h2>
          <div className="space-y-3">
            {investments.map((inv) => (
              <div key={inv.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-semibold text-sm">{inv.name}</p>
                  <p className="text-xs text-gray-600">{inv.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{inv.interestRate}%</p>
                  <p className="text-xs text-gray-600">₦{(inv.currentValue - inv.principal).toFixed(2)} earned</p>
                </div>
              </div>
            ))}
            <div className="border-t pt-3 mt-3">
              <p className="text-gray-600 text-sm mb-1">Average Interest Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {(investments.reduce((sum, inv) => sum + inv.interestRate, 0) / investments.length).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Investment Type Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">How Interest Works</h2>
          <div className="space-y-3 text-sm">
            <div className="pb-3 border-b">
              <p className="font-semibold text-blue-600 mb-1">T-Bills (5-6% APY)</p>
              <p className="text-xs text-gray-600">Government-backed short-term securities with fixed interest rates. Safe and predictable returns.</p>
            </div>
            <div className="pb-3 border-b">
              <p className="font-semibold text-purple-600 mb-1">Bonds (4-5% APY)</p>
              <p className="text-xs text-gray-600">Fixed income from periodic coupon payments. Interest paid annually or semi-annually until maturity.</p>
            </div>
            <div>
              <p className="font-semibold text-green-600 mb-1">Mutual Funds (7-10% APY)</p>
              <p className="text-xs text-gray-600">Returns from fund performance and dividends. Varies based on market conditions and asset allocation.</p>
            </div>
            <div className="bg-yellow-50 p-2 rounded mt-3 border border-yellow-200">
              <p className="text-xs font-semibold text-yellow-800">💡 Tip: Higher interest rates mean more earnings on your principal!</p>
            </div>
          </div>
        </div>

        {/* Original Investment Type Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Investment Types</h2>
          <div className="space-y-3">
            <div className="pb-3 border-b">
              <p className="font-semibold text-blue-600 mb-1">T-Bills</p>
              <p className="text-xs text-gray-600">Short-term government securities with guaranteed returns and low risk</p>
            </div>
            <div className="pb-3 border-b">
              <p className="font-semibold text-purple-600 mb-1">Bonds</p>
              <p className="text-xs text-gray-600">Fixed income securities with periodic interest payments until maturity</p>
            </div>
            <div>
              <p className="font-semibold text-green-600 mb-1">Mutual Funds (CE)</p>
              <p className="text-xs text-gray-600">Close-ended funds with fixed number of shares and sale cycles</p>
            </div>
          </div>
        </div>

        {/* Add Investment Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Add Investment</h2>
          <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>📌 Interest earned</strong> = Principal × Interest Rate (Annual)
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Investment Type</label>
              <select
                {...register('type', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Type</option>
                <option value="tbill">T-Bill</option>
                <option value="bond">Bond</option>
                <option value="mutual-fund">Mutual Fund (CE)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Name</label>
              <input
                type="text"
                placeholder="e.g., 6-Month T-Bill"
                {...register('name', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Symbol</label>
              <input
                type="text"
                placeholder="e.g., TBILL-6M"
                {...register('symbol', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Principal (₦ Min: ₦5,000)</label>
              <input
                type="number"
                step="1"
                placeholder="Minimum ₦5,000"
                {...register('principal', { 
                  required: 'Principal is required',
                  valueAsNumber: true,
                  min: { value: 5000, message: 'Minimum investment is ₦5,000' },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('interestRate', { required: true, valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Maturity Date</label>
              <input
                type="date"
                {...register('maturityDate', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Amount for Sale (₦)</label>
              <input
                type="number"
                step="1"
                placeholder="Minimum ₦5,000"
                {...register('amountForSale', { 
                  required: 'Amount is required',
                  valueAsNumber: true,
                  min: { value: 5000, message: 'Minimum amount for sale is ₦5,000' },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
              Add Investment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
