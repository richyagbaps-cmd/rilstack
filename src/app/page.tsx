"use client";

import ThreeDHome from "@/components/ThreeDHome";
import Head from "next/head";
import dynamic from "next/dynamic";

const SeaTableDemo = dynamic(() => import("@/components/SeaTableDemo"), {
  ssr: false,
});

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Inter', sans-serif",
        color: "white",
        background: "#050b17",
      }}
    >
      <Head>
        <title>Rilstack.xyz | Next‑Gen Fintech — Save, Budget, Invest</title>
        <meta
          name="description"
          content="Experience the future of personal finance with an immersive 3D interactive platform. Save, budget, and invest like never before."
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
      </Head>
      <ThreeDHome />
      <div
        className="content"
        style={{ position: "relative", zIndex: 10, pointerEvents: "auto", fontFamily: "'Inter', sans-serif" }}
      >
        <nav
          style={{
            position: "fixed",
            top: 20,
            left: "5%",
            right: "5%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.8rem 2rem",
            background: "rgba(10, 20, 40, 0.7)",
            backdropFilter: "blur(12px)",
            borderRadius: 16,
            border: "1.5px solid #1A5F7A",
            zIndex: 100,
            boxShadow: "0 6px 24px 0 rgba(26,95,122,0.13), 0 1.5px 0 #F4A261 inset",
          }}
        >
          <div className="logo" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src="/images/rilstack-logo.png"
              alt="Rilstack Logo"
              style={{ height: 38, width: 38, marginRight: 8, borderRadius: 16, background: "#fff", boxShadow: "0 2px 8px #1A5F7A22" }}
            />
            <span
              style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                fontFamily: "'Inter', sans-serif",
                background: "linear-gradient(135deg, #1A5F7A, #F4A261)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                letterSpacing: 1,
              }}
            >
              RILSTACK<span style={{ fontSize: "0.9rem" }}>.xyz</span>
            </span>
          </div>
          <div
            className="nav-links"
            style={{ display: "flex", gap: "2rem", alignItems: "center" }}
          >
            <button
              className="btn-outline"
              style={{
                background: "transparent",
                border: "2px solid #F4A261",
                padding: "0.5rem 1.3rem",
                borderRadius: 16,
                fontWeight: 600,
                color: "#F4A261",
                cursor: "pointer",
                boxShadow: "2px 2px 0 #F4A26155",
                fontFamily: "'Inter', sans-serif",
              }}
              onClick={() => (window.location.href = "/login")}
            >
              Launch App
            </button>
          </div>
        </nav>
        <div
          className="hero"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <h1
            style={{
              fontSize: "4.5rem",
              fontWeight: 800,
              fontFamily: "'Inter', sans-serif",
              background: "linear-gradient(135deg, #1A5F7A, #F4A261, #F8F9FA)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: "1rem",
              borderRadius: 16,
              boxShadow: "0 4px 16px #1A5F7A22",
              padding: "0.5rem 1.5rem 0.5rem 1.5rem",
              display: "inline-block",
            }}
          >
            Next‑Gen Personal Finance
          </h1>
          <p
            style={{
              fontSize: "1.3rem",
              color: "#bfd9ff",
              maxWidth: 700,
              margin: "0 auto 2.5rem auto",
            }}
          >
            Experience AI‑allocated budgets, daily interest on savings, safe
            locks, spending pockets, team savings, and investment opportunities
            (fixed returns, auto‑managed).
          </p>
          <div
            className="cta-group"
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: 12,
            }}
          >
            <button
              className="btn-primary"
              style={{
                background: "linear-gradient(105deg, #1A5F7A, #F4A261)",
                border: "none",
                padding: "0.9rem 2rem",
                borderRadius: 16,
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
                boxShadow: "2px 2px 0 #1A5F7A55",
                fontFamily: "'Inter', sans-serif",
              }}
              onClick={() => (window.location.href = "/login")}
            >
              Login
            </button>
            <button
              className="btn-outline"
              style={{
                background: "transparent",
                border: "2px solid #1A5F7A",
                padding: "0.9rem 2rem",
                borderRadius: 16,
                fontWeight: 700,
                color: "#1A5F7A",
                cursor: "pointer",
                boxShadow: "2px 2px 0 #1A5F7A33",
                fontFamily: "'Inter', sans-serif",
              }}
              onClick={() => (window.location.href = "/signup")}
            >
              Sign Up
            </button>
          </div>
          <div
            style={{
              marginTop: "2.5rem",
              color: "#ffb347",
              fontWeight: 600,
              fontSize: "1.1rem",
            }}
          >
            <span>Access to features requires authentication.</span>
          </div>
        </div>
          <div
            className="features"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2rem",
              flexWrap: "wrap",
              padding: "4rem 2rem",
              background:
                "linear-gradient(180deg, #F8F9FA 0%, rgba(5,15,30,0.7) 100%)",
              backdropFilter: "blur(10px)",
            }}
          >
          <div
            className="card"
            style={{
              background: "#fff",
              boxShadow: "0 4px 16px #1A5F7A22, 2px 2px 0 #F4A26133",
              borderRadius: 16,
              padding: "2rem",
              width: 280,
              textAlign: "center",
              border: "1.5px solid #F8F9FA",
              transition: "0.3s",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <i
              className="fas fa-piggy-bank"
              style={{
                color: "#2E7D32",
                fontSize: "3rem",
                marginBottom: "1rem",
                display: "inline-block",
                filter: "drop-shadow(2px 2px 0 #1A5F7A22)",
              }}
            ></i>
            <h3 style={{ fontSize: "1.8rem", marginBottom: "0.5rem", color: "#1A5F7A", fontWeight: 700 }}>Save</h3>
            <p style={{ color: "#212529" }}>
              Automated vaults, high-yield goals & round-ups.
            </p>
          </div>
          <div
            className="card"
            style={{
              background: "#fff",
              boxShadow: "0 4px 16px #1A5F7A22, 2px 2px 0 #F4A26133",
              borderRadius: 16,
              padding: "2rem",
              width: 280,
              textAlign: "center",
              border: "1.5px solid #F8F9FA",
              transition: "0.3s",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <i
              className="fas fa-chart-pie"
              style={{
                color: "#F4A261",
                fontSize: "3rem",
                marginBottom: "1rem",
                display: "inline-block",
                filter: "drop-shadow(2px 2px 0 #1A5F7A22)",
              }}
            ></i>
            <h3 style={{ fontSize: "1.8rem", marginBottom: "0.5rem", color: "#F4A261", fontWeight: 700 }}>Budget</h3>
            <p style={{ color: "#212529" }}>
              Real-time tracking, AI insights & smart alerts.
            </p>
          </div>
          <div
            className="card"
            style={{
              background: "#fff",
              boxShadow: "0 4px 16px #1A5F7A22, 2px 2px 0 #F4A26133",
              borderRadius: 16,
              padding: "2rem",
              width: 280,
              textAlign: "center",
              border: "1.5px solid #F8F9FA",
              transition: "0.3s",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <i
              className="fas fa-chart-line"
              style={{
                color: "#1A5F7A",
                fontSize: "3rem",
                marginBottom: "1rem",
                display: "inline-block",
                filter: "drop-shadow(2px 2px 0 #F4A26133)",
              }}
            ></i>
            <h3 style={{ fontSize: "1.8rem", marginBottom: "0.5rem", color: "#1A5F7A", fontWeight: 700 }}>Invest</h3>
            <p style={{ color: "#212529" }}>
              Fractional investing, personalized portfolios.
            </p>
          </div>
        </div>
        <div
          className="footer"
          style={{
            textAlign: "center",
            padding: "2rem",
            fontSize: "0.8rem",
            color: "#212529",
            borderTop: "1.5px solid #F8F9FA",
            background: "#fff",
            borderRadius: "16px 16px 0 0",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <p>© 2025 Rilstack.xyz — Security meets innovation</p>
        </div>
      </div>
      {/* SeaTable CRUD Demo (for testing) */}
      <div style={{ position: "relative", zIndex: 1000 }}>
        <SeaTableDemo />
      </div>
    </div>
  );
}
