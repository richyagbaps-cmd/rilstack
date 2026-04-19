import React from "react";

const activities = [
  {
    label: "Funded Wallet",
    amount: "+₦5,000.00",
    date: "2026-04-01",
    type: "credit",
  },
  {
    label: "Invested in Plan",
    amount: "-₦2,000.00",
    date: "2026-03-28",
    type: "debit",
  },
  {
    label: "Saved to Goal",
    amount: "+₦1,000.00",
    date: "2026-03-25",
    type: "credit",
  },
];

export default function RecentActivity() {
  return (
    <section className="w-full max-w-2xl mx-auto mt-8">
      <h2 className="text-lg font-semibold mb-3 text-[#2c3e5f]">
        Recent Activity
      </h2>
      <div className="bg-white rounded-xl shadow p-4 divide-y divide-[#F8F9FC]">
        {activities.map((a, i) => (
          <div key={i} className="flex justify-between items-center py-2">
            <div>
              <div className="font-medium text-[#1E2A3A]">{a.label}</div>
              <div className="text-xs text-[#4A5B6E]">{a.date}</div>
            </div>
            <div
              className={`text-sm font-bold ${a.type === "credit" ? "text-green-600" : "text-red-500"}`}
            >
              {a.amount}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
