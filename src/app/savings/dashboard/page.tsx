"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { DEMO_EMAIL, DEMO_SAVINGS_GOALS } from "@/lib/demo-data";
import {
  PiggyBank, TrendingUp, Lock, Plus, Minus, ChevronRight, Eye, EyeOff,
  ArrowLeft, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import PinModal from "@/components/PinModal";

const DAILY_INTEREST = 0.03;
const RETIREMENT_RATE = 0.18;
const RETIREMENT_PENALTY = 0.075;
const MIN_RETIREMENT_DURATION_YEARS = 5;
const MAX_RETIREMENT_DURATION_YEARS = 30;

function getInterest(saved: number, days: number) {
  return Math.round(saved * (Math.pow(1 + DAILY_INTEREST, days) - 1));
}
function daysSince(date: string) {
  const d = new Date(date);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}
function addYearsToDateInput(base: Date, years: number) {
  const next = new Date(base);
  next.setFullYear(next.getFullYear() + years);
  return next.toISOString().slice(0, 10);
}
function fmt(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2 }).format(v);
}

type PinAction =
  | { type: "add"; idx: number }
  | { type: "withdraw"; idx: number }
  | { type: "retire_create" }
  | { type: "retire_withdraw" }
  | null;

export default function SavingsDashboard() {
  const { data: session } = useSession();
  const [goals, setGoals] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [showAdd, setShowAdd] = useState<number | null>(null);
  const [showWithdraw, setShowWithdraw] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [retireInitial, setRetireInitial] = useState("");
  const [retireTarget, setRetireTarget] = useState("");
  const [retireDueDate, setRetireDueDate] = useState("");
  const [retirePayoutPreference, setRetirePayoutPreference] = useState<"wallet" | "compound">("compound");
  const [retireWithdrawAmount, setRetireWithdrawAmount] = useState("");
  const [retireClaimReason, setRetireClaimReason] = useState<"early" | "retirement_age" | "incapacitation">("early");
  const [retireMedicalCertified, setRetireMedicalCertified] = useState(false);
  const [retireNotice, setRetireNotice] = useState("");
  const [pinGate, setPinGate] = useState<PinAction>(null);
  const [addAmounts, setAddAmounts] = useState<Record<number, string>>({});
  const [wdAmounts, setWdAmounts] = useState<Record<number, string>>({});
  const [actionError, setActionError] = useState("");

  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  const refreshGoals = async () => {
    if (!userId) return;
    const updated = await fetch(`/api/savings?userId=${userId}`).then((r) => r.json());
    setGoals(updated || []);
  };

  useEffect(() => {
    const isDemo = session?.user?.email === DEMO_EMAIL;
    if (!userId) {
      setGoals(isDemo ? DEMO_SAVINGS_GOALS : []);
      setLoading(false);
      return;
    }
    fetch(`/api/savings?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const fetched = data || [];
        setGoals(fetched.length === 0 && isDemo ? DEMO_SAVINGS_GOALS : fetched);
        setLastUpdate(fetched?.[0]?.lastInterestCalculationDate || "");
      })
      .catch(() => setGoals(isDemo ? DEMO_SAVINGS_GOALS : []))
      .finally(() => setLoading(false));
  }, [session, userId]);

  const totalSaved = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const days = daysSince(lastUpdate || new Date().toISOString().slice(0, 10));
  const interest = getInterest(totalSaved, days);

  const handleAdd = async (idx: number, amt: number) => {
    const goal = goals[idx];
    setActionError("");
    try {
      const res = await fetch(`/api/savings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deposit", rowId: goal.rowId, goalId: goal.id, userId, amount: amt }),
      });
      if (!res.ok) throw new Error("Failed to add money");
      await refreshGoals();
      setShowAdd(null);
      setAddAmounts((p) => ({ ...p, [idx]: "" }));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to add money");
    }
  };

  const handleWithdraw = async (idx: number, amt: number) => {
    const goal = goals[idx];
    const locked = goal.safeLocks?.some((l: any) => new Date(l.unlockDate) > new Date());
    if (locked) { setActionError("Funds are locked and cannot be withdrawn."); return; }
    if (amt > (goal.currentAmount || 0)) { setActionError("Insufficient funds."); return; }
    setActionError("");
    try {
      const res = await fetch(`/api/savings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "withdraw", rowId: goal.rowId, goalId: goal.id, userId, amount: amt }),
      });
      if (!res.ok) throw new Error("Failed to withdraw");
      await refreshGoals();
      setShowWithdraw(null);
      setWdAmounts((p) => ({ ...p, [idx]: "" }));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to withdraw");
    }
  };

  const retirementGoal = goals.find((g) => g.type === "retirement");
  const minRetirementDueDate = addYearsToDateInput(new Date(), MIN_RETIREMENT_DURATION_YEARS);
  const maxRetirementDueDate = addYearsToDateInput(new Date(), MAX_RETIREMENT_DURATION_YEARS);

  const handleCreateRetirementPlan = async () => {
    if (!userId) { setRetireNotice("Not logged in"); return; }
    if (!retireDueDate || retireDueDate < minRetirementDueDate || retireDueDate > maxRetirementDueDate) {
      setRetireNotice(`Select a date between ${MIN_RETIREMENT_DURATION_YEARS} and ${MAX_RETIREMENT_DURATION_YEARS} years from today.`);
      return;
    }
    const res = await fetch("/api/savings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_retirement_plan", userId,
        amount: Number(retireInitial || 0), targetAmount: Number(retireTarget || 0),
        dueDate: retireDueDate, payoutPreference: retirePayoutPreference,
      }),
    });
    const data = await res.json();
    setRetireNotice(res.ok ? "Retirement plan created!" : (data.error || "Failed to create plan."));
    if (res.ok) await refreshGoals();
  };

  const handleRetirementWithdraw = async () => {
    if (!userId || !retirementGoal?.rowId) return;
    setRetireNotice("");
    const res = await fetch("/api/savings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "retirement_withdraw", userId, rowId: retirementGoal.rowId,
        goalId: retirementGoal.id, name: retirementGoal.name,
        amount: Number(retireWithdrawAmount || 0), claimReason: retireClaimReason,
        medicalCertified: retireMedicalCertified,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setRetireNotice(data.error || "Withdrawal failed."); return; }
    setRetireNotice(`Withdrawal successful. Net paid: ₦${Number(data.netAmount || 0).toLocaleString()}${Number(data.penalty || 0) > 0 ? ` (Penalty: ₦${Number(data.penalty).toLocaleString()})` : ""}`);
    await refreshGoals();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F6F8]">
        <RefreshCw className="h-6 w-6 animate-spin text-[#0AB68B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-24" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="overflow-hidden" style={{ background: "linear-gradient(135deg, #0F2C3D 0%, #0A5C45 60%, #0AB68B 100%)" }}>
        <div className="px-5 pb-8 pt-12">
          <div className="mb-1 flex items-center gap-3">
            <Link href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <p className="text-[13px] font-semibold text-white/80">Savings</p>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-[12px] text-white/70">Total Saved</p>
              <p className="text-[30px] font-bold text-white">
                {hidden ? "₦ ••••••" : fmt(totalSaved)}
              </p>
              <p className="mt-0.5 text-[12px] text-white/60">
                Interest accrued: {hidden ? "••••" : fmt(interest)}
              </p>
            </div>
            <button type="button" onClick={() => setHidden((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
              {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-white/15 py-3">
              <p className="text-[11px] text-white/60">Daily Rate</p>
              <p className="text-[18px] font-bold text-white">{(DAILY_INTEREST * 100).toFixed(0)}%</p>
            </div>
            <div className="rounded-2xl bg-white/15 py-3">
              <p className="text-[11px] text-white/60">Retirement APY</p>
              <p className="text-[18px] font-bold text-white">{(RETIREMENT_RATE * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Goals */}
      <div className="px-4 py-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[14px] font-bold text-[#0F2C3D]">Savings Goals</p>
          <Link href="/savings/goal/new"
            className="flex items-center gap-1 rounded-full bg-[#0AB68B] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">
            <Plus className="h-3 w-3" /> New Goal
          </Link>
        </div>

        {goals.filter((g) => g.type !== "retirement").length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-10 text-center shadow-sm">
            <PiggyBank className="mb-3 h-12 w-12 text-slate-200" />
            <p className="text-[14px] font-semibold text-slate-500">No savings goals yet</p>
            <p className="mt-1 text-[12px] text-slate-400">Create a goal to start saving</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.filter((g) => g.type !== "retirement").map((g, idx) => {
              const percent = Math.min(100, Math.round(((g.currentAmount || 0) / (g.targetAmount || 1)) * 100));
              const locked = g.safeLocks?.some((l: any) => new Date(l.unlockDate) > new Date());
              const unlockDate = locked ? g.safeLocks.find((l: any) => new Date(l.unlockDate) > new Date())?.unlockDate : null;
              return (
                <div key={g.name} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6F7F3]">
                        <PiggyBank className="h-5 w-5 text-[#0AB68B]" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#0F2C3D]">{g.name}</p>
                        <p className="text-[11px] text-slate-500">Target: {fmt(g.targetAmount || 0)}</p>
                      </div>
                    </div>
                    {locked && (
                      <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1">
                        <Lock className="h-3 w-3 text-amber-600" />
                        <span className="text-[10px] font-semibold text-amber-600">Locked</span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-[#0AB68B] transition-all" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="mb-3 flex justify-between text-[11px]">
                    <span className="font-semibold text-[#0AB68B]">{hidden ? "••••" : fmt(g.currentAmount || 0)}</span>
                    <span className="text-slate-400">{percent}%</span>
                  </div>

                  {locked && unlockDate && (
                    <p className="mb-2 text-[11px] text-amber-600">Locked until {new Date(unlockDate).toLocaleDateString()}</p>
                  )}
                  {actionError && showAdd === idx && (
                    <p className="mb-2 text-[12px] text-red-500">{actionError}</p>
                  )}

                  {/* Add/Withdraw buttons */}
                  <div className="flex gap-2">
                    <button type="button"
                      onClick={() => { setActionError(""); setShowAdd(idx === showAdd ? null : idx); setShowWithdraw(null); }}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#E6F7F3] py-2.5 text-[13px] font-semibold text-[#0AB68B] transition active:scale-95">
                      <Plus className="h-4 w-4" /> Add
                    </button>
                    <button type="button"
                      onClick={() => { setActionError(""); setShowWithdraw(idx === showWithdraw ? null : idx); setShowAdd(null); }}
                      disabled={locked}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-[13px] font-semibold text-slate-500 transition active:scale-95 disabled:opacity-40">
                      <Minus className="h-4 w-4" /> Withdraw
                    </button>
                  </div>

                  {/* Add panel */}
                  {showAdd === idx && (
                    <div className="mt-3 rounded-xl bg-[#F4F6F8] p-3">
                      <p className="mb-2 text-[12px] font-semibold text-slate-600">Amount to add (₦)</p>
                      <input type="number" inputMode="numeric" min={1}
                        placeholder="Enter amount"
                        value={addAmounts[idx] || ""}
                        onChange={(e) => setAddAmounts((p) => ({ ...p, [idx]: e.target.value }))}
                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] focus:border-[#0AB68B] focus:outline-none" />
                      <button type="button"
                        onClick={() => {
                          const amt = Number(addAmounts[idx] || 0);
                          if (amt > 0) setPinGate({ type: "add", idx });
                          else setActionError("Enter a valid amount");
                        }}
                        className="mt-2 h-11 w-full rounded-xl bg-[#0AB68B] text-[13px] font-bold text-white transition active:scale-[0.98]">
                        Confirm Add
                      </button>
                    </div>
                  )}

                  {/* Withdraw panel */}
                  {showWithdraw === idx && (
                    <div className="mt-3 rounded-xl bg-[#F4F6F8] p-3">
                      <p className="mb-2 text-[12px] font-semibold text-slate-600">Amount to withdraw (₦)</p>
                      <input type="number" inputMode="numeric" min={1}
                        placeholder="Enter amount"
                        value={wdAmounts[idx] || ""}
                        onChange={(e) => setWdAmounts((p) => ({ ...p, [idx]: e.target.value }))}
                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] focus:border-[#0AB68B] focus:outline-none" />
                      {actionError && showWithdraw === idx && (
                        <p className="mt-1 text-[12px] text-red-500">{actionError}</p>
                      )}
                      <button type="button"
                        onClick={() => {
                          const amt = Number(wdAmounts[idx] || 0);
                          if (amt > 0) setPinGate({ type: "withdraw", idx });
                          else setActionError("Enter a valid amount");
                        }}
                        className="mt-2 h-11 w-full rounded-xl bg-red-500 text-[13px] font-bold text-white transition active:scale-[0.98]">
                        Confirm Withdraw
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Retirement Plan */}
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[14px] font-bold text-[#0F2C3D]">Retirement Plan</p>
            <span className="rounded-full bg-[#E6F7F3] px-3 py-1 text-[11px] font-bold text-[#0AB68B]">
              {(RETIREMENT_RATE * 100).toFixed(0)}% p.a.
            </span>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EBF0FB]">
                <TrendingUp className="h-5 w-5 text-[#2D65E0]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#0F2C3D]">Long-term growth</p>
                <p className="text-[11px] text-slate-500">
                  {MIN_RETIREMENT_DURATION_YEARS}–{MAX_RETIREMENT_DURATION_YEARS} year lock · 7.5% early penalty
                </p>
              </div>
            </div>

            {!retirementGoal ? (
              <div className="space-y-2">
                <input type="number" min={0} placeholder="Initial amount (optional)"
                  value={retireInitial} onChange={(e) => setRetireInitial(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] focus:border-[#0AB68B] focus:outline-none" />
                <input type="number" min={0} placeholder="Target amount (optional)"
                  value={retireTarget} onChange={(e) => setRetireTarget(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] focus:border-[#0AB68B] focus:outline-none" />
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-500">Maturity Date</label>
                  <input type="date" value={retireDueDate}
                    min={minRetirementDueDate} max={maxRetirementDueDate}
                    onChange={(e) => setRetireDueDate(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] focus:border-[#0AB68B] focus:outline-none" />
                </div>
                <select value={retirePayoutPreference}
                  onChange={(e) => setRetirePayoutPreference(e.target.value === "wallet" ? "wallet" : "compound")}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] focus:border-[#0AB68B] focus:outline-none">
                  <option value="compound">Reinvest to compound</option>
                  <option value="wallet">Pay interest to wallet</option>
                </select>
                {retireNotice && <p className="text-[12px] text-[#0AB68B]">{retireNotice}</p>}
                <button type="button" onClick={() => setPinGate({ type: "retire_create" })}
                  className="h-12 w-full rounded-2xl bg-[#2D65E0] text-[14px] font-bold text-white transition active:scale-[0.98]">
                  Create Retirement Plan
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-[#F4F6F8] p-3">
                    <p className="text-[11px] text-slate-500">Balance</p>
                    <p className="text-[16px] font-bold text-[#0F2C3D]">
                      {hidden ? "••••" : fmt(retirementGoal.currentAmount || 0)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#F4F6F8] p-3">
                    <p className="text-[11px] text-slate-500">Yearly Interest</p>
                    <p className="text-[16px] font-bold text-[#0AB68B]">
                      {hidden ? "••••" : fmt((retirementGoal.currentAmount || 0) * RETIREMENT_RATE)}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">Penalty: {(RETIREMENT_PENALTY * 100).toFixed(1)}% for early withdrawal</p>
                <input type="number" inputMode="numeric" placeholder="Withdrawal amount"
                  value={retireWithdrawAmount} onChange={(e) => setRetireWithdrawAmount(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] focus:border-[#0AB68B] focus:outline-none" />
                <select value={retireClaimReason} onChange={(e) => setRetireClaimReason(e.target.value as any)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] focus:border-[#0AB68B] focus:outline-none">
                  <option value="early">Early withdrawal</option>
                  <option value="retirement_age">Retirement age</option>
                  <option value="incapacitation">Permanent incapacitation</option>
                </select>
                {retireClaimReason === "incapacitation" && (
                  <label className="flex items-center gap-2 text-[12px] text-slate-600">
                    <input type="checkbox" checked={retireMedicalCertified} onChange={(e) => setRetireMedicalCertified(e.target.checked)} className="h-4 w-4 accent-[#0AB68B]" />
                    Medical certificate verified
                  </label>
                )}
                {retireNotice && (
                  <p className={`text-[12px] ${retireNotice.includes("success") ? "text-[#0AB68B]" : "text-red-500"}`}>{retireNotice}</p>
                )}
                <button type="button" onClick={() => setPinGate({ type: "retire_withdraw" })}
                  className="h-12 w-full rounded-2xl bg-red-500 text-[14px] font-bold text-white transition active:scale-[0.98]">
                  Withdraw from Retirement
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Safe Lock CTA */}
        <Link href="/savings/safe-lock"
          className="mt-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EBF0FB]">
              <Lock className="h-5 w-5 text-[#2D65E0]" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#0F2C3D]">SafeLock</p>
              <p className="text-[11px] text-slate-500">Lock savings for higher yield</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </Link>
      </div>

      {/* PIN Modal */}
      <PinModal
        open={pinGate !== null}
        title={
          pinGate?.type === "add" ? "Confirm Deposit" :
          pinGate?.type === "withdraw" ? "Confirm Withdrawal" :
          pinGate?.type === "retire_create" ? "Create Retirement Plan" :
          "Confirm Withdrawal"
        }
        subtitle="Enter your PIN to authorize this action"
        onSuccess={() => {
          const gate = pinGate;
          setPinGate(null);
          if (!gate) return;
          if (gate.type === "add") {
            const amt = Number(addAmounts[gate.idx] || 0);
            if (amt > 0) handleAdd(gate.idx, amt);
          } else if (gate.type === "withdraw") {
            const amt = Number(wdAmounts[gate.idx] || 0);
            if (amt > 0) handleWithdraw(gate.idx, amt);
          } else if (gate.type === "retire_create") {
            handleCreateRetirementPlan();
          } else if (gate.type === "retire_withdraw") {
            handleRetirementWithdraw();
          }
        }}
        onCancel={() => setPinGate(null)}
      />
    </div>
  );
}
