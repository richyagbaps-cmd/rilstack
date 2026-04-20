"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const recentItems = [
  { label: "Funded Wallet", sub: "Apr 15", amount: "+₦5,000", color: "#22C55E" },
  { label: "Budget: Food", sub: "Apr 14", amount: "-₦2,300", color: "#EF4444" },
  { label: "Interest Earned", sub: "Apr 11", amount: "+₦12.50", color: "#22C55E" },
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
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#1A5F7A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Greeting + Balance */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: "0.85rem", color: "#D1D5DB", margin: "0 0 2px" }}>Hi, {firstName}! 👋</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: -1, color: "#fff" }}>₦69,420</span>
            <span style={{ fontSize: "0.85rem", color: "#22C55E", fontWeight: 700 }}>+₦6,942</span>
          </div>
          <div style={{ width: 36, height: 3, borderRadius: 2, background: "#5BB5E0", marginTop: 6 }} />
        </div>

        {/* Deposit & Withdraw buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <a
            href="/account"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: "#22C55E", color: "#fff", padding: "10px 0",
              borderRadius: 12, fontWeight: 700, fontSize: "0.9rem", textDecoration: "none",
            }}
          >
            ↓ Deposit
          </a>
          <a
            href="/account"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: "rgba(255,255,255,0.08)", color: "#fff", padding: "10px 0",
              borderRadius: 12, fontWeight: 700, fontSize: "0.9rem", textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            ↑ Withdraw
          </a>
        </div>

        {/* Budget ring (compact) */}
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="56" height="56" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle cx="36" cy="36" r="30" fill="none" stroke="#5BB5E0" strokeWidth="6" strokeDasharray={`${0.72 * 2 * Math.PI * 30} ${2 * Math.PI * 30}`} strokeLinecap="round" transform="rotate(-90 36 36)" />
            <text x="36" y="34" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="700" fontFamily="var(--font-poppins), sans-serif">72%</text>
            <text x="36" y="46" textAnchor="middle" fill="#D1D5DB" fontSize="9" fontFamily="var(--font-poppins), sans-serif">Budget</text>
          </svg>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "#fff" }}>Monthly Budget</p>
            <p style={{ margin: "2px 0 0", color: "#D1D5DB", fontSize: "0.78rem" }}>₦94,000 of ₦150,000 · 12 days left</p>
            <a href="/budget" style={{ color: "#5BB5E0", fontSize: "0.76rem", textDecoration: "none", fontWeight: 600, marginTop: 4, display: "inline-block" }}>View →</a>
          </div>
        </div>

        {/* Recent Transactions */}
        <p style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: 8, color: "#fff", textTransform: "uppercase", letterSpacing: 1 }}>Recent</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
          {recentItems.map((item, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "10px 14px",
                border: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "#fff" }}>{item.label}</p>
                <p style={{ margin: "1px 0 0", color: "#D1D5DB", fontSize: "0.73rem" }}>{item.sub}</p>
              </div>
              <span style={{ fontWeight: 700, fontSize: "0.85rem", color: item.color }}>{item.amount}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <a href="/report-fraud" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 14px", color: "#fff", fontWeight: 600, fontSize: "0.78rem", textDecoration: "none" }}>
            🚨 Fraud
          </a>
          <a href="/contact-support" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 14px", color: "#fff", fontWeight: 600, fontSize: "0.78rem", textDecoration: "none" }}>
            💬 Support
          </a>
          <a href="/settings" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 14px", color: "#fff", fontWeight: 600, fontSize: "0.78rem", textDecoration: "none" }}>
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
