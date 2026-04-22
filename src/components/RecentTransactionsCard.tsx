"use client";

import Link from "next/link";

export interface RecentTransactionItem {
  id: string;
  type: "budget" | "savings" | "investment" | "penalty";
  description: string;
  amount: number;
  timestamp: string;
  fee?: number;
}

interface RecentTransactionsCardProps {
  items: RecentTransactionItem[];
}

function formatNaira(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
}

function TransactionIcon({ type }: { type: RecentTransactionItem["type"] }) {
  const common = "flex h-10 w-10 items-center justify-center rounded-full";

  if (type === "budget") {
    return <span className={`${common} bg-[#1A5F7A]/10 text-[#1A5F7A]`}>💼</span>;
  }
  if (type === "savings") {
    return <span className={`${common} bg-[#2E7D32]/10 text-[#2E7D32]`}>🐷</span>;
  }
  if (type === "investment") {
    return <span className={`${common} bg-[#0EA5E9]/10 text-[#0EA5E9]`}>📈</span>;
  }
  return <span className={`${common} bg-[#ED6C02]/10 text-[#ED6C02]`}>⚠️</span>;
}

export default function RecentTransactionsCard({ items }: RecentTransactionsCardProps) {
  return (
    <section className="rounded-[20px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.02)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">Recent Transactions</h2>
        <Link href="/history" className="text-sm font-semibold text-[#1A5F7A] hover:underline">
          View all history
        </Link>
      </div>

      <div className="space-y-4">
        {items.slice(0, 5).map((item) => {
          const isPositive = item.amount > 0;
          const amountColor = isPositive ? "text-[#2E7D32]" : item.type === "penalty" ? "text-[#ED6C02]" : "text-[#D32F2F]";
          const prefix = isPositive ? "+" : "-";

          return (
            <div key={item.id} className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <TransactionIcon type={item.type} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.description}</p>
                  {typeof item.fee === "number" && item.fee > 0 && (
                    <p className="mt-1 text-xs text-[#ED6C02]">+{formatNaira(item.fee)} fee</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">{item.timestamp}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${amountColor}`}>
                {prefix}{formatNaira(item.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
