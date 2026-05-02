"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Calculator, Home, PiggyBank, TrendingUp, User } from "lucide-react";

export default function DashboardTabBar() {
  const pathname = usePathname();

  const tabs = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/savings", label: "Savings", icon: PiggyBank },
    { href: "/investments", label: "Invest", icon: TrendingUp },
    { href: "/budgets", label: "Budget", icon: Calculator },
    { href: "/profile", label: "Account", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-slate-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === tab.href || pathname.startsWith(tab.href + "/");
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
              isActive ? "text-[#0AB68B]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Icon
              className="h-5 w-5"
              aria-hidden="true"
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
