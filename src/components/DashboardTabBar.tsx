"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Calculator, Home, PiggyBank, TrendingUp, User } from "lucide-react";

export default function DashboardTabBar() {
  const pathname = usePathname();
  
  const tabs = [
    { href: "/", label: "Home", icon: Home },
    { href: "/budgets", label: "Budget", icon: Calculator },
    { href: "/savings", label: "Savings", icon: PiggyBank },
    { href: "/investments", label: "Invest", icon: TrendingUp },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t border-slate-200 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
      {tabs.map((tab) => {
        const isActive = tab.href === "/"
          ? pathname === "/"
          : pathname === tab.href || pathname.startsWith(tab.href + "/");
        const Icon = tab.icon;
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
            <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={2} />
            <span className="text-[10px] font-semibold">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
