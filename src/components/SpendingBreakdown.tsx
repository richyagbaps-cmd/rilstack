import React from "react";

interface SpendingBreakdownProps {
  essentials: number;
  flexible: number;
  goals: number;
}

export default function SpendingBreakdown({
  essentials,
  flexible,
  goals,
}: SpendingBreakdownProps) {
  const total = essentials + flexible + goals;
  const essentialsPct = ((essentials / total) * 100).toFixed(0);
  const flexiblePct = ((flexible / total) * 100).toFixed(0);
  const goalsPct = ((goals / total) * 100).toFixed(0);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md w-full max-w-md mx-auto mt-8">
      <h3 className="text-lg font-bold mb-4 text-slate-900">
        Spending Breakdown
      </h3>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-rose-400 h-4"
              style={{ width: `${essentialsPct}%` }}
            />
            <div
              className="bg-amber-400 h-4"
              style={{ width: `${flexiblePct}%` }}
            />
            <div
              className="bg-emerald-400 h-4"
              style={{ width: `${goalsPct}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 text-xs text-slate-700">
          <span>
            <span className="inline-block w-3 h-3 bg-rose-400 rounded-full mr-1" />
            Essentials: {essentialsPct}%
          </span>
          <span>
            <span className="inline-block w-3 h-3 bg-amber-400 rounded-full mr-1" />
            Flexible: {flexiblePct}%
          </span>
          <span>
            <span className="inline-block w-3 h-3 bg-emerald-400 rounded-full mr-1" />
            Goals: {goalsPct}%
          </span>
        </div>
      </div>
      <div className="flex justify-between text-sm font-medium text-slate-800">
        <span>Essentials</span>
        <span>Flexible</span>
        <span>Goals</span>
      </div>
      <div className="flex justify-between text-lg font-bold mt-1">
        <span>{essentials}</span>
        <span>{flexible}</span>
        <span>{goals}</span>
      </div>
    </div>
  );
}
