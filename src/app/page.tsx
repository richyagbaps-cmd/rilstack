"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const features = [
  {
    icon: "📊",
    title: "Smart Budgeting",
    desc: "Strict or relaxed budgets with spending pockets. AI allocates your income using 50/30/20, zero‑based, or custom rules.",
  },
  {
    icon: "🔒",
    title: "Savings with Safe Locks",
    desc: "Earn daily interest. Lock money away until a future date — no early access.",
  },
  {
    icon: "📈",
    title: "Automated Investments",
    desc: "Admin‑managed investment products. Your returns are calculated and paid automatically at maturity.",
  },
  {
    icon: "🛡️",
    title: "Nigerian KYC & Security",
    desc: "Full compliance. Biometric login, fraud reporting, and bank‑level encryption.",
  },
];

const steps = [
  { num: "1", text: "Sign up with email or Google — complete KYC in 3 minutes." },
  { num: "2", text: "Choose Budget, Savings, or Investments — AI guides you." },
  { num: "3", text: "Start stacking — watch your money grow daily." },
];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%)" }}>
        <p style={{ color: "#1A5F7A", fontSize: "1.1rem" }}>Loading...</p>
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%)", fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar — logo only, no nav */}
      <div style={{ display: "flex", justifyContent: "center", padding: "24px 0 0" }}>
        <img
          src="/images/rilstack-logo.png"
          alt="Rilstack"
          style={{ height: 48, width: 48, borderRadius: 16, background: "#fff", boxShadow: "0 2px 8px #1A5F7A22" }}
        />
      </div>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "48px 24px 32px", maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: "#1A5F7A", lineHeight: 1.2, marginBottom: 16 }}>
          Stack Your Finances, One Layer at a Time.
        </h1>
        <p style={{ fontSize: "1.15rem", color: "#4A5F7A", lineHeight: 1.6, marginBottom: 32 }}>
          AI budgets, daily interest savings, automated investments — all in one place.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="/login"
            style={{
              background: "#1A5F7A",
              color: "#fff",
              padding: "14px 36px",
              borderRadius: 16,
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(26,95,122,0.25)",
              transition: "transform 0.15s",
            }}
          >
            Login
          </a>
          <a
            href="/signup"
            style={{
              background: "transparent",
              color: "#1A5F7A",
              padding: "14px 36px",
              borderRadius: 16,
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              border: "2px solid #1A5F7A",
              transition: "transform 0.15s",
            }}
          >
            Sign Up
          </a>
        </div>
      </section>

      {/* Feature Highlights */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "28px 24px",
                boxShadow: "0 4px 16px rgba(26,95,122,0.08), 2px 2px 0 rgba(244,162,97,0.12)",
                border: "1.5px solid #F0F2F5",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1A5F7A", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: "0.92rem", color: "#4A5F7A", lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 56px" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: 700, color: "#1A5F7A", marginBottom: 28 }}>How It Works</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {steps.map((s) => (
            <div key={s.num} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div
                style={{
                  minWidth: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#1A5F7A",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  flexShrink: 0,
                }}
              >
                {s.num}
              </div>
              <p style={{ fontSize: "1.05rem", color: "#2c3e5f", lineHeight: 1.5, margin: 0, paddingTop: 8 }}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "24px 16px 32px", borderTop: "1px solid #E9EDF2" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 12 }}>
          <a href="/terms" style={{ color: "#6C757D", fontSize: "0.85rem", textDecoration: "none" }}>Terms &amp; Conditions</a>
          <a href="/privacy" style={{ color: "#6C757D", fontSize: "0.85rem", textDecoration: "none" }}>Privacy Policy</a>
          <a href="/contact-support" style={{ color: "#6C757D", fontSize: "0.85rem", textDecoration: "none" }}>Contact Support</a>
        </div>
        <p style={{ color: "#6C757D", fontSize: "0.8rem", margin: 0 }}>© 2026 Rilstack.xyz — Stack your finances.</p>
      </footer>
    </main>
  );
}
