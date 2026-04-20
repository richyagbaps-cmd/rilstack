"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
        <p style={{ color: "#5BB5E0", fontFamily: "var(--font-poppins), sans-serif" }}>Loading...</p>
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
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Gradient blob shapes */}
      <div
        style={{
          position: "absolute",
          top: -80,
          left: -60,
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "radial-gradient(circle, #1A5F7A 0%, #0B1120 70%)",
          opacity: 0.7,
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 60,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, #5BB5E0 0%, #0B1120 70%)",
          opacity: 0.5,
          filter: "blur(50px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: "30%",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "radial-gradient(circle, #1A5F7A 0%, #0B1120 70%)",
          opacity: 0.4,
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 28px 60px" }}>
        {/* Carousel dots */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          <div style={{ width: 24, height: 6, borderRadius: 3, background: "#fff" }} />
          <div style={{ width: 6, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.3)" }} />
          <div style={{ width: 6, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.3)" }} />
        </div>

        <h1 style={{ fontSize: "clamp(2rem, 6vw, 2.8rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
          The best way<br />to stack your<br />finances
        </h1>
        <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 36, maxWidth: 340 }}>
          AI budgets, daily interest savings, automated investments — all in one place.
        </p>

        <a
          href="/signup"
          style={{
            display: "inline-block",
            background: "#E74C3C",
            color: "#fff",
            padding: "16px 0",
            borderRadius: 14,
            fontWeight: 700,
            fontSize: "1.05rem",
            textAlign: "center",
            textDecoration: "none",
            width: "100%",
            maxWidth: 320,
            letterSpacing: 0.5,
          }}
        >
          Get Started
        </a>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", maxWidth: 320 }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#5BB5E0", textDecoration: "none", fontWeight: 600 }}>Login</a>
        </p>
      </div>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "16px 16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap", marginBottom: 8 }}>
          <a href="/terms" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", textDecoration: "none" }}>Terms</a>
          <a href="/privacy" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", textDecoration: "none" }}>Privacy</a>
          <a href="/contact-support" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", textDecoration: "none" }}>Support</a>
        </div>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem", margin: 0 }}>© 2026 Rilstack.xyz</p>
      </footer>
    </main>
  );
}