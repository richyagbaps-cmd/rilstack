"use client";

import React, { useEffect, useRef, useState } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";

// Set inactivity timeout to 30 minutes (max allowed)
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoggedOutRef = useRef(false);
  const [showLogoutMsg, setShowLogoutMsg] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !session) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      hasLoggedOutRef.current = false;
      return;
    }

    const logoutNow = async () => {
      if (hasLoggedOutRef.current) return;
      hasLoggedOutRef.current = true;
      setShowLogoutMsg(true);
      setTimeout(async () => {
        setShowLogoutMsg(false);
        await signOut({ callbackUrl: "/" });
      }, 2500);
    };

    const resetInactivityTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        void logoutNow();
      }, INACTIVITY_TIMEOUT_MS);
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];

    // Remove beforeunload logout so reload doesn't log out
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer, {
        passive: true,
      });
    });
    resetInactivityTimer();

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [session, status]);

  return (
    <>
      {showLogoutMsg && (
        <div
          style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999 }}
          className="bg-red-500 text-white text-center py-3 font-semibold shadow-lg animate-fade-in"
        >
          You have been logged out due to inactivity.
        </div>
      )}
      {children}
    </>
  );
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SessionGuard>{children}</SessionGuard>
    </SessionProvider>
  );
}
