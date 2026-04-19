"use client";
import { useState } from "react";

const badges = [
  {
    key: "safeLockMaster",
    name: "Safe Lock Master",
    desc: "Create 5 Safe Locks",
    progress: 3,
    total: 5,
  },
  {
    key: "firstInvestment",
    name: "First Investment",
    desc: "Make your first investment",
    progress: 1,
    total: 1,
  },
  {
    key: "budgetHero",
    name: "Budget Hero",
    desc: "Stick to budget for 3 months",
    progress: 2,
    total: 3,
  },
];

export default function AchievementsTab() {
  const [unlocked, setUnlocked] = useState(["firstInvestment"]);
  const [confetti, setConfetti] = useState(false);

  const unlockBadge = (key: string) => {
    if (!unlocked.includes(key)) {
      setUnlocked([...unlocked, key]);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1500);
    }
  };

  return (
    <div className="p-4">
      <h3 className="font-bold text-lg mb-2">Achievements</h3>
      <div className="grid grid-cols-1 gap-4">
        {badges.map((b) => (
          <div
            key={b.key}
            className={`rounded-lg p-4 border flex items-center gap-4 ${unlocked.includes(b.key) ? "bg-green-50 border-green-400" : "bg-gray-50"}`}
          >
            <div className="flex-1">
              <div className="font-semibold">{b.name}</div>
              <div className="text-xs text-gray-500">{b.desc}</div>
              <div className="mt-1 text-xs">
                Progress: {Math.min(b.progress, b.total)}/{b.total}
              </div>
            </div>
            {unlocked.includes(b.key) ? (
              <span className="text-green-600 font-bold">Unlocked</span>
            ) : (
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                onClick={() => unlockBadge(b.key)}
              >
                Simulate Unlock
              </button>
            )}
          </div>
        ))}
      </div>
      {confetti && <Confetti />}
    </div>
  );
}

function Confetti() {
  // Simple confetti dots
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="animate-bounce text-5xl">🎉</div>
    </div>
  );
}
