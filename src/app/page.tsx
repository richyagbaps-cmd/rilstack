"use client";


export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8f9fc", padding: "2rem 0" }}>
      <div className="container mx-auto max-w-3xl px-4">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <img
            src="/images/rilstack-logo.png"
            alt="Rilstack Logo"
            style={{ height: 60, width: 60, borderRadius: 20, background: "#fff", boxShadow: "0 2px 8px #1A5F7A22", marginBottom: 12 }}
          />
          <span
            style={{
              fontSize: "2.2rem",
              fontWeight: 900,
              fontFamily: "'Inter', sans-serif",
              background: "linear-gradient(135deg, #1A5F7A, #F4A261)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: 1,
              marginBottom: 8,
              display: "inline-block",
            }}
          >
            RILSTACK<span style={{ fontSize: "1.1rem" }}>.xyz</span>
          </span>
        </div>
        <section style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#1A5F7A", marginBottom: 16 }}>
            Next‑Gen Personal Finance
          </h1>
          <p style={{ fontSize: "1.2rem", color: "#4A5F7A", marginBottom: 24 }}>
            Rilstack helps you save, budget, and invest with AI-powered tools, daily interest, safe locks, team savings, and more. Experience a modern, secure, and rewarding way to manage your money.
          </p>
        </section>
        <section style={{ background: "#fff", borderRadius: 20, boxShadow: "0 2px 8px #1A5F7A11", padding: 32, marginBottom: 32 }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#F4A261", marginBottom: 16 }}>What We Do</h2>
          <ul style={{ textAlign: "left", fontSize: "1.1rem", color: "#2c3e5f", lineHeight: 1.7 }}>
            <li><b>Budgeting:</b> Smart, AI-allocated budgets and spending insights.</li>
            <li><b>Savings:</b> Daily interest, safe locks, round-ups, and team vaults.</li>
            <li><b>Investments:</b> Fixed returns, auto-managed portfolios, and fractional investing.</li>
            <li><b>Security:</b> Bank-level encryption and real-time fraud monitoring.</li>
          </ul>
        </section>
        <section style={{ background: "#F8F9FA", borderRadius: 20, padding: 32, textAlign: "center" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1A5F7A", marginBottom: 16 }}>How It Works</h2>
          <ol style={{ textAlign: "left", maxWidth: 600, margin: "0 auto", fontSize: "1.1rem", color: "#2c3e5f", lineHeight: 1.7 }}>
            <li><b>Sign Up:</b> Create your secure account in seconds.</li>
            <li><b>Set Goals:</b> Define your savings, budgets, and investment targets.</li>
            <li><b>Automate:</b> Let Rilstack's AI optimize your allocations and track your progress.</li>
            <li><b>Grow:</b> Watch your money work for you with daily interest and smart investments.</li>
          </ol>
        </section>
      </div>
    </main>
  );
}
