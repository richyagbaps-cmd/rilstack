"use client";
import { useRouter } from "next/navigation";

export default function BudgetTypePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fc] p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6 text-[#2c3e5f]">Choose Your Budgeting Experience</h1>
        <p className="mb-8 text-[#4A5B6E] text-center">Select the budgeting style that fits your needs:</p>
        <div className="flex flex-col gap-6 w-full">
          <div className="bg-[#eaf2fa] rounded-xl p-4 flex flex-col items-center">
            <h2 className="text-lg font-bold text-[#2c3e5f] mb-1">Strict</h2>
            <p className="text-sm text-[#4A5B6E] text-center mb-2">Mandatory Safe Lock: Money is locked until the end date. No withdrawals until completion.</p>
            <button
              className="w-full bg-[#00e096] text-white font-bold py-2 rounded-lg shadow hover:bg-[#00c080] transition text-base"
              onClick={() => router.push("/budgets/budget/strict/type")}
            >Choose Strict</button>
          </div>
          <div className="bg-[#fffbe6] rounded-xl p-4 flex flex-col items-center">
            <h2 className="text-lg font-bold text-[#FFD700] mb-1">Relaxed</h2>
            <p className="text-sm text-[#4A5B6E] text-center mb-2">No Safe Lock: Withdraw anytime, but pay a 3.5% fee on any amount removed before the end date.</p>
            <button
              className="w-full bg-[#FFD700] text-white font-bold py-2 rounded-lg shadow hover:bg-[#FFC300] transition text-base"
              onClick={() => router.push("/budgets/budget/relaxed/type")}
            >Choose Relaxed</button>
          </div>
        </div>
      </div>
    </div>
  );
}
