"use client";
import { useState, useEffect } from "react";

const initialGoals: any[] = [];

const DAILY_INTEREST = 0.03; // 3% daily

function getInterest(saved: number, days: number) {
  return Math.round(saved * (Math.pow(1 + DAILY_INTEREST, days) - 1));
}

function daysSince(date: string) {
  const d = new Date(date);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export default function SavingsDashboard() {
  const [goals, setGoals] = useState<any[]>(initialGoals);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [showAdd, setShowAdd] = useState<number | null>(null);
  const [showWithdraw, setShowWithdraw] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch savings goals from backend
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    fetch(`/api/savings?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setGoals(data || []);
        setLastUpdate(data?.[0]?.lastInterestCalculationDate || "");
      })
      .finally(() => setLoading(false));
  }, []);

  // Calculate total saved and interest
  const totalSaved = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const days = daysSince(lastUpdate || new Date().toISOString().slice(0, 10));
  const interest = getInterest(totalSaved, days);

  const handleAdd = async (idx: number, amt: number) => {
    const goal = goals[idx];
    const userId = localStorage.getItem("user_id");
    try {
      const res = await fetch(`/api/savings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deposit",
          goalId: goal.id,
          userId,
          amount: amt,
        }),
      });
      if (!res.ok) throw new Error("Failed to add money");
      // Refresh goals
      const updated = await fetch(`/api/savings?userId=${userId}`).then((r) => r.json());
      setGoals(updated || []);
    } catch (err) {
      alert("Failed to add money");
    }
    setShowAdd(null);
  };
  const handleWithdraw = async (idx: number, amt: number) => {
    const goal = goals[idx];
    const userId = localStorage.getItem("user_id");
    // Check safe lock
    const locked = goal.safeLocks?.some((l: any) => new Date(l.unlockDate) > new Date());
    if (locked) return alert("Funds are locked and cannot be withdrawn.");
    if (amt > goal.saved) return alert("Insufficient funds.");
    try {
      const res = await fetch(`/api/savings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "withdraw",
          goalId: goal.id,
          userId,
          amount: amt,
        }),
      });
      if (!res.ok) throw new Error("Failed to withdraw");
      // Refresh goals
      const updated = await fetch(`/api/savings?userId=${userId}`).then((r) => r.json());
      setGoals(updated || []);
    } catch (err) {
      alert("Failed to withdraw");
    }
    setShowWithdraw(null);
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
      <div className="space-y-8">
        {goals.map((g, idx) => {
          const percent = Math.min(100, Math.round((g.saved / g.target) * 100));
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
                  Target: ₦{g.target.toLocaleString()}
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
                  Saved: ₦{g.saved.toLocaleString()}
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
