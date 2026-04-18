"use client";

import ThreeDHome from "@/components/ThreeDHome";
import Head from "next/head";


export default function Home() {
  return (
    <div style={{ minHeight: "100vh", width: "100vw", overflow: "hidden", position: "relative", fontFamily: "'Inter', sans-serif", color: "white", background: "#050b17" }}>
      <Head>
        <title>Rilstack.xyz | Next‑Gen Fintech — Save, Budget, Invest</title>
        <meta name="description" content="Experience the future of personal finance with an immersive 3D interactive platform. Save, budget, and invest like never before." />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </Head>
      <ThreeDHome />
      <div className="content" style={{ position: "relative", zIndex: 10, pointerEvents: "auto" }}>
        <nav style={{ position: "fixed", top: 20, left: "5%", right: "5%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 2rem", background: "rgba(10, 20, 40, 0.6)", backdropFilter: "blur(12px)", borderRadius: 60, border: "1px solid rgba(79, 172, 254, 0.3)", zIndex: 100, boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }}>
          <div className="logo" style={{ fontSize: "1.8rem", fontWeight: 800, background: "linear-gradient(135deg, #fff, #6bc5ff)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>RILSTACK<span style={{ fontSize: "0.9rem" }}>.xyz</span></div>
          <div className="nav-links" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <a href="#">Home</a>
            <a href="#">Platform</a>
            <a href="#">Pricing</a>
            <a href="#">Insights</a>
            <button className="btn-outline" style={{ background: "transparent", border: "1.5px solid rgba(79,172,254,0.7)", padding: "0.5rem 1.3rem", borderRadius: 40, fontWeight: 600, color: "#6bc5ff", cursor: "pointer" }} onClick={() => alert("🔐 Launching Rilstack App — Secure, intuitive, and packed with next-gen features.")}>Launch App</button>
          </div>
        </nav>
        <div className="hero" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "4.5rem", fontWeight: 800, background: "linear-gradient(135deg, #fff, #a0e0ff, #3e8eff)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", marginBottom: "1rem" }}>Save. Budget. Invest.<br />Your wealth, 3D powered.</h1>
          <p style={{ fontSize: "1.2rem", maxWidth: 600, marginBottom: "2rem", color: "#cce4ff" }}>Rilstack fuses AI, real-time analytics & immersive design — take control of your financial future.</p>
          <div className="cta-group" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button className="btn-primary" style={{ background: "linear-gradient(105deg, #2b6ef0, #1645b0)", border: "none", padding: "0.9rem 2rem", borderRadius: 60, fontWeight: 700, color: "white", cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }} onClick={() => alert("🚀 Rilstack: Start your journey — AI savings, smart budgets, and dynamic investing.")}>Get Started</button>
            <button className="btn-secondary" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(4px)", border: "1px solid rgba(79,172,254,0.6)", padding: "0.9rem 2rem", borderRadius: 60, fontWeight: 600, color: "#e0f0ff", cursor: "pointer" }} onClick={() => alert("✨ Explore Rilstack's immersive financial dashboard, real-time analytics & portfolio tools.")}>Explore Ecosystem</button>
          </div>
        </div>
        <div className="features" style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", padding: "4rem 2rem", background: "linear-gradient(180deg, rgba(5,15,30,0.7), rgba(1,5,15,0.9))", backdropFilter: "blur(10px)" }}>
          <div className="card" style={{ background: "rgba(20, 35, 65, 0.6)", backdropFilter: "blur(12px)", borderRadius: 32, padding: "2rem", width: 280, textAlign: "center", border: "1px solid rgba(79,172,254,0.3)", transition: "0.3s" }}>
            <i className="fas fa-piggy-bank" style={{ color: "#4cd964", fontSize: "3rem", marginBottom: "1rem", display: "inline-block" }}></i>
            <h3 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Save</h3>
            <p style={{ color: "#bfd9ff" }}>Automated vaults, high-yield goals & round-ups.</p>
          </div>
          <div className="card" style={{ background: "rgba(20, 35, 65, 0.6)", backdropFilter: "blur(12px)", borderRadius: 32, padding: "2rem", width: 280, textAlign: "center", border: "1px solid rgba(79,172,254,0.3)", transition: "0.3s" }}>
            <i className="fas fa-chart-pie" style={{ color: "#ffb347", fontSize: "3rem", marginBottom: "1rem", display: "inline-block" }}></i>
            <h3 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Budget</h3>
            <p style={{ color: "#bfd9ff" }}>Real-time tracking, AI insights & smart alerts.</p>
          </div>
          <div className="card" style={{ background: "rgba(20, 35, 65, 0.6)", backdropFilter: "blur(12px)", borderRadius: 32, padding: "2rem", width: 280, textAlign: "center", border: "1px solid rgba(79,172,254,0.3)", transition: "0.3s" }}>
            <i className="fas fa-chart-line" style={{ color: "#3e8eff", fontSize: "3rem", marginBottom: "1rem", display: "inline-block" }}></i>
            <h3 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Invest</h3>
            <p style={{ color: "#bfd9ff" }}>Fractional investing, personalized portfolios.</p>
          </div>
        </div>
        <div className="footer" style={{ textAlign: "center", padding: "2rem", fontSize: "0.8rem", color: "#7a9bcb", borderTop: "1px solid rgba(79,172,254,0.2)", background: "rgba(1,5,15,0.8)" }}>
          <p>© 2025 Rilstack.xyz — Security meets innovation</p>
        </div>
      </div>
    </div>
  );
}
