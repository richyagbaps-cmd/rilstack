"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { suggestPocketFrequency } from "@/utils/ai-pocket-frequency";
import TermsCheckbox from "@/components/TermsCheckbox";
import PinConfirmModal from "@/components/PinConfirmModal";
import SavingsGoalsSelector from "@/components/SavingsGoalsSelector";

function calculateInterest(principal: number, days: number, rate = 0.0005) {
  // Example: 0.05% daily interest (rate = 0.0005)
  return Math.round(principal * Math.pow(1 + rate, days) - principal);
}

function daysBetween(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(
    0,
    Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function BudgetSummaryPage() {
  const router = useRouter();
  const params = useSearchParams();
  const type = params.get("type") || "custom";
  const needs = params.get("needs");
  const wants = params.get("wants");
  const savings = params.get("savings");
  const custom = params.get("custom");

  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [finishDate, setFinishDate] = useState<string>("");

  let allocations = null;
  if (type === "502030" || type === "zero-based") {
    allocations = [
      { label: "Needs", amount: needs },
      { label: "Wants", amount: wants },
      { label: "Savings", amount: savings },
    ];
  } else if (custom) {
    try {
      const parsed = JSON.parse(custom);
      allocations = Object.entries(parsed).map(([label, amount]) => ({
        label,
        amount,
      }));
    } catch {}
  }

  const savingsAmount = Number(
    type === "custom"
      ? allocations?.find((a) => a.label.toLowerCase().includes("savings"))
          ?.amount
      : savings,
  );
  const showInterest = !!savingsAmount && !!finishDate;
  const days = finishDate ? daysBetween(startDate, finishDate) : 0;
  const interest = showInterest ? calculateInterest(savingsAmount, days) : 0;

  // Add frequency state for each pocket
  const [frequencies, setFrequencies] = useState<{ [label: string]: string }>(
    {},
  );

  // Helper to get/set frequency
  const getFrequency = (label: string, amount: number) => {
    return frequencies[label] || suggestPocketFrequency(label, Number(amount));
  };
  const handleFrequencyChange = (label: string, value: string) => {
    setFrequencies((f) => ({ ...f, [label]: value }));
  };

  const [agreed, setAgreed] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [pinConfirmed, setPinConfirmed] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [demographics, setDemographics] = useState<any>({}); // You may want to pass real demographics here
  const [safeLock, setSafeLock] = useState(false);
  const [safeLockError, setSafeLockError] = useState("");

  // Helper to check if savings pocket exists
  const hasSavings =
    allocations &&
    allocations.some((a) => a.label.toLowerCase().includes("savings"));
  // Helper to check if safe lock is valid
  const safeLockValid =
    !safeLock || (finishDate && daysBetween(startDate, finishDate) >= 10);

  // Show goals selector if savings pocket exists and not yet selected
  useEffect(() => {
    if (
      allocations &&
      allocations.some((a) => a.label.toLowerCase().includes("savings")) &&
      selectedGoals.length === 0
    ) {
      setShowGoals(true);
    }
  }, [allocations, selectedGoals]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fc] p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6 text-[#2c3e5f]">
          Your Budget Allocation
        </h1>
        <ul className="w-full list-disc pl-6">
          {allocations &&
            allocations.map((a) => (
              <li key={a.label} className="mb-2 flex flex-col w-full">
                <div className="flex justify-between w-full">
                  <span>{a.label}</span>
                  <span>₦{Number(a.amount).toLocaleString()}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-[#4A5B6E]">Frequency:</span>
                  <select
                    value={getFrequency(
                      a.label,
                      typeof a.amount === "number"
                        ? a.amount
                        : Number(a.amount) || 0,
                    )}
                    onChange={(e) =>
                      handleFrequencyChange(a.label, e.target.value)
                    }
                    className="p-1 border rounded text-xs"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="ai">AI Suggest</option>
                  </select>
                  {frequencies[a.label] === undefined && (
                    <span className="text-green-600 text-xs">(AI)</span>
                  )}
                </div>
              </li>
            ))}
        </ul>
        <div className="w-full mt-6 flex flex-col gap-3">
          <label className="flex flex-col">
            Start Date
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 p-2 border rounded"
            />
          </label>
          <label className="flex flex-col">
            Finish Date
            <input
              type="date"
              value={finishDate}
              onChange={(e) => setFinishDate(e.target.value)}
              className="mt-1 p-2 border rounded"
              min={startDate}
            />
          </label>
        </div>
        {showInterest && (
          <div className="mt-4 w-full bg-[#eaf2fa] rounded-xl p-4 text-center">
            <div className="font-semibold text-[#2c3e5f]">
              Estimated Interest on Savings
            </div>
            <div className="text-lg font-bold text-[#00e096]">
              ₦{interest.toLocaleString()}
            </div>
            <div className="text-xs text-[#4A5B6E] mt-1">
              ({days} days at 0.05% daily)
            </div>
            <div className="text-xs text-[#4A5B6E]">
              Time Remaining: {days} days
            </div>
          </div>
        )}
        {/* Safe Lock Option for Savings */}
        {hasSavings && (
          <div className="w-full mt-4 flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={safeLock}
                onChange={(e) => setSafeLock(e.target.checked)}
              />
              <span className="text-xs text-[#4A5B6E]">
                Enable Safe Lock (money only available after finish date,
                minimum 10 days)
              </span>
            </label>
            {safeLock &&
              finishDate &&
              daysBetween(startDate, finishDate) < 10 && (
                <span className="text-xs text-red-600">
                  Safe lock requires at least 10 days between start and finish
                  date.
                </span>
              )}
          </div>
        )}
        {/* Savings Goals Selector */}
        {showGoals && (
          <SavingsGoalsSelector
            demographics={demographics}
            onSelect={(goals) => {
              setSelectedGoals(goals);
              setShowGoals(false);
            }}
          />
        )}
        <TermsCheckbox agreed={agreed} setAgreed={setAgreed} />
        <button
          className="mt-8 bg-[#00e096] text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-[#00c080] transition text-base"
          disabled={
            !agreed ||
            pinConfirmed ||
            (showGoals && selectedGoals.length === 0) ||
            !safeLockValid
          }
          onClick={() => setPinOpen(true)}
        >
          Continue
        </button>
        <PinConfirmModal
          open={pinOpen}
          onCancel={() => setPinOpen(false)}
          onConfirm={() => {
            setPinConfirmed(true);
            setPinOpen(false);
            router.push("/dashboard");
          }}
        />
      </div>
    </div>
  );
}

export default function BudgetSummaryPageWithSuspense() {
  return (
    <Suspense fallback={null}>
      <BudgetSummaryPage />
    </Suspense>
  );
}
