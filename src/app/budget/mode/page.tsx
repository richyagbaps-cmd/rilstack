"use client";
import { useState } from "react";

const options = [
  {
    key: "strict",
    title: "Strict Budgeting",
    desc: "Mandatory safe lock program – you cannot withdraw from a category before its spending window.",
    color: "#4cd964",
  },
  {
    key: "relaxed",
    title: "Relaxed Budgeting",
    desc: "No safe locks, but any amount removed beyond the budget for a category incurs a 3.5% fee on the excess amount.",
    color: "#ffb347",
  },
];

export default function BudgetingMode({
  onSelect,
}: {
  onSelect?: (mode: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (key: string) => {
    setSelected(key);
    // Store choice (localStorage or backend)
    if (onSelect) onSelect(key);
    else localStorage.setItem("budgeting_mode", key);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600 p-4">
      <h2 className="text-2xl font-bold mb-8 text-white">
        Do you want a strict or relaxed budgeting experience?
      </h2>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl justify-center">
        {options.map((opt) => (
          <button
            key={opt.key}
            className={`flex-1 bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 transition border-4 ${selected === opt.key ? "ring-4 ring-blue-400" : ""}`}
            style={{ borderColor: opt.color, minWidth: 260 }}
            onClick={() => handleSelect(opt.key)}
            disabled={!!selected}
          >
            <div className="mb-4">
              <span
                className="inline-block"
                style={{ fontSize: 40, color: opt.color }}
              >
                {opt.key === "strict" ? "🔒" : "💸"}
              </span>
            </div>
            <div
              className="text-xl font-bold mb-2"
              style={{ color: opt.color }}
            >
              {opt.title}
            </div>
            <div className="text-gray-700 text-center">{opt.desc}</div>
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-8 text-green-600 font-bold">
          You selected: {options.find((o) => o.key === selected)?.title}
        </div>
      )}
    </div>
  );
}
