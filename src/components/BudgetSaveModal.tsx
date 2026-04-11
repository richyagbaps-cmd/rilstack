
import React, { useState } from "react";

export type BudgetSaveStep =
  | "chooseType"
  | "chooseBudgetMode"
  | "chooseBudgetType"
  | "collectUserInfo"
  | "editCategories"
  | "setDates"
  | "agreeTerms"
  | "summary";

type Category = {
  label: string;
  percent?: number;
  amount: number;
};

export default function BudgetSaveModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<BudgetSaveStep>("chooseType");
  const [budgetMode, setBudgetMode] = useState<"strict" | "relaxed" | null>(null);
  const [budgetType, setBudgetType] = useState<"50-30-20" | "zero-based" | "custom" | null>(null);
  const [userInfo, setUserInfo] = useState({
    occupation: "",
    age: "",
    gender: "",
    state: "",
    country: "",
    income: "",
  });
  const [incomeAmount, setIncomeAmount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [frequency, setFrequency] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [pin, setPin] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        {/* Terms Agreement removed as requested */}
        {/* Step: Choose Budget Mode */}
        {step === "chooseBudgetMode" && (
          <>
            <h2 className="text-xl font-bold mb-4 text-[#2c3e5f]">Choose your budgeting experience</h2>
            <div className="flex flex-col gap-4">
              <button
                className="rounded-xl bg-gradient-to-r from-[#2c3e5f] to-[#4A8B6E] text-white py-3 font-semibold text-lg"
                onClick={() => { setBudgetMode("strict"); setStep("chooseBudgetType"); }}
                disabled={!agreed}
              >
                Strict (Mandatory Safelock)
                <div className="text-xs font-normal mt-1">Money is locked until the end date. No withdrawals until completion.</div>
              </button>
              <button
                className="rounded-xl bg-gradient-to-r from-[#FFA500] to-[#FFD700] text-white py-3 font-semibold text-lg"
                onClick={() => { setBudgetMode("relaxed"); setStep("chooseBudgetType"); }}
                disabled={!agreed}
              >
                Relaxed (3.5% withdrawal fee)
                <div className="text-xs font-normal mt-1">Withdraw anytime, but pay a 3.5% fee on any amount removed before the end date.</div>
              </button>
            </div>
            <button className="mt-6 text-[#2c3e5f] underline" onClick={() => setStep("chooseType")}>Back</button>
          </>
        )}
        {/* ...rest of the component code... */}
        {/* Ensure all steps and JSX are properly closed. If more steps are needed, add them here. */}
      </div>
    </div>
  );
}
