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

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Transaction History
      </h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {types.map((t) => (
          <button
            key={t}
            className={`px-4 py-2 rounded ${filter === t ? "bg-blue-600 text-white" : "bg-gray-100 text-blue-700"}`}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
        <input
          type="text"
          className="border p-2 rounded ml-2"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded ml-2"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded ml-2"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Action</th>
            <th className="p-2 text-right">Amount (₦)</th>
            <th className="p-2 text-right">Fee (₦)</th>
            <th className="p-2 text-right">Balance After (₦)</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-gray-400 py-8">
                No transactions found.
              </td>
            </tr>
          )}
          {filtered.map((tx, idx) => (
            <tr key={idx} className="border-b">
              <td className="p-2">{tx.date}</td>
              <td className="p-2">{tx.type}</td>
              <td className="p-2">{tx.name}</td>
              <td className="p-2">{tx.action}</td>
              <td
                className={`p-2 text-right ${tx.amount < 0 ? "text-red-600" : "text-green-700"}`}
              >
                {tx.amount < 0 ? "-" : "+"}₦
                {Math.abs(tx.amount).toLocaleString()}
              </td>
              <td className="p-2 text-right">
                {tx.fee ? `₦${tx.fee.toLocaleString()}` : "-"}
              </td>
              <td className="p-2 text-right font-bold">
                ₦{tx.balance.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
