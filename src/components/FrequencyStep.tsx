import React, { useState, useEffect } from "react";

interface FrequencyStepProps {
  pockets: {
    name: string;
    amount: number;
    frequency: "daily" | "weekly" | "monthly";
  }[];
  onChange: (
    pockets: {
      name: string;
      amount: number;
      frequency: "daily" | "weekly" | "monthly";
    }[],
  ) => void;
}

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly (resets Monday)" },
  { value: "monthly", label: "Monthly (resets on start date)" },
];

export default function FrequencyStep({
  pockets,
  onChange,
}: FrequencyStepProps) {
  const [aiSuggest, setAiSuggest] = useState(false);
  const [localPockets, setLocalPockets] = useState(pockets);

  useEffect(() => {
    setLocalPockets(pockets);
  }, [pockets]);

  useEffect(() => {
    onChange(localPockets);
  }, [localPockets]);

  // Mock AI suggestion logic
  const aiAssignFrequencies = () => {
    setLocalPockets(
      pockets.map((p, i) => ({
        ...p,
        frequency: i % 3 === 0 ? "daily" : i % 3 === 1 ? "weekly" : "monthly",
      })),
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-4">
      <div className="mb-4 text-lg font-semibold text-[#2c3e5f]">
        Set Spending Frequency
      </div>
      <div className="flex items-center gap-3 mb-6">
        <input
          type="checkbox"
          id="ai-suggest"
          checked={aiSuggest}
          onChange={(e) => {
            setAiSuggest(e.target.checked);
            if (e.target.checked) aiAssignFrequencies();
          }}
        />
        <label
          htmlFor="ai-suggest"
          className="text-[#2c3e5f] font-medium cursor-pointer"
        >
          Let AI decide based on your past spending (mock)
        </label>
      </div>
      <div className="flex flex-col gap-4">
        {localPockets.map((p, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 bg-[#f3f4fa] rounded-lg px-4 py-2"
          >
            <span className="font-semibold w-32">{p.name}</span>
            <span className="w-24">₦{p.amount.toLocaleString()}</span>
            <select
              className="px-2 py-1 rounded border border-[#d1d5db]"
              value={p.frequency}
              disabled={aiSuggest}
              onChange={(e) =>
                setLocalPockets((lps) =>
                  lps.map((lp, i) =>
                    i === idx
                      ? { ...lp, frequency: e.target.value as any }
                      : lp,
                  ),
                )
              }
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
