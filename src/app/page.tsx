"use client";


export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8f9fc", padding: "2rem 0" }}>
      <div className="container mx-auto max-w-3xl px-4">
        <section style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#1A5F7A", marginBottom: 16 }}>
            Next‑Gen Personal Finance
          </h1>
          <p style={{ fontSize: "1.2rem", color: "#4A5F7A", marginBottom: 24 }}>
            Rilstack helps you save, budget, and invest with AI-powered tools, daily interest, safe locks, team savings, and more. Experience a modern, secure, and rewarding way to manage your money.
          </p>
        </section>
        <section style={{ background: "#F8F9FA", borderRadius: 20, padding: 32, textAlign: "center" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1A5F7A", marginBottom: 16 }}>How It Works</h2>
          <ol style={{ textAlign: "left", maxWidth: 600, margin: "0 auto", fontSize: "1.1rem", color: "#2c3e5f", lineHeight: 1.7 }}>
            <li><b>Sign Up:</b> Create your secure account in seconds.</li>
            <li><b>Set Goals:</b> Define your savings, budgets, and investment targets.</li>
            <li><b>Automate:</b> Let Rilstack&#39;s AI optimize your allocations and track your progress.</li>
            <li><b>Grow:</b> Watch your money work for you with daily interest and smart investments.</li>
          </ol>
        </section>
      </div>
    </main>
  );
}
