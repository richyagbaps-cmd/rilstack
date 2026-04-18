'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import PinConfirmModal from './PinConfirmModal';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

type SavingsView = 'menu' | 'create' | 'manage';

const SAVINGS_CATEGORIES = [
  { id: 'safety-net', label: 'Safety Net', icon: '🛡️', description: 'Emergency funds and financial cushion for unexpected expenses.', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'recreation', label: 'Recreation', icon: '✈️', description: 'Vacations, hobbies, and experiences you want to save towards.', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { id: 'housing', label: 'Housing', icon: '🏠', description: 'Down payments, rent reserves, and home improvement funds.', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { id: 'education', label: 'Education', icon: '📚', description: 'Tuition, courses, certifications, and learning materials.', color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { id: 'other', label: 'Other', icon: '🎯', description: 'Custom savings goals that don\'t fit the categories above.', color: 'text-slate-700', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
];

export default function SavingsGoals() {
  const [view, setView] = useState<SavingsView>('menu');
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingGoal, setPendingGoal] = useState<{ name: string; targetAmount: string; deadline: string } | null>(null);

  const { register, handleSubmit, reset } = useForm<{ name: string; targetAmount: string; deadline: string }>();

  const onSubmit = (data: { name: string; targetAmount: string; deadline: string }) => {
    if (!selectedCategory) return;
    const targetAmount = parseFloat(data.targetAmount);
    if (targetAmount < 5000) return;
    setPendingGoal(data);
    setShowPinModal(true);
  };

  const executeCreateGoal = () => {
    if (!pendingGoal || !selectedCategory) return;
    const targetAmount = parseFloat(pendingGoal.targetAmount);

    const newGoal: SavingsGoal = {
      id: Date.now().toString(),
      name: pendingGoal.name,
      targetAmount,
      currentAmount: 0,
      deadline: pendingGoal.deadline,
      category: selectedCategory,
    };
    setGoals([...goals, newGoal]);
    setSelectedCategory(null);
    setPendingGoal(null);
    setShowPinModal(false);
    reset();
    setJustCreated(true);
    setView('manage');
    setTimeout(() => setJustCreated(false), 4000);
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : '0.0';

  const categoryInfo = SAVINGS_CATEGORIES.find((c) => c.id === selectedCategory);

  /* ── MENU VIEW ── */
  if (view === 'menu') {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => window.history.length > 1 ? window.history.back() : null}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            aria-label="Back"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Savings Goals</h2>
            <p className="mt-2 text-sm text-slate-500">Set targets, track progress, and save with purpose</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => setView('create')}
            className="group rounded-[24px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-[#2c3e5f] hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">+</div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2c3e5f]">Create New Savings Goal</h3>
            <p className="mt-1 text-sm text-slate-500">Choose a category, set a target amount and deadline.</p>
          </button>
          <button
            onClick={() => setView('manage')}
            className="group rounded-[24px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-[#2c3e5f] hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">📊</div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2c3e5f]">Manage Existing</h3>
            <p className="mt-1 text-sm text-slate-500">View progress, track balances, and manage your goals.</p>
            {goals.length > 0 && (
              <span className="mt-3 inline-block rounded-full bg-[#2c3e5f] px-3 py-1 text-xs font-semibold text-white">
                {goals.length} active
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ── CREATE: CHOOSE CATEGORY ── */
  if (view === 'create' && !selectedCategory) {
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
            <h2 className="text-xl font-bold text-slate-900">Choose a Savings Category</h2>
            <p className="text-sm text-slate-500">Select the type of goal you want to save for</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {SAVINGS_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`group rounded-[24px] border ${cat.borderColor} ${cat.bgColor} p-5 text-left transition hover:shadow-md`}
            >
              <div className="mb-3 text-3xl">{cat.icon}</div>
              <h3 className={`text-lg font-bold ${cat.color}`}>{cat.label}</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{cat.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── CREATE: GOAL DETAILS FORM ── */
  if (view === 'create' && selectedCategory && categoryInfo) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">New {categoryInfo.label} Goal</h2>
            <p className="text-sm text-slate-500">Set your target and deadline</p>
          </div>
        </div>

        <div className={`rounded-[24px] border ${categoryInfo.borderColor} ${categoryInfo.bgColor} p-5`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{categoryInfo.icon}</span>
            <div>
              <h3 className={`font-bold ${categoryInfo.color}`}>{categoryInfo.label}</h3>
              <p className="text-xs text-slate-500">{categoryInfo.description}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Goal Name</label>
            <input
              type="text"
              placeholder="e.g., Emergency Fund"
              {...register('name', { required: true })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-[#2c3e5f] focus:outline-none focus:ring-1 focus:ring-[#2c3e5f]"
            />
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Target Amount (₦)</label>
            <input
              type="number"
              step="1"
              placeholder="Minimum ₦5,000"
              {...register('targetAmount', { required: true, min: 5000 })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900 focus:border-[#2c3e5f] focus:outline-none focus:ring-1 focus:ring-[#2c3e5f]"
            />
            <p className="mt-1 text-xs text-slate-400">Minimum target: ₦5,000</p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Target Date</label>
            <input
              type="date"
              {...register('deadline', { required: true })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-[#2c3e5f] focus:outline-none focus:ring-1 focus:ring-[#2c3e5f]"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-[#2c3e5f] py-3 font-semibold text-white transition hover:bg-[#244d24]"
            >
              Create Goal
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ── MANAGE VIEW ── */
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('menu')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            aria-label="Back"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Savings Goals</h2>
            <p className="text-sm text-slate-500">Track and manage your progress</p>
          </div>
        </div>
        <button
          onClick={() => { setSelectedCategory(null); setView('create'); }}
          className="rounded-xl bg-[#2c3e5f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#244d24]"
        >
          + New Goal
        </button>
      </div>

      {justCreated && (
        <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Savings goal created successfully! Start saving towards your target.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total Goals</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{goals.length}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total Target</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">₦{totalTarget.toLocaleString()}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total Saved</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">₦{totalSaved.toLocaleString()}</p>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Overall Progress</p>
          <p className="mt-1 text-2xl font-bold text-[#2c3e5f]">{overallProgress}%</p>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <h3 className="text-lg font-semibold text-slate-700">No savings goals yet</h3>
          <p className="mt-1 text-sm text-slate-500">Create your first savings goal to start building towards your targets.</p>
          <button
            onClick={() => { setSelectedCategory(null); setView('create'); }}
            className="mt-4 rounded-xl bg-[#2c3e5f] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#244d24]"
          >
            Create Savings Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const catInfo = SAVINGS_CATEGORIES.find((c) => c.id === goal.category);
            return (
              <div key={goal.id} className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{catInfo?.icon ?? '🎯'}</span>
                    <div>
                      <h4 className="font-bold text-slate-900">{goal.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${catInfo ? `${catInfo.bgColor} ${catInfo.color}` : 'bg-slate-100 text-slate-700'}`}>
                          {catInfo?.label ?? goal.category}
                        </span>
                        <span className="text-xs text-slate-400">{daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">₦{goal.currentAmount.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">of ₦{goal.targetAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{percentage.toFixed(1)}% complete</span>
                    <span>₦{(goal.targetAmount - goal.currentAmount).toLocaleString()} remaining</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-[#2c3e5f] transition-all" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs text-slate-500">Target</p>
                    <p className="text-sm font-semibold text-slate-700">₦{goal.targetAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Saved</p>
                    <p className="text-sm font-semibold text-emerald-600">₦{goal.currentAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Deadline</p>
                    <p className="text-sm font-semibold text-slate-700">{goal.deadline}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showPinModal && (
        <PinConfirmModal
          title="Confirm Savings Goal"
          description="Enter your 4-digit PIN to create this savings goal"
          onConfirm={executeCreateGoal}
          onCancel={() => { setShowPinModal(false); setPendingGoal(null); }}
        />
      )}
    </div>
  );
}
