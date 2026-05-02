"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const profileComplete = (session?.user as any)?.profileComplete;
      if (!profileComplete) {
        router.replace("/profile/complete");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [status, router, session]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060B1E] text-[#F0F4FF]">
        <p className="text-sm font-semibold tracking-wide">Loading Rilstack...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#060B1E]">
      <iframe
        src="/rilstack-homepage.html"
        title="Rilstack Homepage"
        className="h-screen w-full border-0"
      />
    </main>
  );
}
