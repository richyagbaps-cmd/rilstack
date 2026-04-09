
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
        {/* Terms Agreement (always visible) */}
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <input
            type="checkbox"
            id="budget-agree-terms"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#2c3e5f] cursor-pointer"
          />
          <label htmlFor="budget-agree-terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
            I agree to Rilstack&apos;s{' '}
            <a href="/terms" target="_blank" className="text-[#2c3e5f] font-semibold underline">Terms of Service</a>,{' '}
            <a href="/privacy" target="_blank" className="text-[#2c3e5f] font-semibold underline">Privacy Policy</a>, and{' '}
            <a href="/security" target="_blank" className="text-[#2c3e5f] font-semibold underline">Security &amp; Fraud</a>{' '}
            policies. I understand that my data will be processed in accordance with these policies.
          </label>
        </div>
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
      </div>
    </div>
  );
}
