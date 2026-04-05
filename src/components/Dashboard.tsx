'use client';

import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type FocusMode = 'savings' | 'investments' | 'budgeting';

const FOCUS_CONTENT: Record<
  FocusMode,
  {
    title: string;
    headline: string;
    description: string;
    image: string;
    accent: string;
  }
> = {
  savings: {
    title: 'Savings Safelock',
    headline: 'Protect cash before impulse spending reaches it.',
    description:
      'Visualize how strict-mode safelock keeps funds sealed until the right date while still compounding your discipline.',
    image: '/images/savings-orbit.svg',
    accent: 'from-cyan-500/30 via-emerald-400/20 to-transparent',
  },
  investments: {
    title: 'Investment Engine',
    headline: 'See growth lanes, not just account balances.',
    description:
      'Your portfolio is presented as a live signal grid so bonds, funds, and treasury positions feel like an active system.',
    image: '/images/investment-grid.svg',
    accent: 'from-violet-500/30 via-sky-400/20 to-transparent',
  },
  budgeting: {
    title: 'Budget Command Map',
    headline: 'Turn category planning into a visual operating system.',
    description:
      'Group needs, wants, and goals into one clean map that feels editable, intentional, and easy to act on.',
    image: '/images/budget-map.svg',
    accent: 'from-amber-500/30 via-pink-400/20 to-transparent',
  },
};

const monthlyData = [
  { month: 'Jan', income: 150000, expenses: 96000, invest: 28000 },
  { month: 'Feb', income: 156000, expenses: 102000, invest: 29500 },
  { month: 'Mar', income: 165000, expenses: 108000, invest: 31000 },
  { month: 'Apr', income: 159000, expenses: 99000, invest: 30500 },
  { month: 'May', income: 162000, expenses: 105000, invest: 32000 },
  { month: 'Jun', income: 168000, expenses: 111000, invest: 33800 },
];

const spendMix = [
  { name: 'Essentials', value: 52, color: '#63F0D6' },
  { name: 'Flexible', value: 26, color: '#4EA1FF' },
  { name: 'Goals', value: 22, color: '#B08CFF' },
];

const portfolioBars = [
  { name: 'T-Bills', amount: 600000, momentum: '+2.1%' },
  { name: 'Bonds', amount: 450000, momentum: '+1.8%' },
  { name: 'Funds', amount: 550000, momentum: '+8.4%' },
  { name: 'Fixed', amount: 400000, momentum: '+3.2%' },
];

const metricCards = [
  {
    label: 'Safelock Balance',
    value: 'N450K',
    detail: 'Locked until target dates',
    tone: 'from-cyan-500/20 to-transparent border-cyan-400/30',
  },
  {
    label: 'AI Budget Sync',
    value: '94%',
    detail: 'Categories aligned with income',
    tone: 'from-emerald-500/20 to-transparent border-emerald-400/30',
  },
  {
    label: 'Investment Velocity',
    value: '+12.5%',
    detail: 'Year-to-date lift',
    tone: 'from-violet-500/20 to-transparent border-violet-400/30',
  },
  {
    label: 'Liquidity Window',
    value: 'N1.56M',
    detail: 'Ready for flexible access',
    tone: 'from-amber-500/20 to-transparent border-amber-400/30',
  },
];

export default function Dashboard() {
  const [focusMode, setFocusMode] = useState<FocusMode>('savings');
  const focus = FOCUS_CONTENT[focusMode];

  const portfolioTotal = useMemo(
    () => portfolioBars.reduce((sum, item) => sum + item.amount, 0),
    [],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(74,222,255,0.16),_transparent_20%),radial-gradient(circle_at_top_right,_rgba(191,90,255,0.14),_transparent_24%),linear-gradient(180deg,_#050816_0%,_#09101d_48%,_#050816_100%)] px-3 pb-12 pt-4 text-white md:px-6 md:pt-6">
      <div className="dashboard-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="absolute left-[-12%] top-10 h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl" />
      <div className="absolute right-[-10%] top-52 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10 space-y-6">
        <section className="glass-panel overflow-hidden rounded-[28px] border border-white/10 p-4 md:rounded-[32px] md:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.15fr,0.85fr]">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-cyan-200 md:px-4 md:text-xs md:tracking-[0.32em]">
                  Financial Command Center
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-slate-300 md:px-4 md:text-xs md:tracking-[0.28em]">
                  Live Mode
                </span>
              </div>

              <div className="max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-6xl">
                  Safelock-led money management in a more cinematic, forward-looking dashboard.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base md:leading-7">
                  RILSTACK now feels less like a spreadsheet and more like a financial operating system. Savings,
                  budgeting, and investing each have a dedicated visual layer, while the hero section reacts as you switch focus.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-4 md:gap-4">
                {metricCards.map((card) => (
                  <div
                    key={card.label}
                    className={`rounded-3xl border bg-gradient-to-br ${card.tone} p-4 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1`}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{card.label}</p>
                    <p className="mt-3 text-2xl font-bold text-white">{card.value}</p>
                    <p className="mt-2 text-xs text-slate-400">{card.detail}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-3 md:gap-4">
                {(Object.keys(FOCUS_CONTENT) as FocusMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFocusMode(mode)}
                    className={`rounded-3xl border p-4 text-left transition-all duration-300 ${
                      focusMode === mode
                        ? 'border-white/20 bg-white/12 shadow-[0_0_30px_rgba(99,240,214,0.12)]'
                        : 'border-white/10 bg-white/5 hover:bg-white/8'
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{FOCUS_CONTENT[mode].title}</p>
                    <p className="mt-2 text-base font-semibold text-white md:text-lg">{FOCUS_CONTENT[mode].headline}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className={`absolute inset-0 rounded-[28px] bg-gradient-to-br ${focus.accent} blur-2xl`} />
              <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/70 p-3 shadow-2xl md:rounded-[28px] md:p-4">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{focus.title}</p>
                    <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">{focus.headline}</h2>
                  </div>
                  <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">
                    Active
                  </div>
                </div>
                <p className="mb-5 max-w-xl text-sm leading-6 text-slate-300">{focus.description}</p>
                <div className="overflow-hidden rounded-[20px] border border-white/10 bg-black/30 md:rounded-[24px]">
                  <Image
                    src={focus.image}
                    alt={focus.title}
                    width={1200}
                    height={800}
                    className="h-auto w-full object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
          <div className="glass-panel rounded-[24px] border border-white/10 p-4 md:rounded-[30px] md:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Income Stream</p>
                <h3 className="mt-2 text-xl font-bold text-white md:text-2xl">Cashflow Atmosphere</h3>
              </div>
              <div className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-sky-200">
                6 Month Scan
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="incomeGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#63F0D6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#63F0D6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4EA1FF" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4EA1FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#203247" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#7C90A7" />
                <YAxis stroke="#7C90A7" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#08111D',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '18px',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="income" stroke="#63F0D6" fill="url(#incomeGlow)" strokeWidth={3} />
                <Area type="monotone" dataKey="expenses" stroke="#4EA1FF" fill="url(#expenseGlow)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-panel rounded-[24px] border border-white/10 p-4 md:rounded-[30px] md:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Budget Mix</p>
                <h3 className="mt-2 text-xl font-bold text-white md:text-2xl">Allocation Pulse</h3>
              </div>
              <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-violet-200">
                AI Balanced
              </span>
            </div>
            <div className="grid gap-6 md:grid-cols-[0.9fr,1.1fr]">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={spendMix} dataKey="value" innerRadius={60} outerRadius={96} paddingAngle={3}>
                    {spendMix.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                {spendMix.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <p className="font-semibold text-slate-100">{item.name}</p>
                      </div>
                      <p className="text-lg font-bold text-white">{item.value}%</p>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
          <div className="glass-panel rounded-[24px] border border-white/10 p-4 md:rounded-[30px] md:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Investment Radar</p>
                <h3 className="mt-2 text-xl font-bold text-white md:text-2xl">Portfolio Momentum</h3>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-emerald-200">
                Growth Layer
              </span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={portfolioBars}>
                <CartesianGrid stroke="#203247" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#7C90A7" />
                <YAxis stroke="#7C90A7" />
                <Tooltip
                  formatter={(value: number) => `N${value.toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: '#08111D',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '18px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="amount" radius={[12, 12, 0, 0]}>
                  {portfolioBars.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={['#63F0D6', '#4EA1FF', '#B08CFF', '#FFB14A'][index]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {portfolioBars.map((item) => (
                <div key={item.name} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-sm font-semibold text-emerald-300">{item.momentum}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">N{item.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[24px] border border-white/10 p-4 md:rounded-[30px] md:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Strategy Notes</p>
                <h3 className="mt-2 text-xl font-bold text-white md:text-2xl">Actionable planning signals</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-300">
                Insight Deck
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-400/10 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Savings</p>
                <h4 className="mt-3 text-lg font-bold text-white">Release dates stay visible</h4>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Keep strict-mode locks tied to real spending dates so protected funds do not blend into daily cash.
                </p>
              </div>
              <div className="rounded-[24px] border border-violet-400/20 bg-violet-400/10 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-violet-200">Investments</p>
                <h4 className="mt-3 text-lg font-bold text-white">Contributions shape momentum</h4>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Portfolio growth becomes easier to read when recurring contributions stay consistent across treasury bills, bonds, and funds.
                </p>
              </div>
              <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">Budgeting</p>
                <h4 className="mt-3 text-lg font-bold text-white">Categories need room to breathe</h4>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Cleaner category planning helps you spot pressure early and adjust before overspending reaches your wallet.
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,_rgba(99,240,214,0.08),_rgba(176,140,255,0.08),_rgba(78,161,255,0.08))] p-4 md:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Motion Reel</p>
                  <h4 className="mt-2 text-lg font-bold text-white md:text-xl">Budget signal stream</h4>
                </div>
                <span className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-red-200">
                  Live
                </span>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr,0.8fr]">
                <div className="rounded-[22px] border border-white/8 bg-slate-950/70 p-4">
                  <div className="reel-bars flex h-36 items-end gap-2">
                    {Array.from({ length: 18 }).map((_, index) => (
                      <span
                        key={index}
                        className="reel-bar flex-1 rounded-t-full"
                        style={{ animationDelay: `${index * 0.08}s` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-cyan-200">Savings window</p>
                    <p className="mt-1 text-sm text-slate-300">Releases line up with chosen spend dates.</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-violet-200">Investment rhythm</p>
                    <p className="mt-1 text-sm text-slate-300">Growth pulses faster when contributions stay consistent.</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-emerald-200">Budget discipline</p>
                    <p className="mt-1 text-sm text-slate-300">AI categories keep spending visible before it drifts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
