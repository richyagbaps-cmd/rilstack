import React from "react";

const cards = [
  {
    title: "Total Balance",
    value: "₦0.00",
    gradient: "from-[#4A8B6E] to-[#2c3e5f]",
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="16" fill="#fff" opacity="0.2" />
        <path
          d="M10 16h12M16 10v12"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Budgets",
    value: "₦0.00",
    gradient: "from-[#FFD700] to-[#FFA500]",
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
        <rect
          x="6"
          y="10"
          width="20"
          height="12"
          rx="4"
          fill="#fff"
          opacity="0.2"
        />
        <path
          d="M10 16h12"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Savings",
    value: "₦0.00",
    gradient: "from-[#6BAF8D] to-[#4A8B6E]",
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="16" fill="#fff" opacity="0.2" />
        <path
          d="M16 10v12"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Investments",
    value: "₦0.00",
    gradient: "from-[#2c3e5f] to-[#FFD700]",
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
        <rect
          x="6"
          y="10"
          width="20"
          height="12"
          rx="4"
          fill="#fff"
          opacity="0.2"
        />
        <path
          d="M16 10v12"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto mt-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`rounded-2xl p-5 shadow-lg text-white bg-gradient-to-br ${card.gradient} flex items-center gap-4 min-h-[110px]`}
        >
          <div>{card.icon}</div>
          <div>
            <div className="text-sm font-medium opacity-80">{card.title}</div>
            <div className="text-2xl font-bold mt-1">{card.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
