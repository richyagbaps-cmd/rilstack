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
  const availableBalance = Math.max(totalBalance - budgetSpent, 0);

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
          <a
            href="/settings"
            aria-label="Open settings"
            style={{ width: 24, height: 18, display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer" }}
          >
            <div style={{ height: 2, background: "#fff", borderRadius: 2 }} />  
            <div style={{ height: 2, background: "#fff", borderRadius: 2, width: "70%" }} />
            <div style={{ height: 2, background: "#fff", borderRadius: 2 }} />
          </a>
          <a
            href="/profile"
            aria-label="Open profile"
            style={{
              width: 34, height: 34, borderRadius: "50%", background: "#1A5F7A",
              display: "flex", alignItems: "center", justifyContent: "center",  
              fontSize: "0.9rem", fontWeight: 700, color: "#fff", textDecoration: "none",
            }}
          >
            {firstName.charAt(0).toUpperCase()}
          </a>
        </div>

        {/* Greeting + Balance */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: "0.85rem", color: "#D1D5DB", margin: "0 0 2px" }}>Hi, {firstName}! </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>    
            <span style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: -1, color: "#fff" }}>{fmt(totalBalance)}</span>
          </div>
          <div style={{ width: 36, height: 3, borderRadius: 2, background: "#5BB5E0", marginTop: 5 }} />
        </div>

        {/* Balance Widgets (no charts/graphs) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginBottom: 12 }}>
          <div style={{ background: "linear-gradient(135deg, #173A66 0%, #102845 100%)", borderRadius: 14, padding: "14px", border: "1px solid rgba(255,255,255,0.12)" }}>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "#BFD8ED", textTransform: "uppercase", letterSpacing: 1 }}>Total Balance</p>
            <p style={{ margin: "6px 0 0", fontSize: "1.3rem", fontWeight: 800, color: "#fff" }}>{fmt(totalBalance)}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <a href="/budgets" style={{ textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <p style={{ margin: 0, fontSize: "0.7rem", color: "#9FB8CC", textTransform: "uppercase", letterSpacing: 0.8 }}>Budget Wallet</p>
              <p style={{ margin: "6px 0 0", fontSize: "1rem", fontWeight: 700, color: "#5BB5E0" }}>{fmt(budgetAlloc)}</p>
            </a>

            <a href="/savings/dashboard" style={{ textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <p style={{ margin: 0, fontSize: "0.7rem", color: "#9FB8CC", textTransform: "uppercase", letterSpacing: 0.8 }}>Savings Balance</p>
              <p style={{ margin: "6px 0 0", fontSize: "1rem", fontWeight: 700, color: "#22C55E" }}>{fmt(savingsTotal)}</p>
            </a>

            <a href="/investments/dashboard" style={{ textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <p style={{ margin: 0, fontSize: "0.7rem", color: "#9FB8CC", textTransform: "uppercase", letterSpacing: 0.8 }}>Investments</p>
              <p style={{ margin: "6px 0 0", fontSize: "1rem", fontWeight: 700, color: "#A78BFA" }}>{fmt(investTotal)}</p>
            </a>

            <a href="/account" style={{ textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <p style={{ margin: 0, fontSize: "0.7rem", color: "#9FB8CC", textTransform: "uppercase", letterSpacing: 0.8 }}>Available Balance</p>
              <p style={{ margin: "6px 0 0", fontSize: "1rem", fontWeight: 700, color: "#F59E0B" }}>{fmt(availableBalance)}</p>
            </a>
          </div>
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

