'use client';

import React, { useEffect, useMemo, useState } from 'react';
import PinConfirmModal from './PinConfirmModal';
import SpendingBreakdown from './SpendingBreakdown';
import IncomeExpensesChart from './IncomeExpensesChart';

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
  pinHash: string;
  startDate: string;
  endDate: string;
  unlockFrequency: 'daily' | 'weekly' | 'monthly';
  schedule: { date: string; amount: number }[];
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
  onChangeBudgetMode?: () => void;
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
    description: 'Start from a smart draft, then shape the plan around your own priorities.',
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

const OPAY_ANNUAL_RATE_BELOW_100K = 14;
const OPAY_ANNUAL_RATE_ABOVE_100K = 4;

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

type BudgetView = 'menu' | 'create' | 'manage';

export default function BudgetSection({ budgetMode, onChangeBudgetMode }: BudgetSectionProps) {
  const storageKey = `budget-plan-${budgetMode}`;
  const [view, setView] = useState<BudgetView>('menu');
  const [profession, setProfession] = useState<Profession | null>(null);
  const [budgetStyle, setBudgetStyle] = useState<BudgetStyle | null>(null);
  const [income, setIncome] = useState('');
  const [setupStep, setSetupStep] = useState<SetupStep>('profession');
  const [budgetPlan, setBudgetPlan] = useState<BudgetPlan | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryGroup, setNewCategoryGroup] = useState<CategoryGroup>('Flexible Expenses');
  const [newCategoryCadence, setNewCategoryCadence] = useState<SpendingCadence>('weekly');
  const [justCreated, setJustCreated] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinAction, setPinAction] = useState<'lock' | 'unlock' | null>(null);
  const [lockStartDate, setLockStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [lockEndDate, setLockEndDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString().split('T')[0];
  });
  const [lockFrequency, setLockFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const generateSchedule = (total: number, start: string, end: string, freq: 'daily' | 'weekly' | 'monthly') => {
    const startD = new Date(start);
    const endD = new Date(end);
    if (endD <= startD) return [];
    const dates: Date[] = [];
    const current = new Date(startD);
    while (current <= endD) {
      dates.push(new Date(current));
      if (freq === 'daily') current.setDate(current.getDate() + 1);
      else if (freq === 'weekly') current.setDate(current.getDate() + 7);
      else current.setMonth(current.getMonth() + 1);
    }
    if (dates.length === 0) return [];
    const perSlot = Math.floor(total / dates.length);
    const remainder = total - perSlot * dates.length;
    return dates.map((d, i) => ({
      date: d.toISOString().split('T')[0],
      amount: perSlot + (i === dates.length - 1 ? remainder : 0),
    }));
  };

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


  const groupedCategories = useMemo(() => {
    const categories = budgetPlan?.categories ?? [];
    return {
      'Essential Expenses': categories.filter((item) => item.group === 'Essential Expenses'),
      'Flexible Expenses': categories.filter((item) => item.group === 'Flexible Expenses'),
      'Savings & Goals': categories.filter((item) => item.group === 'Savings & Goals'),
    };
  }, [budgetPlan]);

  // For Spending Breakdown
  const essentialsTotal = groupedCategories['Essential Expenses']?.reduce((sum, c) => sum + c.amount, 0) || 0;
  const flexibleTotal = groupedCategories['Flexible Expenses']?.reduce((sum, c) => sum + c.amount, 0) || 0;
  const goalsTotal = groupedCategories['Savings & Goals']?.reduce((sum, c) => sum + c.amount, 0) || 0;

  // For Income & Expenses Chart (mock data for Jan-Jun)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const incomeData = [0, 9000, 18000, 27000, 36000, budgetPlan?.income || 0];
  const expensesData = [0, 7000, 15000, 21000, 32000, essentialsTotal + flexibleTotal + goalsTotal];

  const totalAllocated = (budgetPlan?.categories ?? []).reduce((sum, item) => sum + item.amount, 0);
  const remainingBalance = (budgetPlan?.income ?? 0) - totalAllocated;
  const planInterest = calculateInterestPreview(budgetPlan?.categories ?? []);

  const previewSchedule = useMemo(() => {
    return generateSchedule(totalAllocated, lockStartDate, lockEndDate, lockFrequency);
  }, [totalAllocated, lockStartDate, lockEndDate, lockFrequency]);

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

    setJustCreated(true);
    setView('manage');
    setTimeout(() => setJustCreated(false), 4000);
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

  // Remove category (for goals)
  const removeCategory = (categoryId: string) => {
    setBudgetPlan((current) => {
      if (!current) return current;
      return {
        ...current,
        categories: current.categories.filter((cat) => cat.id !== categoryId),
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
    setPinAction('lock');
    setShowPinModal(true);
  };

  const executeLock = () => {
    if (!budgetPlan) return;
    const schedule = generateSchedule(totalAllocated, lockStartDate, lockEndDate, lockFrequency);
    setBudgetPlan({
      ...budgetPlan,
      lockedSummary: {
        lockedAt: new Date().toISOString(),
        totalLocked: totalAllocated,
        eligibleInterest: planInterest.estimatedInterest,
        annualInterestRate: planInterest.annualRate,
        pinHash: '',
        startDate: lockStartDate,
        endDate: lockEndDate,
        unlockFrequency: lockFrequency,
        schedule,
      },
    });
    setShowPinModal(false);
    setPinAction(null);
  };

  const requestUnlock = () => {
    setPinAction('unlock');
    setShowPinModal(true);
  };

  const executeUnlock = () => {
    setShowPinModal(false);
    setPinAction(null);
    resetPlan();
  };

  const resetPlan = () => {
    localStorage.removeItem(storageKey);
    setBudgetPlan(null);
    setProfession(null);
    setBudgetStyle(null);
    setIncome('');
    setSetupStep('profession');
    setView('create');
  };

  /* ── MENU VIEW ── */
  if (view === 'menu') {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Budget Planner</h2>
          <p className="mt-2 text-sm text-slate-500">Plan, lock, and track your spending with discipline</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => { resetPlan(); setView('create'); }}
            className="group rounded-[24px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-[#2c3e5f] hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">+</div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2c3e5f]">Create New Budget Plan</h3>
            <p className="mt-1 text-sm text-slate-500">Pick your profession, budget style, and income to generate a full plan.</p>
          </button>

          <button
            onClick={() => setView('manage')}
            className="group rounded-[24px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-[#2c3e5f] hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">📊</div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2c3e5f]">Manage Existing</h3>
            <p className="mt-1 text-sm text-slate-500">View your budget, edit allocations, and lock funds.</p>
            {budgetPlan && (
              <span className="mt-3 inline-block rounded-full bg-[#2c3e5f] px-3 py-1 text-xs font-semibold text-white">
                {budgetPlan.categories.length} categories
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ── CREATE VIEW ── */
  if (view === 'create') {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('menu')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create New Budget Plan</h2>
            <p className="text-sm text-slate-500">Set up your personalised spending plan in 3 steps</p>
          </div>
        </div>

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
      </div>
    );
  }

  /* ── MANAGE VIEW ── */
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('menu')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Budget Plan</h2>
            <p className="text-sm text-slate-500">View and manage your spending allocations</p>
          </div>
        </div>
        <button
          onClick={() => { resetPlan(); setView('create'); }}
          className="rounded-xl bg-[#2c3e5f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#244d24]"
        >
          + New Plan
        </button>
      </div>

      {justCreated && (
        <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Budget plan created successfully! Your spending categories have been generated.
        </div>
      )}

      {!budgetPlan ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <h3 className="text-lg font-semibold text-slate-700">No budget plan yet</h3>
          <p className="mt-1 text-sm text-slate-500">Create your first budget plan to start managing your spending.</p>
          <button
            onClick={() => { resetPlan(); setView('create'); }}
            className="mt-4 rounded-xl bg-[#2c3e5f] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#244d24]"
          >
            Create Budget Plan
          </button>
        </div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Profession</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{PROFESSION_LABELS[budgetPlan.profession]}</p>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Budget Type</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{budgetPlan.budgetStyle}</p>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Income</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(budgetPlan.income)}</p>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Remaining</p>
              <p className={`mt-1 text-xl font-bold ${remainingBalance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
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
                {!budgetPlan.lockedSummary && (
                  <button
                    onClick={resetPlan}
                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
                  >
                    Start Over
                  </button>
                )}
              </div>

              {!budgetPlan.lockedSummary && (
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
                        <div key={category.id} className="rounded-2xl bg-white p-4 shadow-sm flex flex-col gap-2">
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

                          {/* Remove button for goals */}
                          {group === 'Savings & Goals' && (
                            <button
                              className="mt-2 self-end text-xs text-red-600 hover:underline"
                              onClick={() => removeCategory(category.id)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                        {/* Spending Breakdown and Income/Expenses Chart */}
                        <div className="mt-8 grid gap-8 md:grid-cols-2">
                          <SpendingBreakdown essentials={essentialsTotal} flexible={flexibleTotal} goals={goalsTotal} />
                          <IncomeExpensesChart months={months} income={incomeData} expenses={expensesData} />
                        </div>
              </div>
              )}
            </div>

            <div className="space-y-6">
              {!budgetPlan.lockedSummary && (
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
              )}

              {!budgetPlan.lockedSummary && (
              <section className="rounded-3xl bg-white p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-slate-900">Lock &amp; Schedule</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Choose a start date, end date, and how often you want funds released.
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Start Date</label>
                    <input
                      type="date"
                      value={lockStartDate}
                      onChange={(e) => setLockStartDate(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">End Date</label>
                    <input
                      type="date"
                      value={lockEndDate}
                      min={lockStartDate}
                      onChange={(e) => setLockEndDate(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Unlock Frequency</label>
                  <div className="mt-2 flex gap-2">
                    {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                      <button
                        key={freq}
                        onClick={() => setLockFrequency(freq)}
                        className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                          lockFrequency === freq
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {previewSchedule.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-bold text-slate-900">Disbursement Schedule</h4>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatCurrency(totalAllocated)} split into {previewSchedule.length}{' '}
                      {lockFrequency} release{previewSchedule.length > 1 ? 's' : ''}
                    </p>
                    <div className="mt-3 max-h-48 overflow-y-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-slate-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {previewSchedule.map((entry, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-4 py-2.5 text-slate-700">
                                {new Date(entry.date).toLocaleDateString('en-NG', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                              </td>
                              <td className="px-4 py-2.5 text-right font-semibold text-emerald-700">
                                {formatCurrency(entry.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {previewSchedule.length === 0 && (
                  <p className="mt-4 text-xs text-red-600">End date must be after start date.</p>
                )}

                <div className="mt-6 space-y-3 text-sm text-slate-600">
                  <p>
                    Eligible locked amount:{' '}
                    <span className="font-semibold text-slate-900">{formatCurrency(planInterest.eligibleAmount)}</span>
                  </p>
                  <p>
                    Estimated interest:{' '}
                    <span className="font-semibold text-emerald-700">{formatCurrency(planInterest.estimatedInterest)}</span>
                  </p>
                </div>

                <button
                  onClick={lockFunds}
                  disabled={remainingBalance < 0 || previewSchedule.length === 0}
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
              )}

              {budgetPlan.lockedSummary && (
                <section className="rounded-3xl border border-cyan-200 bg-cyan-50 p-8 shadow-xl">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100">
                      <svg className="h-8 w-8 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-xs uppercase tracking-[0.24em] text-cyan-700">Funds Secured</p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-900">Your budget is locked</h3>
                    <p className="mt-3 text-sm text-slate-500">
                      {formatCurrency(budgetPlan.lockedSummary.totalLocked)} locked since{' '}
                      {new Date(budgetPlan.lockedSummary.lockedAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="mt-1 text-sm text-emerald-600 font-medium">
                      Estimated interest: {formatCurrency(budgetPlan.lockedSummary.eligibleInterest)}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Releasing {budgetPlan.lockedSummary.unlockFrequency} from{' '}
                      {new Date(budgetPlan.lockedSummary.startDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                      {' '}to{' '}
                      {new Date(budgetPlan.lockedSummary.endDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {budgetPlan.lockedSummary.schedule.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-bold text-slate-900">Release Schedule</h4>
                      <div className="mt-2 max-h-56 overflow-y-auto rounded-2xl border border-cyan-200 bg-white">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-cyan-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-cyan-700">Date</th>
                              <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-cyan-700">Available</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-cyan-100">
                            {budgetPlan.lockedSummary.schedule.map((entry, i) => {
                              const isPast = new Date(entry.date) <= new Date();
                              return (
                                <tr key={i} className={isPast ? 'bg-emerald-50' : ''}>
                                  <td className="px-4 py-2.5 text-slate-700">
                                    {new Date(entry.date).toLocaleDateString('en-NG', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                    {isPast && <span className="ml-2 text-xs text-emerald-600">&#10003; Released</span>}
                                  </td>
                                  <td className="px-4 py-2.5 text-right font-semibold text-emerald-700">
                                    {formatCurrency(entry.amount)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 text-center">
                    <p className="text-xs text-slate-400">
                      Enter your 4-digit PIN to unlock all funds early.
                    </p>
                    <button
                      onClick={requestUnlock}
                      className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-100"
                    >
                      Unlock Funds (Requires PIN)
                    </button>
                  </div>
                </section>
              )}
            </div>
          </section>
        </>
      )}

      {showPinModal && (
        <PinConfirmModal
          title={pinAction === 'unlock' ? 'Unlock Funds' : 'Lock Funds'}
          description={pinAction === 'unlock' ? 'Enter your PIN to unlock and release funds' : 'Enter your PIN to secure your locked funds'}
          onConfirm={() => {
            if (pinAction === 'lock') executeLock();
            else if (pinAction === 'unlock') executeUnlock();
          }}
          onCancel={() => { setShowPinModal(false); setPinAction(null); }}
        />
      )}
    </div>
  );
}
