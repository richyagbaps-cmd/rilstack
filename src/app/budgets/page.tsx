"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BudgetsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/budgets/budget");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] p-8">
      <p className="text-[#4A5B6E]">Opening budget options...</p>
    </div>
  );
}
