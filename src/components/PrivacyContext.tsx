import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PrivacyContextType {
  privacyMode: boolean;
  setPrivacyMode: (val: boolean) => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function usePrivacy() {
  const ctx = useContext(PrivacyContext);
  if (!ctx) throw new Error('usePrivacy must be used within PrivacyProvider');
  return ctx;
}

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [privacyMode, setPrivacyMode] = useState(false);
  return (
    <PrivacyContext.Provider value={{ privacyMode, setPrivacyMode }}>
      {children}
    </PrivacyContext.Provider>
  );
}
