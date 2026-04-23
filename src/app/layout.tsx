"use client";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
// Commented out Google fonts to fix Turbopack build blocker
// import { Inter, Poppins } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import { PrivacyProvider } from "@/components/PrivacyContext";
import OnboardingModal from "@/components/OnboardingModal";
import PushNotificationPrompt from "@/components/PushNotificationPrompt";
import AppFooter from "@/components/AppFooter";
import Navigation from "@/components/Navigation";
import TopBarNavigation from "@/components/TopBarNavigation";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import SplashScreen from "@/components/SplashScreen";
import { useSession, signOut } from "next-auth/react";
import React from "react";
import "../styles/globals.css";

// Commented out Google fonts to fix Turbopack build blocker
// const inter = Inter({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700", "800"],
// });
//
// const poppins = Poppins({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700", "800"],
//   variable: "--font-poppins",
// });

function AuthContentWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  if (status !== "authenticated" || !session) return <>{children}</>;
  return (
    <>
      <TopBarNavigation />
      {children}
      <Navigation />
    </>
  );
}

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(true);

  // Onboarding check
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("rilstack_onboarding_complete");
      if (!seen) setShowOnboarding(true);
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 900);
    return () => clearTimeout(timer);
  }, []);

  // Auto-logout after 10 minutes of inactivity
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        signOut({ callbackUrl: "/" });
      }, INACTIVITY_TIMEOUT);
    };
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []);

  const handleOnboardingClose = () => {
    localStorage.setItem("rilstack_onboarding_complete", "1");
    setShowOnboarding(false);
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/rilstack-logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Rilstack" />
        <meta name="theme-color" content="#0B1120" />
        <meta name="application-name" content="Rilstack" />
        <meta name="msapplication-TileColor" content="#0B1120" />
        <meta name="msapplication-TileImage" content="/icons/rilstack-logo.png" />
      </head>
      <body className="">
        {showSplash ? <SplashScreen /> : null}
        {/* ThemeToggle removed: app is always light mode */}
        <PrivacyProvider>
          <AuthProvider>
            <AuthContentWrapper>
              {children}
            </AuthContentWrapper>
          </AuthProvider>
        </PrivacyProvider>
        <AppFooter />
        <PWAInstallBanner />
        <OnboardingModal
          open={showOnboarding}
          onClose={handleOnboardingClose}
        />
        <PushNotificationPrompt />
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
