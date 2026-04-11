"use client";
import type { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/next";
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/AuthProvider';
import OnboardingModal from '@/components/OnboardingModal';
import SplashScreen from '@/components/SplashScreen';
import PushNotificationPrompt from '@/components/PushNotificationPrompt';
import AppFooter from '@/components/AppFooter';
// import ThemeToggle from '@/components/ThemeToggle';
import React, { useEffect, useState } from 'react';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800'] });


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('rilstack_onboarding_complete');
      if (!seen) setShowOnboarding(true);
    }
    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingClose = () => {
    localStorage.setItem('rilstack_onboarding_complete', '1');
    setShowOnboarding(false);
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        {showSplash && <SplashScreen />}
        {!showSplash && (
          <>
            {/* ThemeToggle removed: app is always light mode */}
            <AuthProvider>{children}</AuthProvider>
            <AppFooter />
            <OnboardingModal open={showOnboarding} onClose={handleOnboardingClose} />
            <PushNotificationPrompt />
          </>
        )}
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
