"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function DashboardTabBar() {
  const pathname = usePathname();
  
  const tabs = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/budgets", label: "Budget", icon: "🧮" },
    { href: "/savings", label: "Savings", icon: "🐷" },
    { href: "/investments", label: "Invest", icon: "📈" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-20 shadow-lg z-50">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              isActive
                ? "border-t-2 border-[#1A5F7A] text-[#1A5F7A]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="text-2xl">{tab.icon}</span>
            <span className="text-xs font-semibold">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
