import React from 'react';

type Section = 'dashboard' | 'budget' | 'investments' | 'account' | 'nin-validation';

interface NavigationProps {
  currentSection: Section;
  setCurrentSection: (section: Section) => void;
  onProfileClick: () => void;
  budgetMode?: 'strict' | 'relaxed' | null;
  onChangeBudgetMode?: () => void;
}

const navItems: Array<{ id: Section; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: 'Dashboard' },
  { id: 'budget', label: 'Budget & Savings', icon: 'Budget' },
  { id: 'investments', label: 'Investments', icon: 'Invest' },
  { id: 'account', label: 'Account', icon: 'Account' },
  { id: 'nin-validation', label: 'NIN Validation', icon: 'NIN' },
];

export default function Navigation({
  currentSection,
  setCurrentSection,
  onProfileClick,
  budgetMode,
  onChangeBudgetMode,
}: NavigationProps) {
  const getBudgetModeLabel = () => {
    return budgetMode === 'strict'
      ? 'STRICT MODE - Funds Locked'
      : 'RELAXED MODE - Flexible Access';
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-700 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">RILSTACK</h1>

          {budgetMode && (
            <div
              className="flex items-center gap-2 rounded-lg px-4 py-2 shadow-md"
              style={{
                background:
                  budgetMode === 'strict'
                    ? 'rgba(6, 182, 212, 0.1)'
                    : 'rgba(16, 185, 129, 0.1)',
              }}
            >
              <span
                className={`text-sm font-semibold ${
                  budgetMode === 'strict' ? 'text-cyan-300' : 'text-emerald-300'
                }`}
              >
                {getBudgetModeLabel()}
              </span>
              {onChangeBudgetMode && (
                <button
                  onClick={onChangeBudgetMode}
                  className="ml-2 rounded bg-slate-700 px-2 py-1 text-xs text-slate-200 transition-colors hover:bg-slate-600"
                  title="Switch budget mode"
                >
                  Change
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="flex gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentSection(item.id)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                    currentSection === item.id
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
            <button
              onClick={onProfileClick}
              className="ml-4 whitespace-nowrap rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 font-semibold text-white shadow-md transition-all hover:from-purple-500 hover:to-purple-400"
              title="Click to view profile"
            >
              Profile
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
