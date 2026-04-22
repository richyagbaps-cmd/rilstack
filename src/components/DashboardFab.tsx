"use client";

import Link from "next/link";
import { useState } from "react";

const actions = [
  { href: "/savings/dashboard", label: "Add to Savings" },
  { href: "/budgets/budget/summary", label: "Withdraw from Budget" },
  { href: "/investments/product", label: "Invest" },
  { href: "/savings/safe-lock", label: "Create Safe Lock" },
];

export default function DashboardFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3">
        {open && (
          <div className="w-[min(20rem,calc(100vw-2rem))] rounded-[24px] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.16)]">
            <p className="mb-3 text-sm font-semibold text-slate-900">Quick Actions</p>
            <div className="space-y-2">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  onClick={() => setOpen(false)}
                  className="flex h-11 items-center rounded-xl px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F4A261] text-3xl font-light text-white shadow-[0_8px_24px_rgba(244,162,97,0.45)] transition hover:scale-[1.03]"
          aria-label="Open quick action menu"
        >
          +
        </button>
      </div>
    </>
  );
}
