"use client";
import { useState } from "react";
import { suggestBudgetAllocation } from "@/utils/ai-allocations";

interface DemographicsFormProps {
  mode: "strict" | "relaxed";
  type: "502030" | "zero-based" | "custom";
  onSubmit?: (profile: any, totalIncome: number) => void;
}

const occupations = [
  "Student",
  "Employed",
  "Self-Employed",
  "Unemployed",
  "Retired",
  "Other",
];
const ageBrackets = [
  "Under 18",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
];
const genders = ["Male", "Female", "Non-binary", "Prefer not to say"];
const incomeRanges = [
  "Below ₦50,000",
  "₦50,000 - ₦200,000",
  "₦200,001 - ₦500,000",
  "₦500,001 - ₦1,000,000",
  "Above ₦1,000,000",
];

export default function DemographicsForm({
  mode,
  type,
  onSubmit,
}: DemographicsFormProps) {
  const [occupation, setOccupation] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [income, setIncome] = useState("");
  const [totalIncome, setTotalIncome] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (totalIncome && totalIncome > 0) {
      const demographics = { occupation, age, gender, state, country, income };
      setSuggestion(suggestBudgetAllocation(demographics, type, totalIncome));
      if (onSubmit) {
        onSubmit(demographics, totalIncome);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fc] p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6 text-[#2c3e5f]">
          Tell Us About Yourself
        </h1>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col">
            Occupation
            <select
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              required
              className="mt-1 p-2 border rounded"
            >
              <option value="" disabled>
                Select occupation
              </option>
              {occupations.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col">
            Age Bracket
            <select
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              className="mt-1 p-2 border rounded"
            >
              <option value="" disabled>
                Select age bracket
              </option>
              {ageBrackets.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col">
            Gender
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="mt-1 p-2 border rounded"
            >
              <option value="" disabled>
                Select gender
              </option>
              {genders.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col">
            State
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              className="mt-1 p-2 border rounded"
              placeholder="Enter your state"
            />
          </label>
          <label className="flex flex-col">
            Country
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="mt-1 p-2 border rounded"
              placeholder="Enter your country"
            />
          </label>
          <label className="flex flex-col">
            Monthly Income (₦)
            <input
              type="number"
              value={totalIncome ?? ""}
              onChange={(e) => setTotalIncome(Number(e.target.value))}
              required
              min={0}
              className="mt-1 p-2 border rounded"
              placeholder="Enter your monthly income"
            />
          </label>
          <button
            type="submit"
            className="mt-4 bg-[#00e096] text-white font-bold py-2 rounded-lg shadow hover:bg-[#00c080] transition text-base"
          >
            Continue
          </button>
        </form>
        {submitted && suggestion && (
          <div className="mt-6 w-full">
            <h2 className="text-xl font-bold mb-2 text-[#2c3e5f]">
              AI Suggested Allocation
            </h2>
            {type === "502030" && (
              <ul className="list-disc pl-6">
                <li>Needs: ₦{suggestion.needs?.toLocaleString()}</li>
                <li>Wants: ₦{suggestion.wants?.toLocaleString()}</li>
                <li>Savings: ₦{suggestion.savings?.toLocaleString()}</li>
              </ul>
            )}
            {type === "zero-based" && (
              <ul className="list-disc pl-6">
                <li>Needs: ₦{suggestion.needs?.toLocaleString()}</li>
                <li>Wants: ₦{suggestion.wants?.toLocaleString()}</li>
                <li>Savings: ₦{suggestion.savings?.toLocaleString()}</li>
              </ul>
            )}
            {type === "custom" && (
              <ul className="list-disc pl-6">
                {Object.entries(suggestion.custom || {}).map(
                  ([pocket, amount]) => (
                    <li key={pocket}>
                      {pocket}: ₦{(amount as number).toLocaleString()}
                    </li>
                  ),
                )}
              </ul>
            )}
            <button
              className="mt-6 bg-[#00e096] text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-[#00c080] transition text-base"
              onClick={() => {
                let url = "/budgets/budget/summary?type=" + type;
                if (type === "502030" || type === "zero-based") {
                  url += `&needs=${suggestion.needs}&wants=${suggestion.wants}&savings=${suggestion.savings}`;
                } else if (type === "custom") {
                  url += `&custom=${encodeURIComponent(JSON.stringify(suggestion.custom))}`;
                }
                window.location.href = url;
              }}
            >
              See My Budget
            </button>
          </div>
        )}
        {submitted && !suggestion && (
          <div className="mt-6 text-red-600 font-semibold">
            Please enter your monthly income to get a suggestion.
          </div>
        )}
      </div>
    </div>
  );
}
