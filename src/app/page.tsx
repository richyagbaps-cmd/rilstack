'use client';

import { useEffect, useState } from 'react';
import AccountBalance from '@/components/AccountBalance';
import AIChatbot from '@/components/AIChatbot';
import BudgetModeSelector from '@/components/BudgetModeSelector';
import BudgetSection from '@/components/BudgetSection';
import Dashboard from '@/components/Dashboard';
import InvestmentPortfolio from '@/components/InvestmentPortfolio';
import Navigation from '@/components/Navigation';
import NinValidation from '@/components/NinValidation';
import UserProfile from '@/components/UserProfile';

export default function Home() {
  const [currentSection, setCurrentSection] = useState<
    'dashboard' | 'budget' | 'investments' | 'account' | 'nin-validation'
  >('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const [showChatbot, setShowChatbot] = useState(true);
  const [budgetMode, setBudgetMode] = useState<'strict' | 'relaxed' | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('budgetMode');
    const chatbotTimer = window.setTimeout(() => {
      setShowChatbot(false);
    }, 1000);

    if (savedMode === 'strict' || savedMode === 'relaxed') {
      setBudgetMode(savedMode);
    }

    setIsLoaded(true);

    return () => {
      window.clearTimeout(chatbotTimer);
    };
  }, []);

  const handleModeSelect = (mode: 'strict' | 'relaxed') => {
    setBudgetMode(mode);
    localStorage.setItem('budgetMode', mode);
  };

  const handleChangeBudgetMode = () => {
    localStorage.removeItem('budgetMode');
    setBudgetMode(null);
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-slate-950"></div>;
  }

  if (currentSection === 'budget' && budgetMode === null) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navigation
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
          onProfileClick={() => setShowProfile(true)}
          budgetMode={budgetMode}
          onChangeBudgetMode={handleChangeBudgetMode}
        />
        <main className="container mx-auto px-4 py-8">
          <BudgetModeSelector onModeSelect={handleModeSelect} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
        onProfileClick={() => setShowProfile(true)}
        budgetMode={budgetMode}
        onChangeBudgetMode={handleChangeBudgetMode}
      />
      <main className="container mx-auto px-3 py-6 md:px-4 md:py-8">
        {currentSection === 'dashboard' && <Dashboard />}
        {currentSection === 'budget' && budgetMode && <BudgetSection budgetMode={budgetMode} />}
        {currentSection === 'investments' && <InvestmentPortfolio />}
        {currentSection === 'account' && <AccountBalance />}
        {currentSection === 'nin-validation' && <NinValidation />}
      </main>

      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}

      <div className="fixed bottom-0 left-0 z-40 flex items-end gap-3 p-3 md:gap-4 md:p-4">
        {showChatbot ? (
          <AIChatbot onClose={() => setShowChatbot(false)} />
        ) : (
          <button
            onClick={() => setShowChatbot(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-xs font-semibold text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl md:h-16 md:w-16 md:text-sm"
            title="Open AI Assistant"
          >
            Chat
          </button>
        )}
      </div>
    </div>
  );
}
