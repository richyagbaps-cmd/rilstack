'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import AccountBalance from '@/components/AccountBalance';
import AIChatbot from '@/components/AIChatbot';
import BudgetModeSelector from '@/components/BudgetModeSelector';
import BudgetSection from '@/components/BudgetSection';
import Dashboard from '@/components/Dashboard';
import InvestmentPortfolio from '@/components/InvestmentPortfolio';
import Navigation from '@/components/Navigation';
import SettingsSection from '@/components/SettingsSection';
import UserProfile from '@/components/UserProfile';
import AuthModal from '@/components/AuthModal';

type Section = 'dashboard' | 'budget' | 'investments' | 'account' | 'settings';

function PublicLanding() {
  const handleGoogleAuth = () => signIn('google', { callbackUrl: '/' });
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
  const teamMembers = [
    { name: 'Amina Okoye', role: 'Product Lead' },
    { name: 'Tunde Adebayo', role: 'Engineering Lead' },
    { name: 'Ifeoma Nnadi', role: 'Customer Success' },
  ];
  const services = [
    'Smart budgeting and category planning',
    'Savings lock features with release dates',
    'Investment tracking for T-Bills, bonds, and mutual funds',
    'Paystack wallet deposits and withdrawals',
    'KYC and NIN verification workflows',
  ];
  const newsItems = [
    {
      title: 'CBN plans N3.95 trillion Treasury Bills auctions for Q2 2026',
      date: 'April 3, 2026',
      source: 'Nairametrics',
      href: 'https://nairametrics.com/2026/04/03/cbn-plans-n3-95-trillion-treasury-bills-auction-in-q2-2026-n750bn-net-issuance/',
      summary: 'The issuance calendar points to continued heavy supply in 364-day bills as fixed-income demand stays strong.',
    },
    {
      title: 'CBN cut stop rates at the March 25, 2026 treasury bill auction',
      date: 'March 26, 2026',
      source: 'Nairametrics',
      href: 'https://nairametrics.com/2026/03/26/cbn-cuts-rates-at-march-25-ntb-auction-amid-liquidity-glut/',
      summary: 'Lower stop rates on the 182-day and 364-day tenors signalled easing yields amid stronger liquidity.',
    },
    {
      title: 'DMO published the March 2026 FGN bond auction results',
      date: 'March 30, 2026',
      source: 'DMO Nigeria',
      href: 'https://www.dmo.gov.ng/fgn-bonds/nigerian-treasury-bills?filter%5Bsearch%5D=&limit=100&limitstart=0',
      summary: 'Nigeria\u2019s debt office continues to release official auction summaries that investors can track for bond market direction.',
    },
  ];
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
              onClick={() => setAuthMode('login')}
              className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition-all hover:bg-cyan-400/20 md:px-4 md:text-sm"
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode('signup')}
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
                Budget smarter, lock savings with purpose, and track Nigerian investment signals from one app.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base md:leading-7">
                RILSTACK is a personal finance workspace built for budgeting, savings discipline, and investment tracking.
                Users can create structured budget plans, assign daily spending limits, set dates when money becomes available,
                and manage deposits or withdrawals from a live balance that starts from zero.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 md:text-xs">Budget Styles</p>
                <p className="mt-2 text-lg font-bold text-white md:text-xl">3 Modes</p>
                <p className="mt-1 text-xs text-slate-400 md:text-sm">Strict or relaxed mode, plus 50/30/20, zero-based, or custom planning.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 md:text-xs">Savings Guard</p>
                <p className="mt-2 text-lg font-bold text-white md:text-xl">Safelock</p>
                <p className="mt-1 text-xs text-slate-400 md:text-sm">Strict mode can lock category funds until a chosen spending date.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 md:text-xs">Growth View</p>
                <p className="mt-2 text-lg font-bold text-white md:text-xl">Live Signals</p>
                <p className="mt-1 text-xs text-slate-400 md:text-sm">Monitor balances, fixed-income signals, and portfolio visuals in one dashboard.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGoogleAuth}
                className="rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02]"
              >
                Continue with Google
              </button>
              <button
                onClick={() => setAuthMode('signup')}
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
              Build profession-based plans, set category allocations, and define daily spending targets to reduce confusion before the month starts.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white">Savings</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Use strict-mode safelock to hold back category funds until their release dates and earn projected interest on longer locks.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white">Investing</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Track treasury bills, bonds, and portfolio momentum while staying aware of current fixed-income moves in Nigeria.
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">About</p>
            <h3 className="mt-2 text-xl font-bold text-white">Who We Are</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              RILSTACK helps Nigerians budget smarter, save with discipline, and invest with clearer decisions from one modern financial workspace.
            </p>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Meet The Team</p>
            <h3 className="mt-2 text-xl font-bold text-white">People Behind RILSTACK</h3>
            <div className="mt-3 space-y-2">
              {teamMembers.map((member) => (
                <div key={member.name} className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
                  <p className="text-sm font-semibold text-white">{member.name}</p>
                  <p className="text-xs text-slate-400">{member.role}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Services</p>
            <h3 className="mt-2 text-xl font-bold text-white">What We Offer</h3>
            <ul className="mt-3 space-y-2">
              {services.map((service) => (
                <li key={service} className="text-sm text-slate-300">
                  • {service}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl lg:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Nigeria Investment News</p>
              <h3 className="mt-2 text-2xl font-bold text-white md:text-3xl">Current market updates visitors can scan before signing in</h3>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-300">
              These updates highlight recent treasury bill and bond signals in Nigeria, so the home page feels more informed and grounded in the market.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {newsItems.map((item) => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-[26px] border border-white/10 bg-slate-950/50 p-5 transition-all hover:-translate-y-1 hover:border-cyan-300/30"
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  {item.source} {'\u00b7'} {item.date}
                </p>
                <h4 className="mt-3 text-lg font-semibold text-white">{item.title}</h4>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.summary}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Open source</p>
              </a>
            ))}
          </div>
        </section>
      </div>
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />}
    </div>
  );
}

function HomeContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const [showChatbot, setShowChatbot] = useState(true);
  const [budgetMode, setBudgetMode] = useState<'strict' | 'relaxed' | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('budgetMode');
    const sectionParam = searchParams.get('section');
    const chatbotTimer = window.setTimeout(() => {
      setShowChatbot(false);
    }, 1000);

    if (
      sectionParam === 'dashboard' ||
      sectionParam === 'budget' ||
      sectionParam === 'investments' ||
      sectionParam === 'account' ||
      sectionParam === 'settings'
    ) {
      setCurrentSection(sectionParam);
    } else if (sectionParam === 'nin-validation') {
      setCurrentSection('settings');
    }

    if (savedMode === 'strict' || savedMode === 'relaxed') {
      setBudgetMode(savedMode);
    }

    setIsLoaded(true);

    return () => {
      window.clearTimeout(chatbotTimer);
    };
  }, [searchParams]);

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
        {currentSection === 'settings' && <SettingsSection />}
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

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <HomeContent />
    </Suspense>
  );
}
