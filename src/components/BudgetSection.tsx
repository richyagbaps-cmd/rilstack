'use client';

import React, { useEffect, useMemo, useState } from 'react';

type BudgetMode = 'strict' | 'relaxed';
type BudgetStyle = '50-30-20' | 'zero-based' | 'custom';
type Profession = 'student' | 'worker' | 'entrepreneur' | 'freelancer';
type CategoryGroup = 'Essential Expenses' | 'Flexible Expenses' | 'Savings & Goals';

interface BudgetCategory {
  id: string;
  name: string;
  group: CategoryGroup;
  amount: number;
  unlockDate: string;
  note: string;
  editable: boolean;
}

interface BudgetPlan {
  profession: Profession;
  budgetStyle: BudgetStyle;
  income: number;
  categories: BudgetCategory[];
  createdAt: string;
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
  Array<{ name: string; group: CategoryGroup; note: string }>
> = {
  student: [
    { name: 'School Fees', group: 'Essential Expenses', note: 'Tuition, registration, and academic costs.' },
    { name: 'Transport', group: 'Essential Expenses', note: 'Daily commuting and occasional travel.' },
    { name: 'Feeding', group: 'Essential Expenses', note: 'Meals, groceries, and cooking supplies.' },
    { name: 'Data & Airtime', group: 'Flexible Expenses', note: 'Connectivity for classes and communication.' },
    { name: 'Personal Care', group: 'Flexible Expenses', note: 'Toiletries, laundry, and small personal needs.' },
    { name: 'Books & Learning', group: 'Savings & Goals', note: 'Courses, books, projects, and study tools.' },
    { name: 'Emergency Buffer', group: 'Savings & Goals', note: 'Small reserve for urgent student needs.' },
  ],
  worker: [
    { name: 'Rent & Housing', group: 'Essential Expenses', note: 'Rent, service charge, and housing upkeep.' },
    { name: 'Utilities', group: 'Essential Expenses', note: 'Power, water, internet, and subscriptions.' },
    { name: 'Transport', group: 'Essential Expenses', note: 'Commuting, fuel, or ride-hailing costs.' },
    { name: 'Food & Groceries', group: 'Essential Expenses', note: 'Monthly food and home supplies.' },
    { name: 'Dining & Lifestyle', group: 'Flexible Expenses', note: 'Restaurants, outings, and entertainment.' },
    { name: 'Family Support', group: 'Flexible Expenses', note: 'Support for family or dependants.' },
    { name: 'Emergency Savings', group: 'Savings & Goals', note: 'Cash reserve for unexpected costs.' },
    { name: 'Investments', group: 'Savings & Goals', note: 'Long-term growth and future planning.' },
  ],
  entrepreneur: [
    { name: 'Home Expenses', group: 'Essential Expenses', note: 'Personal housing and household costs.' },
    { name: 'Business Operations', group: 'Essential Expenses', note: 'Inventory, logistics, tools, and recurring business spend.' },
    { name: 'Utilities & Bills', group: 'Essential Expenses', note: 'Power, internet, and communication tools.' },
    { name: 'Transport', group: 'Essential Expenses', note: 'Meetings, deliveries, and movement.' },
    { name: 'Marketing', group: 'Flexible Expenses', note: 'Ads, content, promotions, and brand growth.' },
    { name: 'Lifestyle', group: 'Flexible Expenses', note: 'Personal enjoyment and flexible spending.' },
    { name: 'Tax Reserve', group: 'Savings & Goals', note: 'Set aside for levies, tax, and compliance.' },
    { name: 'Business Expansion', group: 'Savings & Goals', note: 'Reinvestment for growth opportunities.' },
  ],
  freelancer: [
    { name: 'Housing', group: 'Essential Expenses', note: 'Rent and home essentials.' },
    { name: 'Internet & Tools', group: 'Essential Expenses', note: 'Software, data, subscriptions, and connectivity.' },
    { name: 'Transport', group: 'Essential Expenses', note: 'Client meetings and movement.' },
    { name: 'Food & Utilities', group: 'Essential Expenses', note: 'Living costs and household spend.' },
    { name: 'Client Acquisition', group: 'Flexible Expenses', note: 'Portfolio, ads, networking, and proposals.' },
    { name: 'Lifestyle', group: 'Flexible Expenses', note: 'Entertainment and personal spending.' },
    { name: 'Tax Savings', group: 'Savings & Goals', note: 'A reserve for tax and compliance.' },
    { name: 'Device Upgrade Fund', group: 'Savings & Goals', note: 'Laptop, phone, and equipment replacement.' },
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

const formatCurrency = (amount: number) => `N${Math.round(amount).toLocaleString()}`;

const makeDate = (daysAhead: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
};

const getDefaultUnlockDate = (group: CategoryGroup, budgetMode: BudgetMode) => {
  if (budgetMode === 'strict') {
    if (group === 'Essential Expenses') return makeDate(30);
    if (group === 'Flexible Expenses') return makeDate(14);
    return makeDate(45);
  }

  if (group === 'Essential Expenses') return makeDate(14);
  if (group === 'Flexible Expenses') return makeDate(10);
  return makeDate(30);
};

const allocateAcrossCategories = (
  items: Array<{ name: string; group: CategoryGroup; note: string }>,
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

    return {
      id: `${item.group}-${index}-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: item.name,
      group: item.group,
      amount: Math.max(1000, Math.round(baseAmount * multiplier)),
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
  const [budgetPlan, setBudgetPlan] = useState<BudgetPlan | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryGroup, setNewCategoryGroup] = useState<CategoryGroup>('Flexible Expenses');

  useEffect(() => {
    const savedPlan = localStorage.getItem(storageKey);
    if (!savedPlan) return;

    try {
      const parsedPlan = JSON.parse(savedPlan) as BudgetPlan;
      setBudgetPlan(parsedPlan);
      setProfession(parsedPlan.profession);
      setBudgetStyle(parsedPlan.budgetStyle);
      setIncome(String(parsedPlan.income));
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
          subtitle: 'Create a time-locked spending plan with scheduled release dates for each category.',
          rule: 'Funds stay locked until the chosen open date. This mode is built for discipline and controlled spending.',
          penalty: 'No early-withdrawal fee is shown here because strict mode is meant to keep funds locked until the approved date.',
          accent: 'from-cyan-700 to-blue-900',
        }
      : {
          title: 'Relaxed Budget Planner',
          subtitle: 'Create a flexible plan with open dates, while still discouraging early withdrawals.',
          rule: 'Each category has an expected spend-open date, but early withdrawals are allowed.',
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

  const updateCategory = (categoryId: string, field: keyof BudgetCategory, value: string | number) => {
    setBudgetPlan((current) => {
      if (!current) return current;

      return {
        ...current,
        categories: current.categories.map((category) =>
          category.id === categoryId ? { ...category, [field]: value } : category,
        ),
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
      unlockDate: getDefaultUnlockDate(newCategoryGroup, budgetMode),
      note: 'Added manually by user.',
      editable: true,
    };

    setBudgetPlan({
      ...budgetPlan,
      categories: [...budgetPlan.categories, newCategory],
    });
    setNewCategoryName('');
  };

  const resetPlan = () => {
    localStorage.removeItem(storageKey);
    setBudgetPlan(null);
    setProfession(null);
    setBudgetStyle(null);
    setIncome('');
  };

  return (
    <div className="space-y-8">
      <section className={`rounded-3xl bg-gradient-to-br ${modeDetails.accent} p-8 text-white shadow-2xl`}>
        <p className="text-sm uppercase tracking-[0.28em] text-white/70">{budgetMode} mode</p>
        <h2 className="mt-3 text-3xl font-bold">{modeDetails.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/85">{modeDetails.subtitle}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Spending Rule</p>
            <p className="mt-2 text-sm leading-6 text-white/90">{modeDetails.rule}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Withdrawal Notice</p>
            <p className="mt-2 text-sm leading-6 text-white/90">{modeDetails.penalty}</p>
          </div>
        </div>
      </section>

      {!budgetPlan && (
        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-slate-900">1. Tell us what kind of earner you are</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your profession shapes the expense categories the planner creates for you.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {(Object.keys(PROFESSION_LABELS) as Profession[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setProfession(option)}
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
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-slate-900">2. Pick your budget type</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              After choosing your budget type, the planner will generate an editable allocation from your income.
            </p>
            <div className="mt-6 space-y-4">
              {BUDGET_STYLE_INFO.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setBudgetStyle(option.id)}
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
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-slate-900">3. Enter your monthly income</label>
              <input
                type="number"
                min="1"
                value={income}
                onChange={(event) => setIncome(event.target.value)}
                placeholder="e.g. 350000"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-cyan-500"
              />
            </div>

            <button
              onClick={generatePlan}
              disabled={!profession || !budgetStyle || !income}
              className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Generate AI Budget Plan
            </button>
          </div>
        </section>
      )}

      {budgetPlan && (
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

          <section className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Editable AI allocation</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Your categories are grouped together for easier planning. You can edit every amount, adjust open dates,
                  and add more categories that fit your lifestyle.
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
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{group}</h4>
                      <p className="text-sm text-slate-600">
                        {group === 'Essential Expenses' && 'Core bills and responsibilities that keep life running.'}
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
                        <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr,0.8fr]">
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
                            <p className="mt-2 text-xs text-slate-500">
                              {budgetMode === 'strict'
                                ? 'Locked until the open date you set.'
                                : 'Open date is advisory, but early withdrawals attract a 2% fee.'}
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
                            {budgetMode === 'relaxed' && (
                              <p className="mt-2 text-xs text-red-500">2% fee applies to withdrawals before this date.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-3xl bg-white p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-slate-900">Add more categories</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add custom categories if your spending style needs something extra beyond the AI-generated list.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-[1fr,0.8fr,auto]">
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
                <button
                  onClick={addCategory}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-slate-900">Planner notes</h3>
              <div className="mt-6 space-y-4 text-sm leading-6 text-slate-600">
                <p>
                  The planner uses your profession and selected budget style to draft category allocations automatically.
                  You can adjust the numbers freely to match real life.
                </p>
                <p>
                  In <span className="font-semibold text-slate-900">strict mode</span>, the open date acts like a release
                  date for spending from that category.
                </p>
                <p>
                  In <span className="font-semibold text-slate-900">relaxed mode</span>, spending can happen earlier, but
                  any early withdrawal from a category should be treated as carrying a 2% fee.
                </p>
                <p>
                  If the total allocated amount is above your income, reduce some category amounts until the remaining
                  balance becomes zero or positive.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
