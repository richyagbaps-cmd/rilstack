"use client";

import Link from "next/link";

type CategorySpend = {
  name: string;
  spent: number;
  allocated: number;
  icon: "food" | "transport" | "entertainment";
};

export interface ActiveBudgetData {
  dateRange: string;
  spentPercent: number;
  style: "strict" | "relaxed";
  categories: CategorySpend[];
}

interface ActiveBudgetSnapshotProps {
  budget: ActiveBudgetData | null;
}

function formatNaira(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function CategoryIcon({ type }: { type: CategorySpend["icon"] }) {
  if (type === "food") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#1A5F7A]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 3v8" />
        <path d="M10 3v8" />
        <path d="M6 7h4" />
        <path d="M10 11v10" />
        <path d="M15 3c2 2 2 6 0 8v10" />
      </svg>
    );
  }
  if (type === "transport") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#1A5F7A]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M3 10h18" />
        <circle cx="7" cy="19" r="1.6" />
        <circle cx="17" cy="19" r="1.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#1A5F7A]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16l-2 10H6L4 7z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 84 84" className="h-24 w-24 -rotate-90">
        <circle cx="42" cy="42" r={radius} stroke="#E9ECEF" strokeWidth="8" fill="none" />
        <circle
          cx="42"
          cy="42"
          r={radius}
          stroke="#1A5F7A"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-center">
        <span className="text-xs font-semibold text-slate-700">{Math.round(clamped)}% spent</span>
      </div>
    </div>
  );
}

export default function ActiveBudgetSnapshot({ budget }: ActiveBudgetSnapshotProps) {
  if (!budget) {
    return (
      <section className="rounded-[20px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.02)]">
        <h2 className="text-base font-semibold text-slate-900">Active Budget</h2>
        <p className="mt-2 text-sm text-slate-500">No active budget</p>
        <Link
          href="/budgets/budget"
          className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#1A5F7A] px-4 text-sm font-semibold text-white transition hover:bg-[#0E4A63]"
        >
          Create Budget
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-[20px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.02)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">Active Budget</h2>
        <p className="text-xs font-medium text-slate-500">{budget.dateRange}</p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <ProgressRing percent={budget.spentPercent} />
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            budget.style === "strict"
              ? "bg-slate-900 text-white"
              : "bg-[#F4A261]/20 text-[#9A4B00]"
          }`}
        >
          {budget.style === "strict" ? "Strict" : "Relaxed"}
        </span>
      </div>

      <div className="space-y-3">
        {budget.categories.slice(0, 3).map((category) => {
          const progress = category.allocated > 0
            ? Math.min((category.spent / category.allocated) * 100, 100)
            : 0;

          return (
            <div key={category.name}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CategoryIcon type={category.icon} />
                  <span className="text-sm font-medium text-slate-800">{category.name}</span>
                </div>
                <span className="text-xs text-slate-500">
                  {formatNaira(category.spent)} / {formatNaira(category.allocated)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#1A5F7A]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/budgets/budget/summary"
        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl border border-[#1A5F7A] bg-white px-4 text-sm font-semibold text-[#1A5F7A] transition hover:bg-[#1A5F7A]/5"
      >
        View full budget
      </Link>
    </section>
  );
}
