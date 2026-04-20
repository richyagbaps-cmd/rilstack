"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const recentItems = [
  { label: "Funded Wallet", sub: "Apr 15, 2026", amount: "+₦5,000", color: "#22C55E" },
  { label: "Budget: Food", sub: "Apr 14, 2026", amount: "-₦2,300", color: "#EF4444" },
  { label: "Savings Goal", sub: "Apr 13, 2026", amount: "+₦1,000", color: "#22C55E" },
  { label: "Investment", sub: "Apr 12, 2026", amount: "-₦10,000", color: "#EF4444" },
  { label: "Interest Earned", sub: "Apr 11, 2026", amount: "+₦12.50", color: "#22C55E" },
];

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

  const firstName = session.user?.name?.split(" ")[0] || "there";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0B1120",
        fontFamily: "var(--font-poppins), sans-serif",
        color: "#fff",
        paddingBottom: 100,
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, marginBottom: 24 }}>
          <div style={{ width: 28, height: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer" }}>
            <div style={{ height: 2, background: "#fff", borderRadius: 2 }} />
            <div style={{ height: 2, background: "#fff", borderRadius: 2, width: "70%" }} />
            <div style={{ height: 2, background: "#fff", borderRadius: 2 }} />
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#1A5F7A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Greeting */}
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, color: "#fff" }}>Hi, {firstName}!</h1>
        <p style={{ fontSize: "0.95rem", color: "#D1D5DB", margin: "4px 0 24px" }}>
          Your financial overview at a glance.
        </p>

        {/* Big Balance */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: "2.8rem", fontWeight: 800, letterSpacing: -1, color: "#fff" }}>₦69,420</span>
            <span style={{ fontSize: "0.95rem", color: "#22C55E", fontWeight: 700 }}>+₦6,942</span>
          </div>
          <div style={{ width: 48, height: 4, borderRadius: 2, background: "#5BB5E0", marginTop: 8 }} />
        </div>

        {/* Deposit & Withdraw buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
          <a
            href="/account"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#22C55E",
              color: "#fff",
              padding: "14px 0",
              borderRadius: 14,
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
            }}
          >
            ↓ Deposit
          </a>
          <a
            href="/account"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              padding: "14px 0",
              borderRadius: 14,
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            ↑ Withdraw
          </a>
        </div>

        {/* Income / Outcome */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "16px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize: "0.8rem", color: "#D1D5DB", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Income</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff" }}>₦262,144</span>
              <span style={{ fontSize: "0.8rem", color: "#22C55E" }}>+69.42 ▲</span>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "16px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize: "0.8rem", color: "#D1D5DB", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Outcome</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff" }}>₦65,536</span>
              <span style={{ fontSize: "0.8rem", color: "#EF4444" }}>-694.2 ▼</span>
            </div>
          </div>
        </div>

        {/* Budget ring */}
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle cx="36" cy="36" r="30" fill="none" stroke="#5BB5E0" strokeWidth="6" strokeDasharray={`${0.72 * 2 * Math.PI * 30} ${2 * Math.PI * 30}`} strokeLinecap="round" transform="rotate(-90 36 36)" />
            <text x="36" y="34" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="700" fontFamily="var(--font-poppins), sans-serif">72%</text>
            <text x="36" y="46" textAnchor="middle" fill="#D1D5DB" fontSize="9" fontFamily="var(--font-poppins), sans-serif">Budget used</text>
          </svg>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "#fff" }}>Monthly Budget</p>
            <p style={{ margin: "4px 0 0", color: "#D1D5DB", fontSize: "0.85rem" }}>₦94,000 of ₦150,000 · 12 days left</p>
            <a href="/budget" style={{ color: "#5BB5E0", fontSize: "0.8rem", textDecoration: "none", fontWeight: 600, marginTop: 6, display: "inline-block" }}>View Budget →</a>
          </div>
        </div>

        {/* Recent Transactions */}
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12, color: "#fff" }}>Recent Transactions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {recentItems.map((item, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 14,
                padding: "14px 16px",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem", color: "#fff" }}>{item.label}</p>
                <p style={{ margin: "2px 0 0", color: "#D1D5DB", fontSize: "0.8rem" }}>{item.sub}</p>
              </div>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: item.color }}>{item.amount}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/report-fraud" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 20px", color: "#fff", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}>
            🚨 Report Fraud
          </a>
          <a href="/contact-support" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 20px", color: "#fff", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}>
            💬 Support
          </a>
          <a href="/settings" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 20px", color: "#fff", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}>
            ⚙️ Settings
          </a>
        </div>
      </div>

      {/* Bottom Widget Nav */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#131A2E",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          justifyContent: "space-around",
          padding: "10px 0 14px",
          zIndex: 50,
        }}
      >
        <a href="/budgets" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none", color: "#9CA3AF", fontSize: "0.7rem", fontWeight: 600, fontFamily: "var(--font-poppins), sans-serif" }}>
          <span style={{ fontSize: "1.4rem" }}>📊</span>
          Budget
        </a>
        <a href="/savings" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none", color: "#9CA3AF", fontSize: "0.7rem", fontWeight: 600, fontFamily: "var(--font-poppins), sans-serif" }}>
          <span style={{ fontSize: "1.4rem" }}>🔒</span>
          Save
        </a>
        <a href="/investments" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none", color: "#9CA3AF", fontSize: "0.7rem", fontWeight: 600, fontFamily: "var(--font-poppins), sans-serif" }}>
          <span style={{ fontSize: "1.4rem" }}>📈</span>
          Invest
        </a>
        <a href="/account" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none", color: "#9CA3AF", fontSize: "0.7rem", fontWeight: 600, fontFamily: "var(--font-poppins), sans-serif" }}>
          <span style={{ fontSize: "1.4rem" }}>👤</span>
          Account
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
