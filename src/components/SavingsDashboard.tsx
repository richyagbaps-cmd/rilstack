import React, { useState, useEffect } from "react";
import CreateGoalModal from "./CreateGoalModal";
import CreateSafeLockModal from "./CreateSafeLockModal";
import AutoInvestModal from "./AutoInvestModal";
import { insertSafeLock, updateSafeLock } from "@/lib/supabaseAdminMutations";

interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string;
  team?: string[];
  fundingSource: "budget" | "deposit" | "auto-transfer";
  projectedCompletion: string;
}

interface SafeLock {
  id: string;
  amount: number;
  releaseDate: string;
  createdAt: string;
}

const AI_GOAL_SUGGESTIONS = [
  "Emergency fund (6 months of expenses)",
  "Vacation to Dubai",
  "New laptop",
  "Children’s education",
  "Custom goal",
];

function getInterestToday(balance: number, rate = 0.08) {
  // 8% p.a. compounded daily
  const dailyRate = Math.pow(1 + rate, 1 / 365) - 1;
  return Math.floor(balance * dailyRate);
}

export default function SavingsDashboard() {
  const [balance, setBalance] = useState(250000);
  const [interestToday, setInterestToday] = useState(0);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [safeLocks, setSafeLocks] = useState<SafeLock[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showAutoInvest, setShowAutoInvest] = useState<string | null>(null);
  const [autoInvestRules, setAutoInvestRules] = useState<any[]>([]);

  useEffect(() => {
    setInterestToday(getInterestToday(balance));
    const interval = setInterval(
      () => setInterestToday(getInterestToday(balance)),
      5000,
    );
    return () => clearInterval(interval);
  }, [balance]);

  // Goal and Safe Lock creation logic
  const handleCreateGoal = async (goal: any) => {
    // POST to backend
    const res = await fetch("/api/savings-goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goal),
    });
    const data = await res.json();
    setGoals((goals) => [
      {
        id: data.id || Math.random().toString(36).slice(2),
        name: goal.name,
        target: goal.target,
        saved: 0,
        deadline: goal.deadline,
        team: goal.team,
        fundingSource: goal.fundingSource,
        projectedCompletion: goal.deadline, // Placeholder
      },
      ...goals,
    ]);
  };
  const handleCreateLock = async (lock: any) => {
    try {
      const [inserted] = await insertSafeLock({
        amount: lock.amount,
        releaseDate: lock.releaseDate,
        createdAt: new Date().toISOString(),
        status: "locked",
      });
      setSafeLocks((locks) => [inserted, ...locks]);
      setBalance((bal) => bal - lock.amount);
    } catch (err) {
      alert("Failed to create safe lock. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center mb-8">
        <div className="text-xs uppercase tracking-widest text-[#4A5B6E] mb-2">
          Total Savings Balance
        </div>
        <div className="text-4xl font-extrabold text-[#2c3e5f] mb-2">
          ₦{balance.toLocaleString()}
        </div>
        <div className="flex items-center gap-2 text-[#00e096] font-semibold animate-pulse">
          +₦{interestToday.toLocaleString()} today
          <button
            className="ml-2 text-xs underline"
            title="View interest chart"
          >
            View chart
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Savings Goals Section */}
        <div className="bg-[#f8f9fc] rounded-2xl p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-bold text-[#2c3e5f]">
              Savings Goals
            </div>
            <button
              className="bg-[#00e096] text-white px-3 py-1 rounded"
              onClick={() => setShowGoalModal(true)}
            >
              Create savings goal
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {goals.length === 0 && (
              <div className="text-[#4A5B6E]">No goals yet.</div>
            )}
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white rounded-lg p-4 shadow flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-[#2c3e5f]">
                    {goal.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-[#4A5B6E]">
                      Target: ₦{goal.target.toLocaleString()}
                    </div>
                    <button
                      className="ml-2 text-xs underline text-[#00e096]"
                      onClick={() => setShowAutoInvest(goal.id)}
                    >
                      Auto-invest
                    </button>
                  </div>
                </div>
                <div className="w-full bg-[#e6f7e6] rounded-full h-3 mt-1 mb-1">
                  <div
                    className="bg-[#00e096] h-3 rounded-full"
                    style={{
                      width: `${Math.min(100, (goal.saved / goal.target) * 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Saved: ₦{goal.saved.toLocaleString()}</span>
                  <span>Deadline: {goal.deadline}</span>
                  <span>Projected: {goal.projectedCompletion}</span>
                </div>
                {goal.team && goal.team.length > 0 && (
                  <div className="text-xs text-[#2c3e5f] mt-1">
                    Team: {goal.team.join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Safe Locks Section */}
        <div className="bg-[#f8f9fc] rounded-2xl p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-bold text-[#2c3e5f]">Safe Locks</div>
            <button
              className="bg-[#2c3e5f] text-white px-3 py-1 rounded"
              onClick={() => setShowLockModal(true)}
            >
              Create safe lock
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {safeLocks.length === 0 && (
              <div className="text-[#4A5B6E]">No safe locks yet.</div>
            )}
            {safeLocks.map((lock, idx) => {
              const isUnlocked = new Date(lock.releaseDate) <= new Date();
              return (
                <div
                  key={lock.id}
                  className="bg-white rounded-lg p-4 shadow flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-[#2c3e5f]">
                      ₦{lock.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-[#4A5B6E]">
                      Unlocks: {lock.releaseDate}
                    </div>
                  </div>
                  <div className="text-xs text-[#00e096]">
                    Earning daily interest
                  </div>
                  {isUnlocked && lock.status !== "withdrawn" && (
                    <button
                      className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 w-fit"
                      onClick={async () => {
                        try {
                          await updateSafeLock(lock.id, { status: "withdrawn" });
                          setSafeLocks(
                            safeLocks.map((l, i) =>
                              i === idx ? { ...l, status: "withdrawn" } : l
                            )
                          );
                        } catch (err) {
                          alert("Failed to withdraw. Please try again.");
                        }
                      }}
                    >
                      Withdraw
                    </button>
                  )}
                  {lock.status === "withdrawn" && (
                    <span className="mt-2 text-green-700 font-semibold">Withdrawn</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Auto-Invest Modal */}
      <AutoInvestModal
        open={!!showAutoInvest}
        onClose={() => setShowAutoInvest(null)}
        onCreate={async (rule) => {
          // POST to backend (pseudo-code, adjust as needed)
          // await fetch("/api/auto-invest", { method: "POST", ... })
          setAutoInvestRules((rules) => [...rules, rule]);
        }}
        goalId={showAutoInvest || ""}
      />
      {/* Create Goal Modal */}
      <CreateGoalModal
        open={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onCreate={handleCreateGoal}
        aiSuggestions={AI_GOAL_SUGGESTIONS}
      />
      {/* Create Safe Lock Modal */}
      <CreateSafeLockModal
        open={showLockModal}
        onClose={() => setShowLockModal(false)}
        onCreate={handleCreateLock}
        minDate={(() => {
          const min = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
          return min.toISOString().slice(0, 16);
        })()}
      />
    </div>
  );
}
