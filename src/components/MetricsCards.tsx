"use client";

import Link from "next/link";

export interface MetricsData {
  netWorth: number;
  netWorthChange: number;
  budgetLeft: number;
  budgetTotal: number;
  totalSavings: number;
  interestEarned: number;
  totalInvested: number;
  expectedReturns: number;
}

interface MetricsCardsProps {
  data: MetricsData;
  loading?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function MetricCard({
  icon,
  label,
  value,
  subLabel,
  subLabelColor,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  subLabel: string;
  subLabelColor: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white rounded-[16px] border border-slate-200 p-4 w-40 h-24 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{icon}</span>
        </div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
      <div>
        <p className="text-lg font-bold text-[#1A5F7A]">{value}</p>
        <p className={`text-xs font-medium ${subLabelColor}`}>{subLabel}</p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export default function MetricsCards({ data, loading }: MetricsCardsProps) {
  if (loading) {
    return (
      <div className="px-4 pb-4">
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-40 h-24 bg-slate-200 rounded-[16px] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const netWorthPercent =
    data.netWorthChange >= 0
      ? `+${data.netWorthChange.toFixed(1)}%`
      : `${data.netWorthChange.toFixed(1)}%`;

  const netWorthColor =
    data.netWorthChange >= 0 ? "text-emerald-600" : "text-red-600";

  return (
    <div className="px-4 pb-4">
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        <MetricCard
          icon="💰"
          label="Net Worth"
          value={formatCurrency(data.netWorth)}
          subLabel={netWorthPercent + " from last month"}
          subLabelColor={netWorthColor}
        />

        <MetricCard
          icon="💼"
          label="Budget Left"
          value={formatCurrency(data.budgetLeft)}
          subLabel={`of ${formatCurrency(data.budgetTotal)}`}
          subLabelColor="text-slate-600"
          href="/budgets"
        />

        <MetricCard
          icon="🐷"
          label="Total Savings"
          value={formatCurrency(data.totalSavings)}
          subLabel={`+${formatCurrency(data.interestEarned)} interest`}
          subLabelColor="text-emerald-600"
          href="/savings"
        />

        <MetricCard
          icon="📈"
          label="Invested"
          value={formatCurrency(data.totalInvested)}
          subLabel={`Est. returns ${formatCurrency(data.expectedReturns)}`}
          subLabelColor="text-blue-600"
          href="/investments"
        />
      </div>
    </div>
  );
}
