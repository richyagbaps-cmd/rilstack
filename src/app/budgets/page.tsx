"use client";
import { useRouter } from "next/navigation";

export default function BudgetsPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fc] p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-[#2c3e5f]">
          Budgets & Savings
        </h1>
        <p className="mb-4 text-[#4A5B6E] text-center">
          Choose an option below to get started. Each option helps you manage
          your money in a different way:
        </p>
        <div className="mb-8 w-full flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-[#eaf2fa] rounded-xl p-4 flex flex-col items-center">
            <div className="mb-2">
              {/* Budget Icon */}
              <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill="#2c3e5f" />
                <path
                  d="M12 28h16v-2H12v2zm0-6h16v-2H12v2zm0-6h16v-2H12v2z"
                  fill="#fff"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#2c3e5f] mb-1">Budget</h2>
            <p className="text-sm text-[#4A5B6E] text-center mb-3">
              Plan your spending, set limits, and track expenses to stay on top
              of your finances.
            </p>
            <button
              className="w-full bg-[#00e096] text-white font-bold py-2 rounded-lg shadow hover:bg-[#00c080] transition text-base"
              onClick={() => router.push("/budgets/budget")}
            >
              Start Budgeting
            </button>
          </div>
          <div className="flex-1 bg-[#e0f0e8] rounded-xl p-4 flex flex-col items-center">
            <div className="mb-2">
              {/* Save Icon */}
              <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill="#4A8B6E" />
                <path d="M14 26l6-12 6 12H14z" fill="#fff" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#2c3e5f] mb-1">Save</h2>
            <p className="text-sm text-[#4A5B6E] text-center mb-3">
              Set savings goals, automate deposits, and watch your money grow
              over time.
            </p>
            <button
              className="w-full bg-[#e0f0e8] text-[#2c3e5f] font-bold py-2 rounded-lg shadow hover:bg-[#c7e6d8] transition text-base border border-[#2c3e5f]/10"
              onClick={() => router.push("/savings-goals")}
            >
              Start Saving
            </button>
          </div>
        </div>
        <div className="w-full mt-2 text-xs text-[#7a869a] text-center">
          <strong>How it works:</strong> <br />
          <span className="block md:inline">
            Budgeting helps you control your spending by setting limits for
            different categories. Saving lets you set aside money for future
            goals, with options to automate your savings and track your
            progress.
          </span>
        </div>
      </div>
    </div>
  );
}
