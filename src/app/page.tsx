'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import BudgetSection from '@/components/BudgetSection';
import InvestmentPortfolio from '@/components/InvestmentPortfolio';
import AccountBalance from '@/components/AccountBalance';
import UserProfile from '@/components/UserProfile';
import AIChatbot from '@/components/AIChatbot';
import NinValidation from '@/components/NinValidation';
import BudgetModeSelector from '@/components/BudgetModeSelector';

export default function Home() {
  const [currentSection, setCurrentSection] = useState<'dashboard' | 'budget' | 'investments' | 'account' | 'nin-validation'>('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const [showChatbot, setShowChatbot] = useState(true);
  const [budgetMode, setBudgetMode] = useState<'strict' | 'relaxed' | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load budget mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('budgetMode') as 'strict' | 'relaxed' | null;
    setBudgetMode(savedMode);
    setIsLoaded(true);
  }, []);

  const handleModeSelect = (mode: 'strict' | 'relaxed') => {
    setBudgetMode(mode);
    localStorage.setItem('budgetMode', mode);
  };

  const handleChangeBudgetMode = () => {
    localStorage.removeItem('budgetMode');
    setBudgetMode(null);
  };

  // Show loading state while data loads
  if (!isLoaded) {
    return <div className="min-h-screen bg-slate-950"></div>;
  }

  // If user clicks Budget & Savings with no mode selected, show mode selector
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
      <main className="container mx-auto px-4 py-8">
        {currentSection === 'dashboard' && <Dashboard />}
        {currentSection === 'budget' && <BudgetSection />}
        {currentSection === 'investments' && <InvestmentPortfolio />}
        {currentSection === 'account' && <AccountBalance />}
        {currentSection === 'nin-validation' && <NinValidation />}
      </main>
      
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}

      {/* Floating AI Chatbot at Bottom */}
      {showChatbot && (
        <div className="fixed bottom-0 right-0 z-40 flex items-end gap-4 p-4">
          <AIChatbot onClose={() => setShowChatbot(false)} />
          {!showChatbot && (
            <button
              onClick={() => setShowChatbot(true)}
              className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all text-2xl hover:scale-110"
              title="Open AI Assistant"
            >
              💬
            </button>
          )}
        </div>
      )}
    </div>
  );
}
