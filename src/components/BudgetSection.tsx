'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';

type BudgetMode = 'strict' | 'relaxed';
type BudgetStyle = '50-30-20' | 'zero-based' | 'custom';
type Profession = 'student' | 'worker' | 'entrepreneur' | 'freelancer';
type CategoryGroup = 'Essential Expenses' | 'Flexible Expenses' | 'Savings & Goals';
type SpendingCadence = 'daily' | 'weekly' | 'monthly';
type SetupStep = 'profession' | 'budget-style' | 'income';

interface BudgetCategory {
  id: string;
  name: string;
  group: CategoryGroup;
  amount: number;
  cadence: SpendingCadence;
  dailyEstimate: number;
  unlockDate: string;
  note: string;
  editable: boolean;
}

interface LockedSummary {
  lockedAt: string;
  totalLocked: number;
  eligibleInterest: number;
  annualInterestRate: number;
}

interface BudgetPlan {
  profession: Profession;
  budgetStyle: BudgetStyle;
  income: number;
  categories: BudgetCategory[];
  createdAt: string;
  lockedSummary?: LockedSummary;
}

interface BudgetSectionProps {
  budgetMode: BudgetMode;
}

const PROFESSION_LABELS: Record<Profession, string> = {
  student: 'Student',
  worker: 'Worker',
  entrepreneur: 'Entrepreneur',
  freelancer: 'Freelancer',
};

const BUDGET_STYLE_INFO: Array<{
  id: BudgetStyle;
  title: string;
  description: string;
  explanation: string;
}> = [
  {
    id: '50-30-20',
    title: '50/30/20 Budget',
    description: 'A balanced split for essentials, lifestyle spending, and savings.',
    explanation: '50% goes to needs, 30% to wants, and 20% to savings or future goals.',
  },
  {
    id: 'zero-based',
    title: 'Zero-Based Budget',
    description: 'Every naira gets assigned a job before the month starts.',
    explanation: 'Your full income is distributed across expense and savings categories until nothing is left unplanned.',
  },
  {
    id: 'custom',
    title: 'Custom Budget',
    description: 'Start from an AI draft, then shape the plan around your own priorities.',
    explanation: 'Good if you want more freedom while still using profession-based category suggestions.',
  },
];

const PROFESSION_TEMPLATES: Record<
  Profession,
  Array<{ name: string; group: CategoryGroup; note: string; cadence: SpendingCadence }>
> = {
  student: [
    { name: 'Feeding', group: 'Essential Expenses', note: 'Meals, groceries, and cooking supplies.', cadence: 'daily' },
    { name: 'Transport', group: 'Essential Expenses', note: 'Daily commuting and occasional travel.', cadence: 'daily' },
    { name: 'School Fees', group: 'Essential Expenses', note: 'Tuition, registration, and academic costs.', cadence: 'monthly' },
    { name: 'Data & Airtime', group: 'Flexible Expenses', note: 'Connectivity for classes and communication.', cadence: 'weekly' },
    { name: 'Personal Care', group: 'Flexible Expenses', note: 'Toiletries, laundry, and small personal needs.', cadence: 'weekly' },
    { name: 'Books & Learning', group: 'Savings & Goals', note: 'Courses, books, projects, and study tools.', cadence: 'monthly' },
    { name: 'Emergency Buffer', group: 'Savings & Goals', note: 'Small reserve for urgent student needs.', cadence: 'monthly' },
  ],
  worker: [
    { name: 'Food & Groceries', group: 'Essential Expenses', note: 'Monthly food and home supplies.', cadence: 'daily' },
    { name: 'Transport', group: 'Essential Expenses', note: 'Commuting, fuel, or ride-hailing costs.', cadence: 'daily' },
    { name: 'Rent & Housing', group: 'Essential Expenses', note: 'Rent, service charge, and housing upkeep.', cadence: 'monthly' },
    { name: 'Utilities', group: 'Essential Expenses', note: 'Power, water, internet, and subscriptions.', cadence: 'monthly' },
    { name: 'Dining & Lifestyle', group: 'Flexible Expenses', note: 'Restaurants, outings, and entertainment.', cadence: 'weekly' },
    { name: 'Family Support', group: 'Flexible Expenses', note: 'Support for family or dependants.', cadence: 'weekly' },
    { name: 'Emergency Savings', group: 'Savings & Goals', note: 'Cash reserve for unexpected costs.', cadence: 'monthly' },
    { name: 'Investments', group: 'Savings & Goals', note: 'Long-term growth and future planning.', cadence: 'monthly' },
  ],
  entrepreneur: [
    { name: 'Home Expenses', group: 'Essential Expenses', note: 'Personal housing and household costs.', cadence: 'daily' },
    { name: 'Business Operations', group: 'Essential Expenses', note: 'Inventory, logistics, tools, and recurring business spend.', cadence: 'daily' },
    { name: 'Utilities & Bills', group: 'Essential Expenses', note: 'Power, internet, and communication tools.', cadence: 'monthly' },
    { name: 'Transport', group: 'Essential Expenses', note: 'Meetings, deliveries, and movement.', cadence: 'daily' },
    { name: 'Marketing', group: 'Flexible Expenses', note: 'Ads, content, promotions, and brand growth.', cadence: 'weekly' },
    { name: 'Lifestyle', group: 'Flexible Expenses', note: 'Personal enjoyment and flexible spending.', cadence: 'weekly' },
    { name: 'Tax Reserve', group: 'Savings & Goals', note: 'Set aside for levies, tax, and compliance.', cadence: 'monthly' },
    { name: 'Business Expansion', group: 'Savings & Goals', note: 'Reinvestment for growth opportunities.', cadence: 'monthly' },
  ],
  freelancer: [
    { name: 'Food & Utilities', group: 'Essential Expenses', note: 'Living costs and household spend.', cadence: 'daily' },
    { name: 'Housing', group: 'Essential Expenses', note: 'Rent and home essentials.', cadence: 'monthly' },
    { name: 'Internet & Tools', group: 'Essential Expenses', note: 'Software, data, subscriptions, and connectivity.', cadence: 'monthly' },
    { name: 'Transport', group: 'Essential Expenses', note: 'Client meetings and movement.', cadence: 'daily' },
    { name: 'Client Acquisition', group: 'Flexible Expenses', note: 'Portfolio, ads, networking, and proposals.', cadence: 'weekly' },
    { name: 'Lifestyle', group: 'Flexible Expenses', note: 'Entertainment and personal spending.', cadence: 'weekly' },
    { name: 'Tax Savings', group: 'Savings & Goals', note: 'A reserve for tax and compliance.', cadence: 'monthly' },
    { name: 'Device Upgrade Fund', group: 'Savings & Goals', note: 'Laptop, phone, and equipment replacement.', cadence: 'monthly' },
  ],
};

const BUDGET_STYLE_SPLITS: Record<BudgetStyle, Record<CategoryGroup, number>> = {
  '50-30-20': {
    'Essential Expenses': 50,
    'Flexible Expenses': 30,
    'Savings & Goals': 20,
  },
  'zero-based': {
    'Essential Expenses': 55,
    'Flexible Expenses': 20,
    'Savings & Goals': 25,
  },
  custom: {
    'Essential Expenses': 45,
    'Flexible Expenses': 30,
    'Savings & Goals': 25,
  },
};

const GROUP_COLORS: Record<CategoryGroup, string> = {
  'Essential Expenses': 'border-rose-200 bg-rose-50',
  'Flexible Expenses': 'border-amber-200 bg-amber-50',
  'Savings & Goals': 'border-emerald-200 bg-emerald-50',
};

const CADENCE_LABELS: Record<SpendingCadence, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const DAYS_PER_CADENCE: Record<SpendingCadence, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};

const OPAY_ANNUAL_RATE_BELOW_100K = 14.95;
const OPAY_ANNUAL_RATE_ABOVE_100K = 4.95;

const formatCurrency = (amount: number) => `N${Math.round(amount).toLocaleString()}`;

const makeDate = (daysAhead: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
};

const getDefaultUnlockDate = (group: CategoryGroup, budgetMode: BudgetMode) => {
  if (budgetMode === 'strict') {
    if (group === 'Essential Expenses') return makeDate(10);
    if (group === 'Flexible Expenses') return makeDate(14);
    return makeDate(30);
  }

  if (group === 'Essential Expenses') return makeDate(7);
  if (group === 'Flexible Expenses') return makeDate(10);
  return makeDate(21);
};

const deriveDailyEstimate = (amount: number, cadence: SpendingCadence) =>
  Math.max(0, Math.round(amount / DAYS_PER_CADENCE[cadence]));

const daysBetweenTodayAnd = (dateValue: string) => {
  const today = new Date();
  const target = new Date(dateValue);
  const diff = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const calculateInterestPreview = (categories: BudgetCategory[]) => {
  const eligibleCategories = categories.filter((category) => daysBetweenTodayAnd(category.unlockDate) > 7);
  const eligibleAmount = eligibleCategories.reduce((sum, category) => sum + category.amount, 0);
  const annualRate =
    eligibleAmount <= 100000 ? OPAY_ANNUAL_RATE_BELOW_100K : OPAY_ANNUAL_RATE_ABOVE_100K;
  const weightedDays = eligibleCategories.reduce(
    (sum, category) => sum + daysBetweenTodayAnd(category.unlockDate),
    0,
  );
  const averageDays = eligibleAmount > 0 ? weightedDays / Math.max(eligibleCategories.length, 1) : 0;
  const estimatedInterest = eligibleAmount * (annualRate / 100) * (averageDays / 365);

  return { eligibleAmount, annualRate, estimatedInterest };
};

const allocateAcrossCategories = (
  items: Array<{ name: string; group: CategoryGroup; note: string; cadence: SpendingCadence }>,
  income: number,
  budgetStyle: BudgetStyle,
  budgetMode: BudgetMode,
): BudgetCategory[] => {
  const split = BUDGET_STYLE_SPLITS[budgetStyle];
  const categoriesByGroup = items.reduce<Record<CategoryGroup, typeof items>>(
    (acc, item) => {
      acc[item.group].push(item);
      return acc;
    },
    {
      'Essential Expenses': [],
      'Flexible Expenses': [],
      'Savings & Goals': [],
    },
  );

  return items.map((item, index) => {
    const groupShare = split[item.group] / 100;
    const groupItems = categoriesByGroup[item.group];
    const baseAmount = (income * groupShare) / Math.max(groupItems.length, 1);
    const multiplier =
      item.group === 'Essential Expenses'
        ? 1.08
        : item.group === 'Flexible Expenses'
          ? 0.94
          : 0.98;
    const amount = Math.max(1000, Math.round(baseAmount * multiplier));

    return {
      id: `${item.group}-${index}-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: item.name,
      group: item.group,
      amount,
      cadence: item.cadence,
      dailyEstimate: deriveDailyEstimate(amount, item.cadence),
      unlockDate: getDefaultUnlockDate(item.group, budgetMode),
      note: item.note,
      editable: true,
    };
  });
};

export default function BudgetSection({ budgetMode }: BudgetSectionProps) {
  const storageKey = `budget-plan-${budgetMode}`;
  const [profession, setProfession] = useState<Profession | null>(null);
  const [budgetStyle, setBudgetStyle] = useState<BudgetStyle | null>(null);
  const [income, setIncome] = useState('');
  const [setupStep, setSetupStep] = useState<SetupStep>('profession');
  const [budgetPlan, setBudgetPlan] = useState<BudgetPlan | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryGroup, setNewCategoryGroup] = useState<CategoryGroup>('Flexible Expenses');
  const [newCategoryCadence, setNewCategoryCadence] = useState<SpendingCadence>('weekly');

  useEffect(() => {
    const savedPlan = localStorage.getItem(storageKey);
    if (!savedPlan) return;

    try {
      const parsedPlan = JSON.parse(savedPlan) as BudgetPlan;
      setBudgetPlan(parsedPlan);
      setProfession(parsedPlan.profession);
      setBudgetStyle(parsedPlan.budgetStyle);
      setIncome(String(parsedPlan.income));
      setSetupStep('income');
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!budgetPlan) return;
    localStorage.setItem(storageKey, JSON.stringify(budgetPlan));
  }, [budgetPlan, storageKey]);

  const modeDetails = useMemo(() => {
    return budgetMode === 'strict'
      ? {
          title: 'Strict Budget Planner',
          subtitle: 'Build a complete daily spending plan and lock each category until its approved spending date.',
          rule: 'Funds stay locked until the chosen open date. After you finalize the plan, you can continue and lock the funds.',
          penalty: 'Funds locked for more than 7 days earn estimated interest using an OPay-inspired rate reduced by 0.05 percentage points.',
          accent: 'from-cyan-700 to-blue-900',
        }
      : {
          title: 'Relaxed Budget Planner',
          subtitle: 'Create a flexible daily spending plan with dates that guide when money should be opened.',
          rule: 'Each category still gets a spend-open date, but early withdrawals remain possible before that date.',
          penalty: 'Any withdrawal before the category open date attracts a 2% fee on the amount withdrawn.',
          accent: 'from-emerald-700 to-teal-900',
        };
  }, [budgetMode]);

  const groupedCategories = useMemo(() => {
    const categories = budgetPlan?.categories ?? [];
    return {
      'Essential Expenses': categories.filter((item) => item.group === 'Essential Expenses'),
      'Flexible Expenses': categories.filter((item) => item.group === 'Flexible Expenses'),
      'Savings & Goals': categories.filter((item) => item.group === 'Savings & Goals'),
    };
  }, [budgetPlan]);

  const totalAllocated = (budgetPlan?.categories ?? []).reduce((sum, item) => sum + item.amount, 0);
  const remainingBalance = (budgetPlan?.income ?? 0) - totalAllocated;
  const planInterest = calculateInterestPreview(budgetPlan?.categories ?? []);

  const generatePlan = () => {
    if (!profession || !budgetStyle || !income) return;

    const numericIncome = Number(income);
    if (!Number.isFinite(numericIncome) || numericIncome <= 0) return;

    const categories = allocateAcrossCategories(
      PROFESSION_TEMPLATES[profession],
      numericIncome,
      budgetStyle,
      budgetMode,
    );

    setBudgetPlan({
      profession,
      budgetStyle,
      income: numericIncome,
      categories,
      createdAt: new Date().toISOString(),
    });
  };

  const handleProfessionSelect = (value: Profession) => {
    setProfession(value);
    setSetupStep('budget-style');
  };

  const handleBudgetStyleSelect = (value: BudgetStyle) => {
    setBudgetStyle(value);
    setSetupStep('income');
  };

  const updateCategory = (
    categoryId: string,
    field: keyof BudgetCategory,
    value: string | number,
  ) => {
    setBudgetPlan((current) => {
      if (!current) return current;

      const categories = current.categories.map((category) => {
        if (category.id !== categoryId) return category;

        const updated = { ...category, [field]: value };
        if (field === 'amount' || field === 'cadence') {
          updated.dailyEstimate = deriveDailyEstimate(
            field === 'amount' ? Number(value) || 0 : updated.amount,
            field === 'cadence' ? (value as SpendingCadence) : updated.cadence,
          );
        }

        if (field === 'dailyEstimate') {
          updated.dailyEstimate = Number(value) || 0;
        }

        return updated;
      });

      return {
        ...current,
        categories,
        lockedSummary: undefined,
      };
    });
  };

  const addCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName || !budgetPlan) return;

    const newCategory: BudgetCategory = {
      id: `${newCategoryGroup}-${Date.now()}`,
      name: trimmedName,
      group: newCategoryGroup,
      amount: 0,
      cadence: newCategoryCadence,
      dailyEstimate: 0,
      unlockDate: getDefaultUnlockDate(newCategoryGroup, budgetMode),
      note: 'Added manually by user.',
      editable: true,
    };

    setBudgetPlan({
      ...budgetPlan,
      categories: [...budgetPlan.categories, newCategory],
      lockedSummary: undefined,
    });
    setNewCategoryName('');
  };

  const lockFunds = () => {
    if (!budgetPlan || remainingBalance < 0) return;

    setBudgetPlan({
      ...budgetPlan,
      lockedSummary: {
        lockedAt: new Date().toISOString(),
        totalLocked: totalAllocated,
        eligibleInterest: planInterest.estimatedInterest,
        annualInterestRate: planInterest.annualRate,
      },
    });
  };

  const resetPlan = () => {
    localStorage.removeItem(storageKey);
    setBudgetPlan(null);
    setProfession(null);
    setBudgetStyle(null);
    setIncome('');
    setSetupStep('profession');
  };

  return (
    <div className="space-y-8">
      <section className={`rounded-3xl bg-gradient-to-br ${modeDetails.accent} p-8 text-white shadow-2xl`}>
        <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-white/70">{budgetMode} mode</p>
            <h2 className="mt-3 text-3xl font-bold">{modeDetails.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/85">{modeDetails.subtitle}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Spending Rule</p>
                <p className="mt-2 text-sm leading-6 text-white/90">{modeDetails.rule}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Locking Notice</p>
                <p className="mt-2 text-sm leading-6 text-white/90">{modeDetails.penalty}</p>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
            <Image
              src="/images/budget-map.svg"
              alt="Budget planning illustration"
              width={1200}
              height={800}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {!budgetPlan ? (
        <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Budget setup</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
                {setupStep === 'profession' && '1. Tell us what kind of earner you are'}
                {setupStep === 'budget-style' && '2. Pick your budget type'}
                {setupStep === 'income' && '3. Tell us your income estimate'}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {setupStep === 'profession' &&
                  'Your profession shapes the expense categories and daily spending flow the planner creates for you.'}
                {setupStep === 'budget-style' &&
                  'Choose the structure that should guide how the planner spreads your money across categories.'}
                {setupStep === 'income' &&
                  'Enter your monthly income estimate so the app can generate your complete budget plan.'}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
              Step {setupStep === 'profession' ? '1' : setupStep === 'budget-style' ? '2' : '3'} of 3
            </div>
          </div>

          <div className="mt-8 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
              style={{
                width:
                  setupStep === 'profession'
                    ? '33.33%'
                    : setupStep === 'budget-style'
                      ? '66.66%'
                      : '100%',
              }}
            />
          </div>

          {setupStep === 'profession' && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {(Object.keys(PROFESSION_LABELS) as Profession[]).map((option) => (
                <button
                  key={option}
                  onClick={() => handleProfessionSelect(option)}
                  className={`rounded-2xl border p-5 text-left transition-all ${
                    profession === option
                      ? 'border-cyan-500 bg-cyan-50 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-base font-semibold text-slate-900">{PROFESSION_LABELS[option]}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {option === 'student' && 'Academic and low-to-mid income categories with education priorities.'}
                    {option === 'worker' && 'Salary-driven monthly planning for fixed bills and long-term savings.'}
                    {option === 'entrepreneur' && 'Personal plus business-related budgeting with cash-flow discipline.'}
                    {option === 'freelancer' && 'Irregular-income planning with tools, client costs, and tax reserves.'}
                  </p>
                </button>
              ))}
            </div>
          )}

          {setupStep === 'budget-style' && (
            <div className="mt-8 space-y-4">
              {BUDGET_STYLE_INFO.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleBudgetStyleSelect(option.id)}
                  className={`w-full rounded-2xl border p-5 text-left transition-all ${
                    budgetStyle === option.id
                      ? 'border-cyan-500 bg-cyan-50 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-base font-semibold text-slate-900">{option.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{option.description}</p>
                  <p className="mt-3 text-xs leading-5 text-slate-500">{option.explanation}</p>
                </button>
              ))}
              <button
                onClick={() => setSetupStep('profession')}
                className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
              >
                Back
              </button>
            </div>
          )}

          {setupStep === 'income' && (
            <div className="mt-8 max-w-xl">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">
                  Profession: <span className="font-semibold text-slate-900">{profession ? PROFESSION_LABELS[profession] : '-'}</span>
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Budget type: <span className="font-semibold text-slate-900">{budgetStyle ?? '-'}</span>
                </p>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-slate-900">Monthly income estimate</label>
                <input
                  type="number"
                  min="1"
                  value={income}
                  onChange={(event) => setIncome(event.target.value)}
                  placeholder="e.g. 350000"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-cyan-500"
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setSetupStep('budget-style')}
                  className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={generatePlan}
                  disabled={!profession || !budgetStyle || !income}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Generate Full Budget Plan
                </button>
              </div>
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-white p-5 shadow-md">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Profession</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{PROFESSION_LABELS[budgetPlan.profession]}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-md">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Budget Type</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{budgetPlan.budgetStyle}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-md">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Income</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{formatCurrency(budgetPlan.income)}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-md">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Remaining</p>
              <p className={`mt-2 text-xl font-bold ${remainingBalance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatCurrency(remainingBalance)}
              </p>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
            <div className="rounded-3xl bg-white p-8 shadow-xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Complete budget plan</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Each category includes a total allocation, a daily expense guide, a spending rhythm, and the exact
                    date the money should open for spending.
                  </p>
                </div>
                <button
                  onClick={resetPlan}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
                >
                  Start Over
                </button>
              </div>

              <div className="mt-8 grid gap-8">
                {(Object.keys(groupedCategories) as CategoryGroup[]).map((group) => (
                  <div key={group} className={`rounded-3xl border p-5 ${GROUP_COLORS[group]}`}>
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">{group}</h4>
                        <p className="text-sm text-slate-600">
                          {group === 'Essential Expenses' && 'Core daily and fixed bills that keep life running.'}
                          {group === 'Flexible Expenses' && 'Lifestyle and adjustable expenses you can tune month to month.'}
                          {group === 'Savings & Goals' && 'Future-focused money for security, growth, and planned targets.'}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                        {formatCurrency(groupedCategories[group].reduce((sum, item) => sum + item.amount, 0))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {groupedCategories[group].map((category) => (
                        <div key={category.id} className="rounded-2xl bg-white p-4 shadow-sm">
                          <div className="grid gap-4 xl:grid-cols-[1fr,0.8fr,0.8fr,0.9fr]">
                            <div>
                              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Category
                              </label>
                              <input
                                value={category.name}
                                onChange={(event) => updateCategory(category.id, 'name', event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
                              />
                              <p className="mt-2 text-xs leading-5 text-slate-500">{category.note}</p>
                            </div>

                            <div>
                              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Allocation
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={category.amount}
                                onChange={(event) =>
                                  updateCategory(category.id, 'amount', Number(event.target.value) || 0)
                                }
                                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Daily Spend Plan
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={category.dailyEstimate}
                                onChange={(event) =>
                                  updateCategory(category.id, 'dailyEstimate', Number(event.target.value) || 0)
                                }
                                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
                              />
                              <p className="mt-2 text-xs text-slate-500">
                                Suggested from the category amount, but fully editable.
                              </p>
                            </div>

                            <div>
                              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Spend Open Date
                              </label>
                              <input
                                type="date"
                                value={category.unlockDate}
                                onChange={(event) => updateCategory(category.id, 'unlockDate', event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
                              />
                              <p className={`mt-2 text-xs ${budgetMode === 'strict' ? 'text-cyan-700' : 'text-red-500'}`}>
                                {budgetMode === 'strict'
                                  ? 'This category stays locked until this date.'
                                  : 'Early withdrawals before this date attract a 2% fee.'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-4 md:grid-cols-[0.8fr,1.2fr]">
                            <div>
                              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Spending Frequency
                              </label>
                              <select
                                value={category.cadence}
                                onChange={(event) =>
                                  updateCategory(category.id, 'cadence', event.target.value as SpendingCadence)
                                }
                                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
                              >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                              </select>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Spending summary</p>
                              <p className="mt-2 text-sm text-slate-700">
                                {CADENCE_LABELS[category.cadence]} category with a suggested spend pace of{' '}
                                <span className="font-semibold text-slate-900">{formatCurrency(category.dailyEstimate)}</span>{' '}
                                per day.
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <section className="rounded-3xl bg-white p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-slate-900">Add more categories</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Add custom categories if your spending style needs something extra beyond the generated list.
                </p>
                <div className="mt-6 grid gap-4">
                  <input
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    placeholder="e.g. Childcare, Gym, Content Production"
                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
                  />
                  <select
                    value={newCategoryGroup}
                    onChange={(event) => setNewCategoryGroup(event.target.value as CategoryGroup)}
                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
                  >
                    <option value="Essential Expenses">Essential Expenses</option>
                    <option value="Flexible Expenses">Flexible Expenses</option>
                    <option value="Savings & Goals">Savings & Goals</option>
                  </select>
                  <select
                    value={newCategoryCadence}
                    onChange={(event) => setNewCategoryCadence(event.target.value as SpendingCadence)}
                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <button
                    onClick={addCategory}
                    className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800"
                  >
                    Add Category
                  </button>
                </div>
              </section>

              <section className="rounded-3xl bg-white p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-slate-900">Lock preview</h3>
                <div className="mt-6 space-y-4 text-sm leading-6 text-slate-600">
                  <p>When you continue, the app treats this plan as your active spending lock schedule.</p>
                  <p>Categories with open dates more than 7 days ahead are marked as interest-eligible.</p>
                  <p>
                    Interest estimate uses an inferred OPay-style annual rate of{' '}
                    <span className="font-semibold text-slate-900">{planInterest.annualRate.toFixed(2)}%</span> after
                    deducting 0.05 percentage points.
                  </p>
                  <p>
                    Eligible locked amount:{' '}
                    <span className="font-semibold text-slate-900">{formatCurrency(planInterest.eligibleAmount)}</span>
                  </p>
                  <p>
                    Estimated interest preview:{' '}
                    <span className="font-semibold text-emerald-700">{formatCurrency(planInterest.estimatedInterest)}</span>
                  </p>
                  <p>
                    {budgetMode === 'strict'
                      ? 'Strict mode keeps funds locked until their spending dates.'
                      : 'Relaxed mode still allows early withdrawals, but the 2% fee warning remains.'}
                  </p>
                </div>

                <button
                  onClick={lockFunds}
                  disabled={remainingBalance < 0}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 px-5 py-4 text-sm font-semibold text-white transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue and Lock Funds
                </button>
                {remainingBalance < 0 && (
                  <p className="mt-3 text-xs text-red-600">
                    Reduce allocations until your remaining balance becomes zero or positive before locking funds.
                  </p>
                )}
              </section>

              {budgetPlan.lockedSummary && (
                <section className="rounded-3xl border border-cyan-200 bg-cyan-50 p-8 shadow-xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-700">Funds locked</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">Budget plan activated</h3>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Locked</p>
                      <p className="mt-2 text-xl font-bold text-slate-900">
                        {formatCurrency(budgetPlan.lockedSummary.totalLocked)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Interest Estimate</p>
                      <p className="mt-2 text-xl font-bold text-emerald-700">
                        {formatCurrency(budgetPlan.lockedSummary.eligibleInterest)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Lock timestamp: {new Date(budgetPlan.lockedSummary.lockedAt).toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Applied annual rate: {budgetPlan.lockedSummary.annualInterestRate.toFixed(2)}%.
                  </p>
                </section>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
