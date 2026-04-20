"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NetWorthHero from "@/app/NetWorthHero";
import DashboardCards from "@/components/DashboardCards";
import RecentActivity from "@/components/RecentActivity";

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8F9FA" }}>
        <p style={{ color: "#1A5F7A", fontSize: "1.1rem" }}>Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  const firstName = session.user?.name?.split(" ")[0] || "there";
  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <main style={{ minHeight: "100vh", background: "#F8F9FA", paddingBottom: 80 }}>
      <div className="container mx-auto max-w-4xl px-4 pt-6">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1A5F7A", margin: 0 }}>
              Hello, {firstName}!
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#6C757D", margin: 0 }}>{today}</p>
          </div>
          <button
            onClick={() => setPrivacyMode((p) => !p)}
            title={privacyMode ? "Show amounts" : "Hide amounts"}
            style={{
              background: "none",
              border: "1.5px solid #E9EDF2",
              borderRadius: 12,
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            {privacyMode ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Net Worth Hero */}
        <NetWorthHero />

        {/* Key Metric Cards */}
        <DashboardCards />

        {/* Active Budget Snapshot */}
        <section style={{ marginTop: 28 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "24px",
              boxShadow: "0 2px 8px rgba(26,95,122,0.06)",
              border: "1.5px solid #F0F2F5",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1A5F7A", marginBottom: 12 }}>Active Budget</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", border: "4px solid #F4A261", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#F4A261", fontSize: "0.85rem" }}>
                72%
              </div>
              <div>
                <p style={{ margin: 0, color: "#2c3e5f", fontWeight: 600 }}>₦94,000 of ₦150,000 spent</p>
                <p style={{ margin: 0, color: "#6C757D", fontSize: "0.85rem" }}>12 days remaining · Top: Food, Transport</p>
              </div>
            </div>
            <a href="/budget" style={{ display: "inline-block", marginTop: 12, color: "#1A5F7A", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
              View Budget →
            </a>
          </div>
        </section>

        {/* Savings Goals Snapshot */}
        <section style={{ marginTop: 20 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "24px",
              boxShadow: "0 2px 8px rgba(26,95,122,0.06)",
              border: "1.5px solid #F0F2F5",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1A5F7A", marginBottom: 12 }}>Top Savings Goal</h3>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: "#2c3e5f" }}>Emergency Fund</span>
                <span style={{ color: "#6C757D", fontSize: "0.85rem" }}>₦80,000 / ₦200,000</span>
              </div>
              <div style={{ background: "#E9EDF2", borderRadius: 8, height: 10, overflow: "hidden" }}>
                <div style={{ background: "#4A8B6E", height: "100%", width: "40%", borderRadius: 8 }} />
              </div>
              <p style={{ margin: "6px 0 0", color: "#6C757D", fontSize: "0.8rem" }}>🔒 Safe locked · +₦12.50 daily interest</p>
            </div>
            <a href="/savings" style={{ display: "inline-block", marginTop: 12, color: "#1A5F7A", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
              View Savings →
            </a>
          </div>
        </section>

        {/* Investments Snapshot */}
        <section style={{ marginTop: 20 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "24px",
              boxShadow: "0 2px 8px rgba(26,95,122,0.06)",
              border: "1.5px solid #F0F2F5",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1A5F7A", marginBottom: 12 }}>Investments</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: "#2c3e5f" }}>Total Invested</span>
              <span style={{ fontWeight: 700, color: "#1A5F7A" }}>₦50,000</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "#6C757D", fontSize: "0.85rem" }}>Expected Returns</span>
              <span style={{ color: "#4A8B6E", fontWeight: 600, fontSize: "0.85rem" }}>+₦6,250</span>
            </div>
            <a href="/investments" style={{ display: "inline-block", marginTop: 12, color: "#1A5F7A", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
              View Investments →
            </a>
          </div>
        </section>

        {/* Recent Transactions */}
        <RecentActivity />

        {/* Quick Actions */}
        <section style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/report-fraud" style={{ background: "#fff", border: "1.5px solid #E9EDF2", borderRadius: 14, padding: "12px 20px", color: "#2c3e5f", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
            🚨 Report Fraud
          </a>
          <a href="/contact-support" style={{ background: "#fff", border: "1.5px solid #E9EDF2", borderRadius: 14, padding: "12px 20px", color: "#2c3e5f", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
            💬 Help &amp; Support
          </a>
          <a href="/settings" style={{ background: "#fff", border: "1.5px solid #E9EDF2", borderRadius: 14, padding: "12px 20px", color: "#2c3e5f", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
            ⚙️ Settings
          </a>
        </section>
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
          background: "#F4A261",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.6rem",
          fontWeight: 700,
          boxShadow: "0 4px 16px rgba(244,162,97,0.4)",
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
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><p>Loading...</p></div>}>
      <DashboardContent />
    </Suspense>
  );
}
