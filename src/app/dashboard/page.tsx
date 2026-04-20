"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const chartData = [
  { month: "May", value: 20 },
  { month: "Jun", value: 35 },
  { month: "Jul", value: 30 },
  { month: "Aug", value: 60 },
];

const recentItems = [
  { label: "Funded Wallet", sub: "Apr 15, 2026", amount: "+₦5,000", color: "#22C55E" },
  { label: "Budget: Food", sub: "Apr 14, 2026", amount: "-₦2,300", color: "#EF4444" },
  { label: "Savings Goal", sub: "Apr 13, 2026", amount: "+₦1,000", color: "#22C55E" },
  { label: "Investment", sub: "Apr 12, 2026", amount: "-₦10,000", color: "#EF4444" },
  { label: "Interest Earned", sub: "Apr 11, 2026", amount: "+₦12.50", color: "#22C55E" },
];

function MiniChart() {
  const max = Math.max(...chartData.map((d) => d.value));
  const h = 140;
  const w = 260;
  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * w;
    const y = h - (d.value / max) * h;
    return `${x},${y}`;
  });
  const polyline = points.join(" ");
  const lastPt = points[points.length - 1].split(",");

  return (
    <svg width={w} height={h + 20} viewBox={`0 0 ${w} ${h + 20}`} style={{ width: "100%", maxWidth: w }}>
      <polyline points={polyline} fill="none" stroke="#5BB5E0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="6" fill="#fff" stroke="#5BB5E0" strokeWidth="2" />
      {chartData.map((d, i) => {
        const x = (i / (chartData.length - 1)) * w;
        return (
          <text key={i} x={x} y={h + 16} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="var(--font-poppins), sans-serif">
            {d.month}
          </text>
        );
      })}
    </svg>
  );
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "income" | "outcome">("overview");

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
        paddingBottom: 90,
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
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>Hi, {firstName}!</h1>
        <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.45)", margin: "4px 0 24px" }}>
          Your financial overview at a glance.
        </p>

        {/* Big Balance */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: "2.6rem", fontWeight: 700, letterSpacing: -1 }}>₦69,420</span>
            <span style={{ fontSize: "0.85rem", color: "#22C55E", fontWeight: 600 }}>+₦6,942</span>
          </div>
          <div style={{ width: 48, height: 4, borderRadius: 2, background: "#5BB5E0", marginTop: 8 }} />
        </div>

        {/* Toggle tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["overview", "income", "outcome"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                border: tab === t ? "1px solid #fff" : "1px solid rgba(255,255,255,0.15)",
                background: tab === t ? "rgba(255,255,255,0.1)" : "transparent",
                color: tab === t ? "#fff" : "rgba(255,255,255,0.4)",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
                fontFamily: "inherit",
                textTransform: "capitalize",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
          <MiniChart />
        </div>

        {/* Income / Outcome */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 14,
              padding: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Income</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>₦262,144</span>
              <span style={{ fontSize: "0.7rem", color: "#22C55E" }}>+69.42 ▲</span>
            </div>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 14,
              padding: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Outcome</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>₦65,536</span>
              <span style={{ fontSize: "0.7rem", color: "#EF4444" }}>-694.2 ▼</span>
            </div>
          </div>
        </div>

        {/* Budget ring */}
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              stroke="#5BB5E0"
              strokeWidth="6"
              strokeDasharray={`${0.72 * 2 * Math.PI * 30} ${2 * Math.PI * 30}`}
              strokeLinecap="round"
              transform="rotate(-90 36 36)"
            />
            <text x="36" y="34" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="700" fontFamily="var(--font-poppins), sans-serif">72%</text>
            <text x="36" y="46" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="var(--font-poppins), sans-serif">Budget used</text>
          </svg>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>Monthly Budget</p>
            <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.45)", fontSize: "0.8rem" }}>₦94,000 of ₦150,000 · 12 days left</p>
            <a href="/budget" style={{ color: "#5BB5E0", fontSize: "0.8rem", textDecoration: "none", fontWeight: 600, marginTop: 6, display: "inline-block" }}>View Budget →</a>
          </div>
        </div>

        {/* Recent Transactions */}
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12, color: "rgba(255,255,255,0.8)" }}>Recent Transactions</h2>
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
                <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem" }}>{item.label}</p>
                <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>{item.sub}</p>
              </div>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: item.color }}>{item.amount}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/report-fraud" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 18px", color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: "0.8rem", textDecoration: "none" }}>
            🚨 Report Fraud
          </a>
          <a href="/contact-support" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 18px", color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: "0.8rem", textDecoration: "none" }}>
            💬 Support
          </a>
          <a href="/settings" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 18px", color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: "0.8rem", textDecoration: "none" }}>
            ⚙️ Settings
          </a>
        </div>
      </div>

      {/* FAB */}
      <a
        href="/account"
        style={{
          position: "fixed",
          bottom: 90,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#E74C3C",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.6rem",
          fontWeight: 700,
          boxShadow: "0 4px 20px rgba(231,76,60,0.4)",
          textDecoration: "none",
          zIndex: 40,
        }}
        title="Add Money"
      >
        +
      </a>
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
