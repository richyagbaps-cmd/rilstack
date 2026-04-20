"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const features = [
  { icon: "📊", title: "Smart Budgeting", desc: "AI allocates your income with 50/30/20, zero-based, or custom rules." },
  { icon: "🔒", title: "Safe Lock Savings", desc: "Earn daily interest. Lock money until a target date — no early access." },
  { icon: "📈", title: "Auto Investments", desc: "Admin-managed products. Returns calculated and paid at maturity." },
  { icon: "🛡️", title: "Bank-Level Security", desc: "Full KYC, biometric login, fraud reporting, and encryption." },
];

const steps = [
  { num: "1", text: "Sign up with email or Google — complete KYC in 3 minutes." },
  { num: "2", text: "Pick Budget, Savings, or Investments — AI guides you." },
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B1120" }}>
        <p style={{ color: "#5BB5E0", fontSize: "1.1rem", fontFamily: "var(--font-poppins), sans-serif" }}>Loading...</p>
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0B1120",
        fontFamily: "var(--font-poppins), sans-serif",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gradient blob shapes */}
      <div style={{ position: "absolute", top: -80, left: -60, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, #1A5F7A 0%, #0B1120 70%)", opacity: 0.7, filter: "blur(40px)", zIndex: 0 }} />
      <div style={{ position: "absolute", top: 200, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, #5BB5E0 0%, #0B1120 70%)", opacity: 0.45, filter: "blur(50px)", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: 100, left: "30%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, #1A5F7A 0%, #0B1120 70%)", opacity: 0.35, filter: "blur(60px)", zIndex: 0 }} />

      {/* All content */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Hero */}
        <section style={{ textAlign: "center", padding: "60px 24px 40px", maxWidth: 600, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(2rem, 6vw, 3rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16, color: "#fff" }}>
            Stack Your Finances,<br />One Layer at a Time.
          </h1>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: 36, maxWidth: 420, margin: "0 auto 36px" }}>
            AI budgets, daily interest savings, automated investments — all in one place.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/signup"
              style={{
                background: "#E74C3C",
                color: "#fff",
                padding: "15px 40px",
                borderRadius: 14,
                fontWeight: 700,
                fontSize: "1.05rem",
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(231,76,60,0.35)",
              }}
            >
              Get Started
            </a>
            <a
              href="/login"
              style={{
                background: "transparent",
                color: "#fff",
                padding: "15px 40px",
                borderRadius: 14,
                fontWeight: 700,
                fontSize: "1.05rem",
                textDecoration: "none",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              Login
            </a>
          </div>
        </section>

        {/* Feature Cards */}
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 48px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  padding: "24px 20px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2.2rem", marginBottom: 10 }}>{f.icon}</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section style={{ maxWidth: 560, margin: "0 auto", padding: "0 20px 56px" }}>
          <h2 style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: 28 }}>How It Works</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {steps.map((s) => (
              <div key={s.num} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div
                  style={{
                    minWidth: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: "#E74C3C",
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
                <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.5, margin: 0, paddingTop: 8 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section style={{ textAlign: "center", padding: "32px 24px 48px" }}>
          <p style={{ fontSize: "1.15rem", fontWeight: 600, color: "#fff", marginBottom: 20 }}>
            Ready to take control of your money?
          </p>
          <a
            href="/signup"
            style={{
              background: "#E74C3C",
              color: "#fff",
              padding: "15px 48px",
              borderRadius: 14,
              fontWeight: 700,
              fontSize: "1.05rem",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(231,76,60,0.35)",
            }}
          >
            Create Free Account
          </a>
        </section>

        {/* Footer */}
        <footer style={{ textAlign: "center", padding: "20px 16px 28px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 10 }}>
            <a href="/terms" style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", textDecoration: "none" }}>Terms</a>
            <a href="/privacy" style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", textDecoration: "none" }}>Privacy</a>
            <a href="/contact-support" style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", textDecoration: "none" }}>Support</a>
          </div>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", margin: 0 }}>© 2026 Rilstack.xyz — Stack your finances.</p>
        </footer>
      </div>
    </main>
  );
}