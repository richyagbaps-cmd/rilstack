"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { DEMO_EMAIL, DEMO_SAVINGS_GOALS } from "@/lib/demo-data";

const DAILY_INTEREST = 0.03; // 3% daily
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

export default function SavingsDashboard() {
  const { data: session } = useSession();
  const [goals, setGoals] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [showAdd, setShowAdd] = useState<number | null>(null);
  const [showWithdraw, setShowWithdraw] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [retireInitial, setRetireInitial] = useState("");
  const [retireTarget, setRetireTarget] = useState("");
  const [retireDueDate, setRetireDueDate] = useState("");
  const [retirePayoutPreference, setRetirePayoutPreference] = useState<"wallet" | "compound">("compound");
  const [retireWithdrawAmount, setRetireWithdrawAmount] = useState("");
  const [retireClaimReason, setRetireClaimReason] = useState<"early" | "retirement_age" | "incapacitation">("early");
  const [retireMedicalCertified, setRetireMedicalCertified] = useState(false);
  const [retireNotice, setRetireNotice] = useState("");

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

  // Calculate total saved and interest
  const totalSaved = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const days = daysSince(lastUpdate || new Date().toISOString().slice(0, 10));
  const interest = getInterest(totalSaved, days);

  const handleAdd = async (idx: number, amt: number) => {
    const goal = goals[idx];
    try {
      const res = await fetch(`/api/savings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deposit",
          rowId: goal.rowId,
          goalId: goal.id,
          userId,
          amount: amt,
        }),
      });
      if (!res.ok) throw new Error("Failed to add money");
      await refreshGoals();
    } catch (err) {
      alert("Failed to add money");
    }
    setShowAdd(null);
  };
  const handleWithdraw = async (idx: number, amt: number) => {
    const goal = goals[idx];
    // Check safe lock
    const locked = goal.safeLocks?.some((l: any) => new Date(l.unlockDate) > new Date());
    if (locked) return alert("Funds are locked and cannot be withdrawn.");
    if (amt > (goal.currentAmount || 0)) return alert("Insufficient funds.");
    try {
      const res = await fetch(`/api/savings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "withdraw",
          rowId: goal.rowId,
          goalId: goal.id,
          userId,
          amount: amt,
        }),
      });
      if (!res.ok) throw new Error("Failed to withdraw");
      await refreshGoals();
    } catch (err) {
      alert("Failed to withdraw");
    }
    setShowWithdraw(null);
  };

  const retirementGoal = goals.find((goal) => goal.type === "retirement");
  const minRetirementDueDate = addYearsToDateInput(new Date(), MIN_RETIREMENT_DURATION_YEARS);
  const maxRetirementDueDate = addYearsToDateInput(new Date(), MAX_RETIREMENT_DURATION_YEARS);

  const handleCreateRetirementPlan = async () => {
    if (!userId) return alert("User not logged in");
    setRetireNotice("");

    if (!retireDueDate) {
      setRetireNotice(
        `Please select a maturity date between ${MIN_RETIREMENT_DURATION_YEARS} and ${MAX_RETIREMENT_DURATION_YEARS} years from today.`,
      );
      return;
    }

    if (retireDueDate < minRetirementDueDate || retireDueDate > maxRetirementDueDate) {
      setRetireNotice(
        `Retirement plan duration must be between ${MIN_RETIREMENT_DURATION_YEARS} and ${MAX_RETIREMENT_DURATION_YEARS} years.`,
      );
      return;
    }

    const payload = {
      action: "create_retirement_plan",
      userId,
      amount: Number(retireInitial || 0),
      targetAmount: Number(retireTarget || 0),
      dueDate: retireDueDate || undefined,
      payoutPreference: retirePayoutPreference,
    };

    const res = await fetch("/api/savings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setRetireNotice(data.error || "Failed to create retirement plan.");
      return;
    }
    setRetireNotice("Retirement plan created successfully.");
    await refreshGoals();
  };

  const handleRetirementWithdraw = async () => {
    if (!userId || !retirementGoal?.rowId) return;
    setRetireNotice("");

    const res = await fetch("/api/savings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "retirement_withdraw",
        userId,
        rowId: retirementGoal.rowId,
        goalId: retirementGoal.id,
        name: retirementGoal.name,
        amount: Number(retireWithdrawAmount || 0),
        claimReason: retireClaimReason,
        medicalCertified: retireMedicalCertified,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setRetireNotice(data.error || "Retirement withdrawal failed.");
      return;
    }

    setRetireNotice(
      `Withdrawal successful. Net paid: ₦${Number(data.netAmount || 0).toLocaleString()}${
        Number(data.penalty || 0) > 0
          ? ` (Penalty: ₦${Number(data.penalty).toLocaleString()})`
          : ""
      }`,
    );
    await refreshGoals();
  };

  if (loading) {
    return <div className="text-center mt-20 text-xl">Loading savings goals...</div>;
  }
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Savings Dashboard</h2>
      <div className="flex justify-between mb-6">
        <div>
          <div className="text-gray-700">Total Saved</div>
          <div className="text-2xl font-bold">
            ₦{totalSaved.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-gray-700">Interest Accrued</div>
          <div className="text-2xl font-bold text-green-600">
            ₦{interest.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-[#d7e3ff] bg-[#f6f9ff] p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#1d3766]">Retirement Plan</h3>
          <span className="rounded-full bg-[#1d3766] px-3 py-1 text-xs font-semibold text-white">
            18% p.a. fixed
          </span>
        </div>
        <p className="mb-3 text-sm text-slate-700">
          Lock funds for long-term growth. One free withdrawal per calendar quarter, otherwise 7.5% early withdrawal penalty applies before retirement age or approved permanent incapacity.
        </p>
        <p className="mb-3 text-sm font-medium text-[#1d3766]">
          Duration: minimum {MIN_RETIREMENT_DURATION_YEARS} years, maximum {MAX_RETIREMENT_DURATION_YEARS} years.
        </p>

        {!retirementGoal ? (
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="number"
              min={0}
              className="rounded border p-2"
              placeholder="Initial amount (optional)"
              value={retireInitial}
              onChange={(e) => setRetireInitial(e.target.value)}
            />
            <input
              type="number"
              min={0}
              className="rounded border p-2"
              placeholder="Target amount (optional)"
              value={retireTarget}
              onChange={(e) => setRetireTarget(e.target.value)}
            />
            <input
              type="date"
              className="rounded border p-2"
              value={retireDueDate}
              min={minRetirementDueDate}
              max={maxRetirementDueDate}
              onChange={(e) => setRetireDueDate(e.target.value)}
            />
            <select
              className="rounded border p-2"
              value={retirePayoutPreference}
              onChange={(e) =>
                setRetirePayoutPreference(
                  e.target.value === "wallet" ? "wallet" : "compound",
                )
              }
            >
              <option value="compound">Reinvest to compound</option>
              <option value="wallet">Pay interest to wallet</option>
            </select>
            <button
              className="rounded bg-[#1d3766] px-4 py-2 font-semibold text-white md:col-span-2"
              onClick={handleCreateRetirementPlan}
            >
              Create Retirement Plan
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded bg-white p-3">
                <div className="text-xs text-slate-500">Current Balance</div>
                <div className="text-lg font-bold text-slate-800">
                  ₦{Number(retirementGoal.currentAmount || 0).toLocaleString()}
                </div>
              </div>
              <div className="rounded bg-white p-3">
                <div className="text-xs text-slate-500">Projected Yearly Interest</div>
                <div className="text-lg font-bold text-emerald-700">
                  ₦{Number((retirementGoal.currentAmount || 0) * RETIREMENT_RATE).toLocaleString()}
                </div>
              </div>
              <div className="rounded bg-white p-3">
                <div className="text-xs text-slate-500">Penalty Rate</div>
                <div className="text-lg font-bold text-rose-700">
                  {(RETIREMENT_PENALTY * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-4">
              <input
                type="number"
                min={1}
                className="rounded border p-2"
                placeholder="Withdraw amount"
                value={retireWithdrawAmount}
                onChange={(e) => setRetireWithdrawAmount(e.target.value)}
              />
              <select
                className="rounded border p-2"
                value={retireClaimReason}
                onChange={(e) =>
                  setRetireClaimReason(
                    e.target.value === "retirement_age" ||
                      e.target.value === "incapacitation"
                      ? e.target.value
                      : "early",
                  )
                }
              >
                <option value="early">Early access</option>
                <option value="retirement_age">Reached retirement age</option>
                <option value="incapacitation">Inability to work</option>
              </select>
              <label className="flex items-center gap-2 rounded border bg-white px-3 text-sm">
                <input
                  type="checkbox"
                  checked={retireMedicalCertified}
                  onChange={(e) => setRetireMedicalCertified(e.target.checked)}
                  disabled={retireClaimReason !== "incapacitation"}
                />
                Medical certification
              </label>
              <button
                className="rounded bg-[#1d3766] px-4 py-2 font-semibold text-white"
                onClick={handleRetirementWithdraw}
              >
                Withdraw
              </button>
            </div>
          </div>
        )}

        {retireNotice && (
          <div className="mt-3 rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            {retireNotice}
          </div>
        )}
      </div>

      <div className="space-y-8">
        {goals.map((g, idx) => {
          const percent = Math.min(
            100,
            Math.round(((g.currentAmount || 0) / (g.targetAmount || 1)) * 100),
          );
          const locked = g.safeLocks?.some(
            (l: any) => new Date(l.unlockDate) > new Date(),
          );
          const unlockDate = locked
            ? g.safeLocks.find((l: any) => new Date(l.unlockDate) > new Date())
                ?.unlockDate
            : null;
          return (
            <div key={g.name} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold text-lg">{g.name}</div>
                <div className="text-sm text-gray-600">
                  Target: ₦{Number(g.targetAmount || 0).toLocaleString()}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: percent + "%" }}
                />
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-gray-700">
                  Saved: ₦{Number(g.currentAmount || 0).toLocaleString()}
                </div>
                <div className="text-gray-700">{percent}%</div>
              </div>
              {locked && (
                <div className="text-yellow-700 font-semibold mb-2">
                  Locked until {unlockDate} – cannot withdraw
                </div>
              )}
              <div className="flex gap-2">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded"
                  onClick={() => setShowAdd(idx)}
                >
                  Add Money
                </button>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={() => setShowWithdraw(idx)}
                  disabled={locked}
                >
                  Withdraw
                </button>
              </div>
              {showAdd === idx && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="number"
                    className="border p-2 rounded w-32"
                    placeholder="Amount"
                    min={1}
                    onKeyDown={(e) => e.stopPropagation()}
                    id={`add-amt-${idx}`}
                  />
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={() => {
                      const amt = Number(
                        (
                          document.getElementById(
                            `add-amt-${idx}`,
                          ) as HTMLInputElement
                        )?.value || 0,
                      );
                      if (amt > 0) handleAdd(idx, amt);
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    className="bg-gray-300 px-3 py-1 rounded"
                    onClick={() => setShowAdd(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
              {showWithdraw === idx && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="number"
                    className="border p-2 rounded w-32"
                    placeholder="Amount"
                    min={1}
                    onKeyDown={(e) => e.stopPropagation()}
                    id={`wd-amt-${idx}`}
                  />
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => {
                      const amt = Number(
                        (
                          document.getElementById(
                            `wd-amt-${idx}`,
                          ) as HTMLInputElement
                        )?.value || 0,
                      );
                      if (amt > 0) handleWithdraw(idx, amt);
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    className="bg-gray-300 px-3 py-1 rounded"
                    onClick={() => setShowWithdraw(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-8 text-xs text-gray-500">
        Interest compounds daily and is added to your total savings balance.
      </div>
    </div>
  );
}
