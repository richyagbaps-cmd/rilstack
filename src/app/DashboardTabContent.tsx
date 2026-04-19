import React, { useState } from "react";
import SavingsInvestmentsCarousel from "@/components/SavingsInvestmentsCarousel";
import MetricCardsCarousel from "@/components/MetricCardsCarousel";
import RecentActivity from "@/components/RecentActivity";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const summaryCards = [
  {
    label: "Income",
    value: "₦150,000",
    color: "bg-[#f3f4fa]",
    detail: "Total income this month",
    tone: "border-[#E9EDF2] bg-white",
  },
  {
    label: "Expense",
    value: "₦94,000",
    color: "bg-[#f3f4fa]",
    detail: "Total expenses this month",
    tone: "border-[#E9EDF2] bg-white",
  },
  {
    label: "Balance",
    value: "₦56,000",
    color: "bg-[#f3f4fa]",
    detail: "Current account balance",
    tone: "border-[#E9EDF2] bg-white",
  },
  {
    label: "Savings",
    value: "₦12,000",
    color: "bg-[#f3f4fa]",
    detail: "Total savings this month",
    tone: "border-[#E9EDF2] bg-white",
  },
];
const barData = [
  { name: "Jan", income: 20000, expense: 12000 },
  { name: "Feb", income: 25000, expense: 15000 },
  { name: "Mar", income: 18000, expense: 9000 },
  { name: "Apr", income: 30000, expense: 20000 },
  { name: "May", income: 22000, expense: 11000 },
  { name: "Jun", income: 35000, expense: 17000 },
];
const pieData = [
  { name: "Essentials", value: 50, color: "#7C3AED" },
  { name: "Flexible", value: 30, color: "#6366F1" },
  { name: "Goals", value: 20, color: "#A5B4FC" },
];

export default function DashboardTabContent() {
  const [tab, setTab] = useState(0);
  // 0: Overview, 1: Budget & Save, 2: Invest
  return (
    <>
      <div className="w-full max-w-2xl mx-auto mb-10" style={{fontFamily: "'Inter', sans-serif"}}>
        <div className="flex rounded-[16px] bg-[#F8F9FA] p-2 shadow gap-3 md:gap-6" style={{boxShadow: "0 4px 16px #1A5F7A22, 2px 2px 0 #F4A26133"}}>
          <button
            className={`flex-1 py-4 md:py-5 rounded-[12px] font-semibold text-base md:text-lg ${tab === 0 ? "text-[#1A5F7A] bg-white shadow" : "text-[#4A5F7A]"} transition`}
            style={tab === 0 ? {boxShadow: "2px 2px 0 #F4A26133"} : {}}
            onClick={() => setTab(0)}
          >
            Overview
          </button>
          <button
            className={`flex-1 py-4 md:py-5 rounded-[12px] font-semibold text-base md:text-lg ${tab === 1 ? "text-[#F4A261] bg-white shadow" : "text-[#4A5F7A]"} transition`}
            style={tab === 1 ? {boxShadow: "2px 2px 0 #F4A26133"} : {}}
            onClick={() => setTab(1)}
          >
            Budget & Save
          </button>
          <button
            className={`flex-1 py-4 md:py-5 rounded-[12px] font-semibold text-base md:text-lg ${tab === 2 ? "text-[#2E7D32] bg-white shadow" : "text-[#4A5F7A] hover:text-[#2E7D32]"}`}
            style={tab === 2 ? {boxShadow: "2px 2px 0 #F4A26133"} : {}}
            onClick={() => setTab(2)}
          >
            Invest
          </button>
        </div>
      </div>
      {tab === 0 && (
        <>
          {/* MovingWidget removed to unblock deployment */}
          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {summaryCards.map((card, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 shadow border border-[#E9EDF2] ${card.color}`}
              >
                <div className="text-xs text-[#7a869a] mb-1">{card.label}</div>
                <div className="text-2xl font-bold text-[#2c3e5f]">
                  {card.value}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex-1 bg-[#f8f9fc] rounded-2xl p-6 shadow">
              <h2 className="text-lg font-semibold text-[#2c3e5f] mb-4">
                Income & Expenses
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={barData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorIncome"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorExpense"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#7a869a" />
                  <YAxis stroke="#7a869a" />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#7C3AED"
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#6366F1"
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-80 bg-[#f8f9fc] rounded-2xl p-6 shadow flex flex-col items-center">
              <h2 className="text-lg font-semibold text-[#2c3e5f] mb-4">
                Spending Breakdown
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-4 space-y-1 text-xs text-[#4A5B6E]">
                {pieData.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ background: item.color }}
                    ></span>
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <RecentActivity />
          {/* Quick Support & Security Footer */}
          <div className="w-full flex justify-center mt-8 mb-4">
            <div className="flex gap-2 md:gap-4 bg-transparent rounded-xl p-2">
              <button
                className="flex flex-col items-center px-4 py-2 rounded-lg border border-transparent hover:bg-[#F8F9FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A] transition"
                style={{ minWidth: 90 }}
                aria-label="Report Fraud"
                onClick={() => alert('Fraud reporting coming soon!')}
              >
                <span style={{ fontSize: 22, color: '#2E7D32', marginBottom: 2 }}>🛡️</span>
                <span style={{ fontSize: 13, color: '#1A5F7A', fontWeight: 600 }}>Report Fraud</span>
              </button>
              <button
                className="flex flex-col items-center px-4 py-2 rounded-lg border border-transparent hover:bg-[#F8F9FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A] transition"
                style={{ minWidth: 90 }}
                aria-label="Help & Support"
                onClick={() => alert('Support center coming soon!')}
              >
                <span style={{ fontSize: 22, color: '#F4A261', marginBottom: 2 }}>❓</span>
                <span style={{ fontSize: 13, color: '#1A5F7A', fontWeight: 600 }}>Help & Support</span>
              </button>
              <button
                className="flex flex-col items-center px-4 py-2 rounded-lg border border-transparent hover:bg-[#F8F9FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A] transition"
                style={{ minWidth: 90 }}
                aria-label="Settings"
                onClick={() => window.open('/settings', '_self')}
              >
                <span style={{ fontSize: 22, color: '#1A5F7A', marginBottom: 2 }}>⚙️</span>
                <span style={{ fontSize: 13, color: '#1A5F7A', fontWeight: 600 }}>Settings</span>
              </button>
            </div>
          </div>
        </>
      )}
      {tab === 1 && (
        <div className="w-full flex flex-col items-center justify-center min-h-[300px] text-[#2c3e5f] text-lg font-semibold py-12">
          Budget & Save details coming soon...
        </div>
      )}
      {tab === 2 && (
        <div className="w-full flex flex-col items-center justify-center min-h-[300px] text-[#2c3e5f] text-lg font-semibold py-12">
          Invest details coming soon...
        </div>
      )}
    </>
  );
}
