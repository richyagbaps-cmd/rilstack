"use client";

import { Suspense } from "react";
import AccountBalance from "@/components/AccountBalance";

function DashboardContent() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8f9fc", padding: "2rem 0" }}>
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-3xl font-bold mb-6 text-[#1A5F7A]">Dashboard</h1>
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
