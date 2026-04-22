"use client";

import Link from "next/link";

export interface SavingsGoalItem {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  daysLeft?: number;
}

export interface RetirementGoalItem {
  name: string;
  annualRate: number;
  lockedAmount: number;
  unlockDate: string;
}

export interface SavingsSnapshotData {
  topGoal: SavingsGoalItem | null;
  retirement: RetirementGoalItem | null;
  safeLockCount: number;
  dailyInterestEarned: number;
}

interface SavingsGoalsSnapshotProps {
  data: SavingsSnapshotData;
}

function formatNaira(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SavingsGoalsSnapshot({ data }: SavingsGoalsSnapshotProps) {
  if (!data.topGoal && !data.retirement) {
    return (
      <section className="rounded-[20px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.02)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Savings Goals</h2>
          <Link href="/savings-goals" className="text-sm font-semibold text-[#1A5F7A] hover:underline">
            See all
          </Link>
        </div>

        <Link
          href="/savings-goals"
          className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#1A5F7A] px-4 text-sm font-semibold text-white transition hover:bg-[#0E4A63]"
        >
          Create your first savings goal
        </Link>
      </section>
    );
  }

  const topGoalProgress = data.topGoal && data.topGoal.targetAmount > 0
    ? Math.min((data.topGoal.currentAmount / data.topGoal.targetAmount) * 100, 100)
    : 0;

  return (
    <section className="rounded-[20px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.02)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Savings Goals</h2>
        <Link href="/savings-goals" className="text-sm font-semibold text-[#1A5F7A] hover:underline">
          See all
        </Link>
      </div>

      {data.topGoal && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">{data.topGoal.name}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#1A5F7A]"
              style={{ width: `${topGoalProgress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span>{formatNaira(data.topGoal.currentAmount)} / {formatNaira(data.topGoal.targetAmount)}</span>
            {typeof data.topGoal.daysLeft === "number" && (
              <span>{data.topGoal.daysLeft} days left</span>
            )}
          </div>
        </div>
      )}

      {data.retirement && (
        <div className="mb-4 rounded-2xl border border-[#F4A261]/50 bg-[#F4A261]/10 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">{data.retirement.name}</p>
            <span className="inline-flex items-center rounded-full bg-[#F4A261] px-2.5 py-1 text-[11px] font-semibold text-white">
              Retirement
            </span>
          </div>
          <p className="text-xs text-slate-700">18% p.a.</p>
          <p className="mt-1 text-xs text-slate-700">
            Locked: {formatNaira(data.retirement.lockedAmount)}
          </p>
          <p className="mt-1 text-xs text-slate-700">Unlock date: {data.retirement.unlockDate}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 text-xs">
        <p className="text-slate-600">
          {data.safeLockCount > 0 ? `Active Safe Locks: ${data.safeLockCount}` : "No active safe locks"}
        </p>
        <p className="font-semibold text-[#2E7D32]">+{formatNaira(data.dailyInterestEarned)} today</p>
      </div>
    </section>
  );
}
