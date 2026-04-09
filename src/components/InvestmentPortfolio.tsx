'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import PinConfirmModal from './PinConfirmModal';

interface Investment {
  id: string;
  type: 'tbill' | 'bond' | 'mutual-fund';
  name: string;
  symbol: string;
  principal: number;
  interestRate: number;
  maturityMonths: number;
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
type View = 'menu' | 'manage' | 'choose-plan' | 'invest';
type Timeline = 3 | 6 | 9 | 12;

interface BuyInvestmentFormData {
  amount: number;
}

const TIMELINE_OPTIONS: { months: Timeline; label: string }[] = [
  { months: 3, label: '3 Months' },
  { months: 6, label: '6 Months' },
  { months: 9, label: '9 Months' },
  { months: 12, label: '12 Months' },
];

const INVESTMENT_PLANS: Array<{
  type: InvestmentType;
  label: string;
  description: string;
  baseRate: number;
  rateByTimeline: Record<Timeline, number>;
  symbolPrefix: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}> = [
  {
    type: 'tbill',
    label: 'Treasury Bills',
    description: 'Short-term government securities with guaranteed returns and low risk. Ideal for capital preservation.',
    baseRate: 5.2,
    rateByTimeline: { 3: 3.5, 6: 5.2, 9: 6.0, 12: 7.0 },
    symbolPrefix: 'TBILL',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: '🏛️',
  },
  {
    type: 'bond',
    label: 'Bonds',
    description: 'Fixed income securities with periodic interest payments until maturity. Great for steady income.',
    baseRate: 4.8,
    rateByTimeline: { 3: 3.0, 6: 4.8, 9: 5.8, 12: 7.2 },
    symbolPrefix: 'BOND',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: '📈',
  },
  {
    type: 'mutual-fund',
    label: 'Mutual Funds',
    description: 'Pooled investment funds managed by professionals. Higher potential returns over time.',
    baseRate: 8.5,
    rateByTimeline: { 3: 5.0, 6: 8.5, 9: 10.5, 12: 13.0 },
    symbolPrefix: 'MF',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: '💰',
  },
];

export default function InvestmentPortfolio() {
  const [view, setView] = useState<View>('menu');
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentType | null>(null);
  const [selectedTimeline, setSelectedTimeline] = useState<Timeline>(6);
  const [justCreated, setJustCreated] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingInvestment, setPendingInvestment] = useState<BuyInvestmentFormData | null>(null);

  const { register, handleSubmit, reset, watch } = useForm<BuyInvestmentFormData>({
    defaultValues: { amount: 0 },
  });

  const watchedAmount = watch('amount');
  const activePlan = INVESTMENT_PLANS.find((p) => p.type === selectedPlan);
  const activeRate = activePlan ? activePlan.rateByTimeline[selectedTimeline] : 0;

  const onSubmit = (data: BuyInvestmentFormData) => {
    if (!selectedPlan || !activePlan) return;
    const purchaseAmount = Number(data.amount);
    if (purchaseAmount < 5000) return;
    setPendingInvestment(data);
    setShowPinModal(true);
  };

  const executeInvestment = () => {
    if (!pendingInvestment || !selectedPlan || !activePlan) return;
    const purchaseAmount = Number(pendingInvestment.amount);

    const today = new Date();
    const maturity = new Date(today);
    maturity.setMonth(maturity.getMonth() + selectedTimeline);

    const newInvestment: Investment = {
      id: Date.now().toString(),
      type: activePlan.type,
      name: activePlan.label,
      symbol: `${activePlan.symbolPrefix}-${today.getFullYear()}`,
      principal: purchaseAmount,
      interestRate: activeRate,
      maturityMonths: selectedTimeline,
      purchaseDate: today.toISOString().split('T')[0],
      maturityDate: maturity.toISOString().split('T')[0],
      currentValue: purchaseAmount,
      isClosed: false,
      saleCycles: [{ cycleNumber: 1, amountAvailable: purchaseAmount, amountSold: 0, status: 'open' }],
    };

    setInvestments([...investments, newInvestment]);
    setSelectedPlan(null);
    setSelectedTimeline(6);
    setPendingInvestment(null);
    setShowPinModal(false);
    reset();
    setJustCreated(true);
    setView('manage');
    setTimeout(() => setJustCreated(false), 4000);
  };

  const totalPortfolioValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalPrincipal = investments.reduce((sum, inv) => sum + inv.principal, 0);
  const totalGain = totalPortfolioValue - totalPrincipal;
  const gainPercentage = totalPrincipal > 0 ? ((totalGain / totalPrincipal) * 100).toFixed(2) : '0.00';

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tbill': return 'bg-blue-100 text-blue-800';
      case 'bond': return 'bg-purple-100 text-purple-800';
      case 'mutual-fund': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const estimatedReturn = activePlan && watchedAmount
    ? (Number(watchedAmount) * activeRate * selectedTimeline) / (12 * 100)
    : 0;

  /* ── MENU VIEW ── */
  if (view === 'menu') {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Investments</h2>
          <p className="mt-2 text-sm text-slate-500">Grow your wealth with secure investment plans</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => setView('choose-plan')}
            className="group rounded-[24px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-[#2c3e5f] hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">+</div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2c3e5f]">Create New Investment</h3>
            <p className="mt-1 text-sm text-slate-500">Choose a plan, set your amount, and start earning returns.</p>
          </button>

          <button
            onClick={() => setView('manage')}
            className="group rounded-[24px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-[#2c3e5f] hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">📊</div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2c3e5f]">Manage Existing</h3>
            <p className="mt-1 text-sm text-slate-500">View balances, track returns, and manage your portfolio.</p>
            {investments.length > 0 && (
              <span className="mt-3 inline-block rounded-full bg-[#2c3e5f] px-3 py-1 text-xs font-semibold text-white">
                {investments.length} active
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ── CHOOSE PLAN VIEW ── */
  if (view === 'choose-plan') {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('menu')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Choose an Investment Plan</h2>
            <p className="text-sm text-slate-500">Select the plan that fits your goals</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {INVESTMENT_PLANS.map((plan) => (
            <button
              key={plan.type}
              onClick={() => { setSelectedPlan(plan.type); setView('invest'); }}
              className={`group rounded-[24px] border ${plan.borderColor} ${plan.bgColor} p-5 text-left transition hover:shadow-md`}
            >
              <div className="mb-3 text-3xl">{plan.icon}</div>
              <h3 className={`text-lg font-bold ${plan.color}`}>{plan.label}</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{plan.description}</p>
              <div className="mt-4 space-y-1 border-t border-slate-200 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Interest Rate</span>
                  <span className="font-bold text-[#2c3e5f]">{plan.rateByTimeline[3]}% – {plan.rateByTimeline[12]}% <span className="text-xs font-normal text-slate-400">p.a.</span></span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Timeline</span>
                  <span className="font-semibold text-slate-700">3 – 12 months</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── INVEST (AMOUNT INPUT) VIEW ── */
  if (view === 'invest' && activePlan) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setView('choose-plan'); setSelectedPlan(null); setSelectedTimeline(6); reset(); }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Invest in {activePlan.label}</h2>
            <p className="text-sm text-slate-500">Select a timeline and enter your amount</p>
          </div>
        </div>

        <div className={`rounded-[24px] border ${activePlan.borderColor} ${activePlan.bgColor} p-5`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{activePlan.icon}</span>
            <div>
              <h3 className={`font-bold ${activePlan.color}`}>{activePlan.label}</h3>
              <p className="text-xs text-slate-500">{activePlan.description}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Investment Timeline</p>
            <div className="grid grid-cols-4 gap-2">
              {TIMELINE_OPTIONS.map((opt) => (
                <button
                  key={opt.months}
                  type="button"
                  onClick={() => setSelectedTimeline(opt.months)}
                  className={`rounded-xl py-2.5 text-center text-sm font-semibold transition-all ${
                    selectedTimeline === opt.months
                      ? 'bg-[#2c3e5f] text-white shadow-md'
                      : 'bg-white/80 text-slate-700 hover:bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/80 p-3 text-center">
              <p className="text-xs text-slate-500">Interest Rate</p>
              <p className="text-lg font-bold text-[#2c3e5f]">{activeRate}% <span className="text-xs font-normal text-slate-400">p.a.</span></p>
            </div>
            <div className="rounded-xl bg-white/80 p-3 text-center">
              <p className="text-xs text-slate-500">Maturity Period</p>
              <p className="text-lg font-bold text-slate-700">{selectedTimeline} months</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Investment Amount (₦)</label>
            <input
              type="number"
              step="1"
              placeholder="Minimum ₦5,000"
              {...register('amount', { required: true, valueAsNumber: true, min: 5000 })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900 focus:border-[#2c3e5f] focus:outline-none focus:ring-1 focus:ring-[#2c3e5f]"
            />
            <p className="mt-1 text-xs text-slate-400">Minimum investment: ₦5,000</p>
          </div>

          {Number(watchedAmount) >= 5000 && (
            <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
              <h4 className="text-sm font-semibold text-emerald-800 mb-3">Projected Returns</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Amount Invested</span>
                  <span className="font-semibold text-slate-900">₦{Number(watchedAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Interest Rate</span>
                  <span className="font-semibold text-[#2c3e5f]">{activeRate}% p.a.</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Duration</span>
                  <span className="font-semibold text-slate-700">{selectedTimeline} months</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Estimated Earnings</span>
                  <span className="font-semibold text-emerald-700">₦{estimatedReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-emerald-200 pt-2 flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">Total at Maturity</span>
                  <span className="font-bold text-[#2c3e5f] text-base">₦{(Number(watchedAmount) + estimatedReturn).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={Number(watchedAmount) < 5000}
              className="flex-1 rounded-xl bg-[#2c3e5f] py-3 font-semibold text-white transition hover:bg-[#244d24] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Invest Now
            </button>
            <button
              type="button"
              onClick={() => { setView('choose-plan'); setSelectedPlan(null); setSelectedTimeline(6); reset(); }}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ── MANAGE EXISTING VIEW ── */
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('menu')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Investments</h2>
            <p className="text-sm text-slate-500">Track and manage your portfolio</p>
          </div>
        </div>
        <button
          onClick={() => setView('choose-plan')}
          className="rounded-xl bg-[#2c3e5f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#244d24]"
        >
          + New Investment
        </button>
      </div>

      {justCreated && (
        <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Investment created successfully! Your new plan has been added to your portfolio.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Portfolio Value</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">₦{totalPortfolioValue.toLocaleString()}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Principal Invested</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">₦{totalPrincipal.toLocaleString()}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Interest Earned</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">₦{totalGain.toLocaleString()}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Return Rate</p>
          <p className={`mt-1 text-2xl font-bold ${totalGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{gainPercentage}%</p>
        </div>
      </div>

      {investments.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-4xl mb-3">📊</p>
          <h3 className="text-lg font-semibold text-slate-700">No investments yet</h3>
          <p className="mt-1 text-sm text-slate-500">Create your first investment plan to start growing your wealth.</p>
          <button
            onClick={() => setView('choose-plan')}
            className="mt-4 rounded-xl bg-[#2c3e5f] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#244d24]"
          >
            Create Investment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {investments.map((inv) => {
            const gain = inv.currentValue - inv.principal;
            const plan = INVESTMENT_PLANS.find((p) => p.type === inv.type);
            return (
              <div key={inv.id} className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{plan?.icon}</span>
                    <div>
                      <h4 className="font-bold text-slate-900">{inv.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getTypeColor(inv.type)}`}>
                          {inv.symbol}
                        </span>
                        <span className="text-xs text-slate-400">Purchased {inv.purchaseDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">₦{inv.currentValue.toLocaleString()}</p>
                    <p className={`text-xs font-semibold ${gain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {gain >= 0 ? '+' : ''}₦{gain.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-3 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs text-slate-500">Principal</p>
                    <p className="text-sm font-semibold text-slate-700">₦{inv.principal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Rate</p>
                    <p className="text-sm font-semibold text-[#2c3e5f]">{inv.interestRate}% p.a.</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Duration</p>
                    <p className="text-sm font-semibold text-slate-700">{inv.maturityMonths} months</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Matures</p>
                    <p className="text-sm font-semibold text-slate-700">{inv.maturityDate}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showPinModal && (
        <PinConfirmModal
          title="Confirm Investment"
          description="Enter your 4-digit PIN to proceed with this investment"
          onConfirm={executeInvestment}
          onCancel={() => { setShowPinModal(false); setPendingInvestment(null); }}
        />
      )}
    </div>
  );
}
