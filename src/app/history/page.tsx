"use client";
import { useState } from "react";

// Demo transaction data
const demoTxs = [
  {
    date: "2026-04-19",
    type: "Budget",
    name: "Groceries",
    action: "Withdraw",
    amount: -2000,
    fee: 0,
    balance: 98000,
  },
  {
    date: "2026-04-18",
    type: "Savings",
    name: "Emergency Fund",
    action: "Deposit",
    amount: 5000,
    fee: 0,
    balance: 100000,
  },
  {
    date: "2026-04-17",
    type: "Safe Lock",
    name: "Emergency Fund",
    action: "Create",
    amount: -10000,
    fee: 0,
    balance: 95000,
  },
  {
    date: "2026-04-16",
    type: "Budget",
    name: "Dining Out",
    action: "Withdraw",
    amount: -3000,
    fee: 105,
    balance: 92000,
  },
  {
    date: "2026-04-15",
    type: "Investments",
    name: "Tech Growth Fund",
    action: "Purchase",
    amount: -5000,
    fee: 0,
    balance: 87000,
  },
  {
    date: "2026-04-14",
    type: "Investments",
    name: "Tech Growth Fund",
    action: "Interest",
    amount: 140,
    fee: 0,
    balance: 87140,
  },
  {
    date: "2026-04-13",
    type: "Investments",
    name: "Tech Growth Fund",
    action: "Maturity Payout",
    amount: 6400,
    fee: 0,
    balance: 93540,
  },
  {
    date: "2026-04-12",
    type: "Investments",
    name: "Flexible Bond",
    action: "Early Withdrawal",
    amount: 9500,
    fee: 500,
    balance: 103040,
  },
];

const types = ["All", "Budget", "Savings", "Investments", "Safe Lock"];

export default function HistoryScreen() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = demoTxs.filter(
    (tx) =>
      (filter === "All" || tx.type === filter) &&
      (!search || tx.name.toLowerCase().includes(search.toLowerCase())) &&
      (!dateFrom || tx.date >= dateFrom) &&
      (!dateTo || tx.date <= dateTo),
  );

  const totalIn = filtered
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalOut = filtered
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const totalFees = filtered.reduce((sum, tx) => sum + tx.fee, 0);

  return (
    <div className="min-h-screen bg-[#eaf0f8] px-4 py-6">
      <div className="mx-auto max-w-6xl rounded-2xl border border-[#cfd9e7] bg-white shadow-[0_8px_30px_rgba(16,24,40,0.12)]">
        <div className="border-b border-[#d9e2ef] bg-[#f6f9ff] px-6 py-5">
          <h2 className="text-2xl font-bold text-[#10233f]">Transaction History</h2>
          <p className="mt-1 text-sm font-medium text-[#3f5878]">
            Track budget, savings, safelock, and investment movements in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 border-b border-[#d9e2ef] bg-[#f9fbff] px-6 py-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#d8e2f0] bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#4f6988]">Money In</p>
            <p className="mt-1 text-lg font-bold text-[#11663a]">₦{totalIn.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-[#d8e2f0] bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#4f6988]">Money Out</p>
            <p className="mt-1 text-lg font-bold text-[#b42318]">₦{totalOut.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-[#d8e2f0] bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#4f6988]">Total Fees</p>
            <p className="mt-1 text-lg font-bold text-[#10233f]">₦{totalFees.toLocaleString()}</p>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="mb-4 flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              filter === t
                ? "bg-[#1A5F7A] text-white shadow"
                : "border border-[#d1ddee] bg-[#f2f6fc] text-[#20456a] hover:bg-[#e7effa]"
            }`}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
          </div>

          <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3">
            <input
              type="text"
              className="h-11 rounded-lg border border-[#c5d4e8] bg-white px-3 text-sm text-[#12243f] placeholder:text-[#6b7f99] focus:border-[#1A5F7A] focus:outline-none"
              placeholder="Search by transaction name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <input
              type="date"
              className="h-11 rounded-lg border border-[#c5d4e8] bg-white px-3 text-sm text-[#12243f] focus:border-[#1A5F7A] focus:outline-none"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <input
              type="date"
              className="h-11 rounded-lg border border-[#c5d4e8] bg-white px-3 text-sm text-[#12243f] focus:border-[#1A5F7A] focus:outline-none"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#d6e0ee]">
            <table className="w-full min-w-[860px] text-sm">
        <thead>
              <tr className="bg-[#eef3fb] text-[#1c3555]">
                <th className="p-3 text-left font-bold">Date</th>
                <th className="p-3 text-left font-bold">Type</th>
                <th className="p-3 text-left font-bold">Name</th>
                <th className="p-3 text-left font-bold">Action</th>
                <th className="p-3 text-right font-bold">Amount (₦)</th>
                <th className="p-3 text-right font-bold">Fee (₦)</th>
                <th className="p-3 text-right font-bold">Balance After (₦)</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
                  <td colSpan={7} className="py-10 text-center text-sm font-semibold text-[#6f829a]">
                No transactions found.
              </td>
            </tr>
          )}
          {filtered.map((tx, idx) => (
                <tr key={idx} className="border-b border-[#edf2f9] bg-white text-[#172e4c] hover:bg-[#f8fbff]">
                  <td className="p-3 font-medium">{tx.date}</td>
                  <td className="p-3">{tx.type}</td>
                  <td className="p-3 font-semibold">{tx.name}</td>
                  <td className="p-3">{tx.action}</td>
              <td
                    className={`p-3 text-right font-bold ${tx.amount < 0 ? "text-[#b42318]" : "text-[#11663a]"}`}
              >
                {tx.amount < 0 ? "-" : "+"}₦
                {Math.abs(tx.amount).toLocaleString()}
              </td>
                  <td className="p-3 text-right font-medium">
                {tx.fee ? `₦${tx.fee.toLocaleString()}` : "-"}
              </td>
                  <td className="p-3 text-right font-bold text-[#10233f]">
                ₦{tx.balance.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
          </div>
        </div>
      </div>
    </div>
  );
}
