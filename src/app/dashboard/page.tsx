"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  DEMO_EMAIL,
  DEMO_TOTAL_BALANCE,
  DEMO_BUDGET_ALLOCATED,
  DEMO_BUDGET_SPENT,
  DEMO_SAVINGS_GOALS,
  DEMO_INVESTMENTS,
  DEMO_TRANSACTIONS,
  fmt,
} from "@/lib/demo-data";

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B1120" }}>
        <p style={{ color: "#5BB5E0", fontFamily: "var(--font-poppins), sans-serif" }}>Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  const isDemo = session.user?.email === DEMO_EMAIL;
  const firstName = session.user?.name?.split(" ")[0] || "there";

  // Balances
  const totalBalance = isDemo ? DEMO_TOTAL_BALANCE : 0;
  const savingsTotal = isDemo ? DEMO_SAVINGS_GOALS.reduce((s, g) => s + g.saved, 0) : 0;
  const investTotal  = isDemo ? DEMO_INVESTMENTS.reduce((s, i) => s + i.amountInvested, 0) : 0;
  const budgetAlloc  = isDemo ? DEMO_BUDGET_ALLOCATED : 0;
  const budgetSpent  = isDemo ? DEMO_BUDGET_SPENT : 0;
  const budgetPct    = budgetAlloc > 0 ? Math.round((budgetSpent / budgetAlloc) * 100) : 0;
  const recentItems  = isDemo ? DEMO_TRANSACTIONS.slice(0, 3) : [];

  const budgetArc = (budgetPct / 100) * 2 * Math.PI * 30;
  const budgetFull = 2 * Math.PI * 30;

  return (
    <main
      style={{
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        background: "#0B1120",
        fontFamily: "var(--font-poppins), sans-serif",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", width: "100%" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, marginBottom: 12 }}>
          <div style={{ width: 24, height: 18, display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer" }}>
            <div style={{ height: 2, background: "#fff", borderRadius: 2 }} />  
            <div style={{ height: 2, background: "#fff", borderRadius: 2, width: "70%" }} />
            <div style={{ height: 2, background: "#fff", borderRadius: 2 }} />
          </div>
          <div
            style={{
              width: 34, height: 34, borderRadius: "50%", background: "#1A5F7A",
              display: "flex", alignItems: "center", justifyContent: "center",  
              fontSize: "0.9rem", fontWeight: 700, color: "#fff",
            }}
          >
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Greeting + Balance */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: "0.85rem", color: "#D1D5DB", margin: "0 0 2px" }}>Hi, {firstName}! </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>    
            <span style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: -1, color: "#fff" }}>{fmt(totalBalance)}</span>
          </div>
          <div style={{ width: 36, height: 3, borderRadius: 2, background: "#5BB5E0", marginTop: 5 }} />
        </div>

        {/* Balance split  Budget | Save | Invest */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
          {[
            { label: "Budget", val: budgetAlloc, color: "#5BB5E0" },
            { label: "Savings", val: savingsTotal, color: "#22C55E" },
            { label: "Invested", val: investTotal, color: "#A78BFA" },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "8px 10px", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "0.65rem", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.8 }}>{s.label}</p>
              <p style={{ margin: "3px 0 0", fontSize: "0.8rem", fontWeight: 700, color: s.color }}>{fmt(s.val)}</p>
            </div>
          ))}
        </div>

        {/* Deposit & Withdraw */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <a href="/account" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#22C55E", color: "#fff", padding: "10px 0", borderRadius: 12, fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
             Deposit
          </a>
          <a href="/account" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(255,255,255,0.08)", color: "#fff", padding: "10px 0", borderRadius: 12, fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)" }}>
             Withdraw
          </a>
        </div>

        {/* Budget ring */}
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="52" height="52" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle cx="36" cy="36" r="30" fill="none" stroke="#5BB5E0" strokeWidth="6" strokeDasharray={`${budgetArc} ${budgetFull}`} strokeLinecap="round" transform="rotate(-90 36 36)" />
            <text x="36" y="34" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="700" fontFamily="var(--font-poppins), sans-serif">{budgetPct}%</text> 
            <text x="36" y="46" textAnchor="middle" fill="#D1D5DB" fontSize="9" fontFamily="var(--font-poppins), sans-serif">Budget</text>
          </svg>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "0.88rem", color: "#fff" }}>Monthly Budget</p>
            <p style={{ margin: "2px 0 0", color: "#D1D5DB", fontSize: "0.76rem" }}>{fmt(budgetSpent)} of {fmt(budgetAlloc)} · 12 days left</p>
            <a href="/budget" style={{ color: "#5BB5E0", fontSize: "0.74rem", textDecoration: "none", fontWeight: 600, marginTop: 3, display: "inline-block" }}>View →</a>
          </div>
        </div>

        {/* Recent Transactions */}
        <p style={{ fontSize: "0.78rem", fontWeight: 700, marginBottom: 7, color: "#fff", textTransform: "uppercase", letterSpacing: 1 }}>Recent</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
          {recentItems.length === 0 ? (
            <p style={{ color: "#9CA3AF", fontSize: "0.82rem", textAlign: "center", padding: "10px 0" }}>No transactions yet.</p>
          ) : recentItems.map((item, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "9px 14px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "0.83rem", color: "#fff" }}>{item.label}</p>
                <p style={{ margin: "1px 0 0", color: "#D1D5DB", fontSize: "0.71rem" }}>{item.sub}</p>
              </div>
              <span style={{ fontWeight: 700, fontSize: "0.83rem", color: item.color }}>{item.amount}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>     
          <a href="/report-fraud" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "7px 12px", color: "#fff", fontWeight: 600, fontSize: "0.75rem", textDecoration: "none" }}> Fraud</a>
          <a href="/contact-support" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "7px 12px", color: "#fff", fontWeight: 600, fontSize: "0.75rem", textDecoration: "none" }}> Support</a>
          <a href="/settings" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "7px 12px", color: "#fff", fontWeight: 600, fontSize: "0.75rem", textDecoration: "none" }}>Settings</a>
        </div>
      </div>

      {/* Bottom Widget Nav */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#131A2E", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-around", padding: "10px 0 14px", zIndex: 50 }}>
        <a href="/budgets" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none", color: "#9CA3AF", fontSize: "0.7rem", fontWeight: 600, fontFamily: "var(--font-poppins), sans-serif" }}>    
          <span style={{ fontSize: "1.4rem" }}></span>Budget
        </a>
        <a href="/savings" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none", color: "#9CA3AF", fontSize: "0.7rem", fontWeight: 600, fontFamily: "var(--font-poppins), sans-serif" }}>    
          <span style={{ fontSize: "1.4rem" }}></span>Save
        </a>
        <a href="/investments" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none", color: "#9CA3AF", fontSize: "0.7rem", fontWeight: 600, fontFamily: "var(--font-poppins), sans-serif" }}>
          <span style={{ fontSize: "1.4rem" }}></span>Invest
        </a>
        <a href="/account" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none", color: "#9CA3AF", fontSize: "0.7rem", fontWeight: 600, fontFamily: "var(--font-poppins), sans-serif" }}>    
          <span style={{ fontSize: "1.4rem" }}></span>Account
        </a>
      </nav>
    </main>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B1120" }}><p style={{ color: "#5BB5E0" }}>Loading...</p></div>}>
      <DashboardContent />
    </Suspense>
  );
}

