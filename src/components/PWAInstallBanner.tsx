"use client";
import { useEffect, useState } from "react";

type Platform = "ios" | "android" | "desktop" | null;

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

export default function PWAInstallBanner() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isInStandaloneMode()) return;
    if (sessionStorage.getItem("pwa_banner_dismissed")) return;

    const p = detectPlatform();
    setPlatform(p);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // For iOS/desktop where beforeinstallprompt doesn't fire, show after 5s
    if (p === "ios") {
      const t = setTimeout(() => setShow(true), 5000);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        clearTimeout(t);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      (deferredPrompt as { prompt: () => void }).prompt();
    }
    dismiss();
  };

  const dismiss = () => {
    sessionStorage.setItem("pwa_banner_dismissed", "1");
    setDismissed(true);
    setShow(false);
  };

  if (!show || dismissed) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: 440,
        background: "#131A2E",
        border: "1px solid rgba(91,181,224,0.3)",
        borderRadius: 16,
        padding: "14px 16px",
        zIndex: 9999,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: "var(--font-poppins), sans-serif",
      }}
    >
      {/* Logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/rilstack-logo.png"
        alt="Rilstack"
        style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }}
      />
      {/* Text */}
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: "0.88rem", color: "#fff" }}>
          Add Rilstack to your {platform === "ios" ? "Home Screen" : platform === "android" ? "Home Screen" : "Desktop"}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#9CA3AF", lineHeight: 1.4 }}>
          {platform === "ios"
            ? 'Tap the Share icon below, then "Add to Home Screen" for the full app experience.'
            : platform === "android"
            ? 'Tap "Install" to add Rilstack to your home screen.'
            : 'Click "Install" to get the full desktop app experience.'}
        </p>
      </div>
      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
        {platform !== "ios" ? (
          <button
            onClick={handleInstall}
            style={{
              background: "#5BB5E0",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "7px 14px",
              fontWeight: 700,
              fontSize: "0.8rem",
              cursor: "pointer",
              fontFamily: "var(--font-poppins), sans-serif",
            }}
          >
            Install
          </button>
        ) : null}
        <button
          onClick={dismiss}
          style={{
            background: "transparent",
            color: "#9CA3AF",
            border: "none",
            fontSize: "0.75rem",
            cursor: "pointer",
            padding: "4px 6px",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
