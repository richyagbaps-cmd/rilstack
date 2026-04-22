"use client";

import Link from "next/link";

const actions = [
  { href: "/report-fraud", label: "Report Fraud", icon: "🛡️" },
  { href: "/contact-support", label: "Help & Support", icon: "❓" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-4 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.02)] transition hover:border-[#F4A261]"
        >
          <span className="text-xl text-[#1A5F7A]">{action.icon}</span>
          <span className="text-xs font-semibold text-slate-700">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
