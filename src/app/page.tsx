"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const u = session?.user as any;
      const profileComplete = u?.profileComplete;
      const dashboardAccessGranted = u?.dashboardAccessGranted;
      // Block only when profile is explicitly incomplete AND access was NOT granted
      if (profileComplete === false && dashboardAccessGranted !== true) {
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
