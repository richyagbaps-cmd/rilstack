"use client";
import { useState } from "react";

const options = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

export default function SpendingWindow({
  onComplete,
}: {
  onComplete?: (window: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (key: string) => {
    setSelected(key);
    if (onComplete) onComplete(key);
    else localStorage.setItem("spending_window", key);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600 p-4">
      <h2 className="text-2xl font-bold mb-6 text-white">
        How should money in each category be opened for spending?
      </h2>
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-xl w-full mb-4">
        <div className="mb-4 text-gray-700">
          The category’s total budget is divided into equal portions for each
          window. Only the current window’s portion is available for withdrawal.
          No access to future portions.
        </div>
        <div className="flex gap-6 justify-center">
          {options.map((opt) => (
            <button
              key={opt.key}
              className={`px-8 py-4 rounded-xl border-2 font-bold text-lg transition ${selected === opt.key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-700 border-blue-400"}`}
              onClick={() => handleSelect(opt.key)}
              disabled={!!selected}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {selected && (
          <div className="mt-6 text-green-600 font-bold text-center">
            You selected: {options.find((o) => o.key === selected)?.label}
          </div>
        )}
      </div>
    </div>
  );
}
