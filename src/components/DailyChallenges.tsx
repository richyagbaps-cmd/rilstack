"use client";
import { useState } from "react";

const demoChallenges = [
  { id: 1, text: "Review your spending", reward: 100, done: false },
  { id: 2, text: "Save an extra ₦500", reward: 100, done: false },
];

export default function DailyChallenges() {
  const [challenges, setChallenges] = useState(demoChallenges);
  const [bonus, setBonus] = useState(0);

  const completeChallenge = (id: number) => {
    setChallenges(
      challenges.map((c) => (c.id === id ? { ...c, done: true } : c)),
    );
    setBonus(bonus + 100);
  };

  return (
    <div className="bg-yellow-50 rounded-lg p-4 mt-4">
      <h3 className="font-bold mb-2">Daily Challenges</h3>
      <ul className="space-y-2">
        {challenges.map((c) => (
          <li key={c.id} className="flex items-center gap-2">
            <span className={c.done ? "line-through text-gray-400" : ""}>
              {c.text}
            </span>
            <span className="text-green-700 text-xs">+₦{c.reward}</span>
            {!c.done && (
              <button
                className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                onClick={() => completeChallenge(c.id)}
              >
                Complete
              </button>
            )}
            {c.done && <span className="text-green-600 text-xs">Done!</span>}
          </li>
        ))}
      </ul>
      {bonus > 0 && (
        <div className="mt-2 text-green-700 font-bold">
          +₦{bonus} bonus added to savings!
        </div>
      )}
    </div>
  );
}
