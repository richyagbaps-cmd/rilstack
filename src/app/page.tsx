"use client";

import { Suspense } from "react";
import AccountBalance from "@/components/AccountBalance";


function DashboardContent() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8f9fc", padding: "2rem 0" }}>
      <div className="container mx-auto max-w-4xl px-4">
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
        <AccountBalance />
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
