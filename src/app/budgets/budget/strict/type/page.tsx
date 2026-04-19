"use client";
import { useRouter } from "next/navigation";

export default function StrictBudgetTypePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fc] p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6 text-[#2c3e5f]">
          Choose Budget Type
        </h1>
        <p className="mb-8 text-[#4A5B6E] text-center">
          Select a budgeting method that fits your style:
        </p>
        <div className="flex flex-col gap-6 w-full">
          <button
            className="w-full bg-[#7C3AED] text-white font-bold py-3 rounded-lg shadow hover:bg-[#5B21B6] transition text-lg"
            onClick={() => router.push("/budgets/budget/strict/502030")}
          >
            50/30/20 Budget
          </button>
          <button
            className="w-full bg-[#00e096] text-white font-bold py-3 rounded-lg shadow hover:bg-[#00c080] transition text-lg"
            onClick={() => router.push("/budgets/budget/strict/zero-based")}
          >
            Zero-Based Budget
          </button>
          <button
            className="w-full bg-[#FFD700] text-[#2c3e5f] font-bold py-3 rounded-lg shadow hover:bg-[#FFC300] transition text-lg"
            onClick={() => router.push("/budgets/budget/strict/custom")}
          >
            Custom Budget
          </button>
        </div>
      </div>
    </div>
  );
}
