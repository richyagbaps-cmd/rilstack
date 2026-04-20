"use client";
import { useState } from "react";

import { useEffect } from "react";

const initialBudget = {
  name: "",
  start: "",
  end: "",
  total: 0,
  spent: 0,
  mode: "strict",
  window: "monthly",
  categories: [],
};

const FEE = 0.035;

function getWindowInfo(category: any, budget: any) {
  // For demo: divide allocated by 4 for weekly
  if (budget.mode !== "strict")
    return { available: category.allocated - category.spent, next: null };
  const weeks = 4;
  const perWindow = Math.floor(category.allocated / weeks);
  const now = new Date();
  const start = new Date(budget.start);
  const weekIdx = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7),
  );
  const available = Math.max(0, perWindow - (category.spent % perWindow));
  const next =
    weekIdx < weeks - 1
      ? Math.ceil(
          (start.getTime() +
            (weekIdx + 1) * 7 * 24 * 60 * 60 * 1000 -
            now.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;
  return { available, next };
}

export default function BudgetDashboard() {
  const [budget, setBudget] = useState<any>(initialBudget);
  const [cats, setCats] = useState<any[]>([]);
  const [showWithdraw, setShowWithdraw] = useState<number | null>(null);
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [warning, setWarning] = useState("");
  const [nudge, setNudge] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch latest budget for user (replace with real userId)
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    fetch(`/api/budget?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length) {
          const b = data[0];
          setBudget({
            name: b.name || "Budget",
            start: b.startDate?.slice(0, 10),
            end: b.endDate?.slice(0, 10),
            total: b.totalIncome,
            spent: b.totalSpent,
            mode: b.type,
            window: b.categories?.[0]?.spending_window || "monthly",
            categories: b.categories || [],
          });
          setCats(
            (b.categories || []).map((cat: any, i: number) => ({
              key: cat.name.toLowerCase(),
              name: cat.name,
              allocated: cat.allocated_amount,
              spent: cat.spent_amount,
            })),
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const totalRemaining = budget.total - budget.spent;

  const handleWithdraw = async (idx: number) => {
    const cat = cats[idx];
    let amt = Number(withdrawAmt);
    if (!amt || amt <= 0) return;
    if (budget.mode === "strict") {
      const { available } = getWindowInfo(cat, budget);
      if (amt > available) return;
    } else {
      if (amt > cat.allocated - cat.spent) {
        const excess = amt - (cat.allocated - cat.spent);
        setWarning(
          `You will pay a 3.5% fee on the excess amount of ₦${excess.toLocaleString()}`,
        );
      } else {
        setWarning("");
      }
    }
    // Call backend to record transaction
    try {
      const userId = localStorage.getItem("user_id");
      const res = await fetch("/api/budget/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          category: cat.key,
          amount: amt,
        }),
      });
      if (!res.ok) throw new Error("Failed to withdraw");
      // Update UI
      const updated = [...cats];
      updated[idx].spent += amt;
      setCats(updated);
      setShowWithdraw(null);
      setWithdrawAmt("");
      setWarning("");
      // AI nudges
      if (
        cat.key === "groceries" &&
        updated[idx].spent < updated[idx].allocated * 0.5
      ) {
        setNudge(
          `You’ve underspent on Groceries – consider moving ₦${(updated[idx].allocated - updated[idx].spent).toLocaleString()} to Savings.`,
        );
      } else if (
        cat.key === "dining" &&
        updated[idx].spent > updated[idx].allocated * 0.8
      ) {
        setNudge(`Your Dining Out budget is 80% used with 10 days left.`);
      } else {
        setNudge(null);
      }
    } catch (err) {
      setWarning("Failed to withdraw");
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-xl">Loading budget...</div>;
  }
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-xl font-bold">{budget.name}</div>
          <div className="text-gray-600 text-sm">
            {budget.start} – {budget.end}
          </div>
        </div>
        <div className="text-right">
          <div>
            Total Budget: <span className="font-bold">₦{budget.total.toLocaleString()}</span>
          </div>
          <div>
            Total Spent: <span className="font-bold text-red-600">₦{budget.spent.toLocaleString()}</span>
          </div>
          <div>
            Total Remaining: <span className="font-bold text-green-600">₦{totalRemaining.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <h3 className="text-lg font-bold mb-2">Spending Pockets</h3>
      <div className="space-y-6">
        {cats.map((cat, idx) => {
          const spent = cat.spent;
          const remaining = cat.allocated - spent;
          const percent = Math.min(100, Math.round((spent / cat.allocated) * 100));
          const { available, next } = getWindowInfo(cat, budget);
          return (
            <div key={cat.key} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-1">
                <div className="font-bold">{cat.name}</div>
                <div className="text-sm text-gray-600">Allocated: ₦{cat.allocated.toLocaleString()}</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: percent + "%" }} />
              </div>
              <div className="flex justify-between items-center mb-2">
                <div>
                  Spent: <span className="font-bold text-red-600">₦{spent.toLocaleString()}</span>
                </div>
                <div>
                  Remaining: <span className="font-bold text-green-600">₦{remaining.toLocaleString()}</span>
                </div>
              </div>
              {budget.mode === "strict" && (
                <div className="mb-2 text-blue-700">
                  Available this {budget.window}: ₦{available.toLocaleString()} {next !== null && (
                    <span className="ml-2 text-xs">Next window opens in {next} days</span>
                  )}
                </div>
              )}
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
                onClick={() => setShowWithdraw(idx)}
                disabled={budget.mode === "strict" && available <= 0}
              >
                Withdraw
              </button>
              {showWithdraw === idx && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="number"
                    className="border p-2 rounded w-32"
                    placeholder="Amount"
                    min={1}
                    value={withdrawAmt}
                    onChange={(e) => setWithdrawAmt(e.target.value)}
                  />
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={() => handleWithdraw(idx)}
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
              {warning && showWithdraw === idx && (
                <div className="text-yellow-700 mt-2">{warning}</div>
              )}
            </div>
          );
        })}
      </div>
      {nudge && (
        <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 font-semibold rounded">{nudge}</div>
      )}
    </div>
  );
}
