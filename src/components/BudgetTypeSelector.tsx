import React, { useState } from "react";

interface BudgetTypeSelectorProps {
  onTypeSelect: (type: "502030" | "zero-based" | "custom") => void;
}

const BUDGET_TYPES = [
  {
    key: "502030",
    label: "50/30/20 Budget",
    icon: "📊",
    description: "AI assigns 50% to Needs, 30% to Wants, 20% to Savings. Simple, effective, and automated.",
    preview: [
      { label: "Needs", percent: 50, color: "bg-[#2c3e5f]" },
      { label: "Wants", percent: 30, color: "bg-[#FFD700]" },
      { label: "Savings", percent: 20, color: "bg-[#00e096]" },
    ],
  },
  {
    key: "zero-based",
    label: "Zero-Based Budget",
    icon: "🧮",
    description: "Every naira is assigned to a category. AI suggests splits based on your income and profile.",
    preview: [
      { label: "Essentials", percent: 40, color: "bg-[#2c3e5f]" },
      { label: "Flexible", percent: 35, color: "bg-[#FFD700]" },
      { label: "Goals", percent: 25, color: "bg-[#00e096]" },
    ],
  },
  {
    key: "custom",
    label: "Custom Budget",
    icon: "⚙️",
    description: "Manually assign percentages or fixed amounts to each category. Full control for advanced users.",
    preview: [
      { label: "Custom", percent: 100, color: "bg-[#4A5B6E]" },
    ],
  },
];

export default function BudgetTypeSelector({ onTypeSelect }: BudgetTypeSelectorProps) {
  const [selected, setSelected] = useState<"502030" | "zero-based" | "custom" | null>(null);

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center p-4 md:p-8">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="mb-4 text-3xl font-bold text-[#1E2A3A] md:text-5xl">Choose Your Budget Type</h1>
        <p className="text-base text-[#4A5B6E] md:text-lg">Pick a budgeting method that fits your lifestyle. You can change this later.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        {BUDGET_TYPES.map((type) => (
          <div
            key={type.key}
            onClick={() => { setSelected(type.key as any); onTypeSelect(type.key as any); }}
            className={`relative rounded-2xl cursor-pointer transition-all duration-300 p-6 bg-white shadow hover:shadow-xl border-2 ${selected === type.key ? 'border-[#2c3e5f]' : 'border-transparent'}`}
          >
            <div className="flex flex-col items-center mb-4">
              <span className="text-4xl mb-2">{type.icon}</span>
              <h2 className="text-xl font-bold text-[#2c3e5f] mb-2">{type.label}</h2>
              <p className="text-[#4A5B6E] text-sm mb-4">{type.description}</p>
              <div className="w-full flex gap-1 mb-2">
                {type.preview.map((p, i) => (
                  <div key={i} className={`h-4 rounded-full ${p.color}`} style={{ width: `${p.percent}%` }}></div>
                ))}
              </div>
              <div className="flex gap-2 text-xs">
                {type.preview.map((p, i) => (
                  <span key={i} className="font-semibold" style={{ color: p.color.replace('bg-', '').replace('[', '').replace(']', '') }}>{p.label} {p.percent}%</span>
                ))}
              </div>
            </div>
            <button
              className={`w-full mt-4 py-2 px-4 rounded-lg font-semibold transition-all ${selected === type.key ? 'bg-[#2c3e5f] text-white' : 'bg-[#f3f4fa] text-[#2c3e5f] hover:bg-[#eaf2fa]'}`}
              onClick={e => { e.stopPropagation(); setSelected(type.key as any); onTypeSelect(type.key as any); }}
            >
              {selected === type.key ? '✓ Selected' : 'Select'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
