import React, { useState, useEffect } from "react";

interface StrictUnlockStepProps {
  pockets: {
    name: string;
    amount: number;
    frequency: "daily" | "weekly" | "monthly";
  }[];
  startDate: Date;
  onChange: (
    unlocks: {
      name: string;
      unlockType: "daily" | "weekly" | "monthly" | "date";
      unlockDate?: string;
    }[],
  ) => void;
}

const UNLOCK_TYPES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "date", label: "Specific Date (Safe Lock)" },
];

export default function StrictUnlockStep({
  pockets,
  startDate,
  onChange,
}: StrictUnlockStepProps) {
  const [unlocks, setUnlocks] = useState(
    pockets.map((p) => ({
      name: p.name,
      unlockType: "date" as const,
      unlockDate: "",
    })),
  );

  useEffect(() => {
    onChange(unlocks);
  }, [unlocks]);

  const minUnlockDate = new Date(
    startDate.getTime() + 10 * 24 * 60 * 60 * 1000,
  );
  const minDateStr = minUnlockDate.toISOString().slice(0, 16);

  return (
    <div className="w-full max-w-2xl mx-auto mt-4">
      <div className="mb-4 text-lg font-semibold text-[#2c3e5f]">
        Strict Mode: Set Unlock Schedule
      </div>
      <div className="flex flex-col gap-4">
        {pockets.map((p, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 bg-[#f3f4fa] rounded-lg px-4 py-2"
          >
            <span className="font-semibold w-32">{p.name}</span>
            <span className="w-24">₦{p.amount.toLocaleString()}</span>
            <select
              className="px-2 py-1 rounded border border-[#d1d5db]"
              value={unlocks[idx].unlockType}
              onChange={(e) =>
                setUnlocks((us) =>
                  us.map((u, i) =>
                    i === idx ? { ...u, unlockType: e.target.value as any } : u,
                  ),
                )
              }
            >
              {UNLOCK_TYPES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            {unlocks[idx].unlockType === "date" && (
              <input
                type="datetime-local"
                className="px-2 py-1 rounded border border-[#d1d5db]"
                min={minDateStr}
                value={unlocks[idx].unlockDate || minDateStr}
                onChange={(e) =>
                  setUnlocks((us) =>
                    us.map((u, i) =>
                      i === idx ? { ...u, unlockDate: e.target.value } : u,
                    ),
                  )
                }
              />
            )}
            {unlocks[idx].unlockType === "date" && (
              <span className="text-xs text-[#2c3e5f]">
                (≥10 days from start)
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
