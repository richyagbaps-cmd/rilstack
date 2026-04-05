'use client';

import React, { useEffect, useRef } from 'react';
import { SessionProvider, signOut, useSession } from 'next-auth/react';

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoggedOutRef = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session) {
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
      await signOut({ callbackUrl: '/' });
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
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
    ];

    const handleTabClose = () => {
      if (hasLoggedOutRef.current) return;
      hasLoggedOutRef.current = true;
      navigator.sendBeacon('/api/auth/logout-on-close');
    };

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer, { passive: true });
    });

    window.addEventListener('beforeunload', handleTabClose);
    resetInactivityTimer();

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });

      window.removeEventListener('beforeunload', handleTabClose);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [session, status]);

  return <>{children}</>;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionGuard>{children}</SessionGuard>
    </SessionProvider>
  );
}
