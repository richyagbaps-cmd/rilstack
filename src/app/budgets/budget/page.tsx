"use client";
import { useRouter } from "next/navigation";
import { Lock, Unlock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BudgetTypePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-24" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0F2C3D 0%, #1A4A2E 60%, #F4A261 100%)" }} className="overflow-hidden">
        <div className="px-5 pb-8 pt-12">
          <div className="mb-1 flex items-center gap-3">
            <Link href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <p className="text-[13px] font-semibold text-white/80">Budgets</p>
          </div>
          <p className="mt-3 text-[28px] font-bold text-white">Budget Planner</p>
          <p className="mt-1 text-[12px] text-white/60">Take control of your spending</p>
        </div>
      </div>

      <div className="px-4 py-6">
        <p className="mb-4 text-[13px] font-semibold text-slate-500">Choose a budgeting style</p>

        <div className="space-y-3">
          {/* Strict */}
          <button type="button" onClick={() => router.push("/budgets/budget/strict/type")}
            className="w-full rounded-2xl bg-white p-5 shadow-sm flex items-start gap-4 text-left transition active:scale-[0.98]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, #0AB68B, #078A6A)" }}>
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#0F2C3D]">Strict Budget</p>
              <p className="mt-1 text-[12px] text-slate-500 leading-relaxed">
                Money is locked via Safe Lock. No withdrawals until the end date. Best for disciplined savers.
              </p>
              <span className="mt-2 inline-block rounded-full bg-[#E6F7F3] px-3 py-1 text-[11px] font-bold text-[#0AB68B]">Recommended</span>
            </div>
          </button>

          {/* Relaxed */}
          <button type="button" onClick={() => router.push("/budgets/budget/relaxed/type")}
            className="w-full rounded-2xl bg-white p-5 shadow-sm flex items-start gap-4 text-left transition active:scale-[0.98]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, #F4A261, #e07c2a)" }}>
              <Unlock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#0F2C3D]">Relaxed Budget</p>
              <p className="mt-1 text-[12px] text-slate-500 leading-relaxed">
                Withdraw anytime, but pay a 3.5% fee on early withdrawals. Flexible for changing plans.
              </p>
              <span className="mt-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-600">Flexible</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

