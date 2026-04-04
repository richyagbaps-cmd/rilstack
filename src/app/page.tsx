'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import AccountBalance from '@/components/AccountBalance';
import AIChatbot from '@/components/AIChatbot';
import BudgetModeSelector from '@/components/BudgetModeSelector';
import BudgetSection from '@/components/BudgetSection';
import Dashboard from '@/components/Dashboard';
import InvestmentPortfolio from '@/components/InvestmentPortfolio';
import Navigation from '@/components/Navigation';
import NinValidation from '@/components/NinValidation';
import UserProfile from '@/components/UserProfile';

type Section = 'dashboard' | 'budget' | 'investments' | 'account' | 'nin-validation';

function PublicLanding() {
  const featureCards = [
    {
      title: 'Budgeting',
      description: 'Plan every month with guided budget styles, editable AI allocations, and clearer category control.',
      image: '/images/budget-map.svg',
    },
    {
      title: 'Savings',
      description: 'Use strict-mode safelock to protect money until the right date and build stronger habits.',
      image: '/images/savings-orbit.svg',
    },
    {
      title: 'Investing',
      description: 'Track funds, treasury bills, and portfolio growth in a more visual command-center experience.',
      image: '/images/investment-grid.svg',
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(74,222,255,0.14),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(176,140,255,0.16),_transparent_24%),linear-gradient(180deg,_#050816_0%,_#09101d_48%,_#050816_100%)] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-6 md:px-6 md:py-8">
        <header className="flex items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl md:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-cyan-200">RILSTACK</p>
            <h1 className="mt-1 text-lg font-bold md:text-2xl">Budget. Save. Invest with discipline.</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => signIn('google')}
              className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition-all hover:bg-cyan-400/20 md:px-4 md:text-sm"
            >
              Login
            </button>
            <button
              onClick={() => signIn('google')}
              className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all hover:from-purple-500 hover:to-purple-400 md:px-4 md:text-sm"
            >
              Sign Up
            </button>
          </div>
        </header>

        <section className="grid gap-8 rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl lg:grid-cols-[1.05fr,0.95fr] lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-emerald-100 md:text-xs">
              Modern finance workflow
            </div>
            <div className="space-y-4">
              <h2 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
                The first screen now explains the app before asking people to log in.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base md:leading-7">
                RILSTACK helps people budget intentionally, protect savings with time-based controls, and follow
                investment growth from one place. Visitors learn what the app does first, then continue with Google login
                when they are ready.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 md:text-xs">Budget Styles</p>
                <p className="mt-2 text-lg font-bold text-white md:text-xl">3 Modes</p>
                <p className="mt-1 text-xs text-slate-400 md:text-sm">50/30/20, zero-based, or custom planning.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 md:text-xs">Savings Guard</p>
                <p className="mt-2 text-lg font-bold text-white md:text-xl">Safelock</p>
                <p className="mt-1 text-xs text-slate-400 md:text-sm">Strict mode protects money until the target date.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 md:text-xs">Growth View</p>
                <p className="mt-2 text-lg font-bold text-white md:text-xl">Live Signals</p>
                <p className="mt-1 text-xs text-slate-400 md:text-sm">Portfolio and savings visuals feel more interactive.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => signIn('google')}
                className="rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02]"
              >
                Continue with Google
              </button>
              <button
                onClick={() => signIn('google')}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition-all hover:bg-white/10"
              >
                Create Account
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {featureCards.map((card) => (
              <div key={card.title} className="overflow-hidden rounded-[26px] border border-white/10 bg-slate-950/60">
                <div className="relative aspect-[4/3]">
                  <Image src={card.image} alt={card.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200 md:text-xs">{card.title}</p>
                    <p className="mt-2 text-sm font-semibold text-white md:text-base">{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white">Budgeting</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Build monthly plans with guided category structure, editable AI allocations, and profession-based budgeting.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white">Saving</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Use strict-mode safelock to hold back money until spending dates and create stronger saving discipline.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white">Investing</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Track growth visually across savings, treasury products, and portfolio categories from one dashboard.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');
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

  if (!isLoaded || status === 'loading') {
    return <div className="min-h-screen bg-slate-950"></div>;
  }

  if (!session) {
    return <PublicLanding />;
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
        {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
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
