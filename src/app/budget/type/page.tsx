"use client";
import { useState } from "react";

const types = [
  {
    key: "502030",
    title: "50/30/20",
    desc: "Needs 50%, Wants 30%, Savings 20% (recommended for most)",
    color: "#3e8eff",
  },
  {
    key: "zero",
    title: "Zero-based",
    desc: "Every naira assigned, total income minus expenses equals zero.",
    color: "#ffb347",
  },
  {
    key: "custom",
    title: "Custom",
    desc: "Define your own percentages for each category.",
    color: "#4cd964",
  },
];

export default function BudgetTypeSelector({
  onSelect,
}: {
  onSelect?: (type: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (key: string) => {
    setSelected(key);
    if (onSelect) onSelect(key);
    else localStorage.setItem("budget_type", key);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600 p-4">
      <h2 className="text-2xl font-bold mb-8 text-white">
        Choose your budgeting method
      </h2>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl justify-center">
        {types.map((opt) => (
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
                {opt.key === "502030" ? "📊" : opt.key === "zero" ? "🧮" : "⚙️"}
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
          You selected: {types.find((o) => o.key === selected)?.title}
        </div>
      )}
    </div>
  );
}
