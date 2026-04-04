import React from 'react';

interface NavigationProps {
  currentSection: 'dashboard' | 'budget' | 'investments' | 'account' | 'nin-validation';
  setCurrentSection: (section: 'dashboard' | 'budget' | 'investments' | 'account' | 'nin-validation') => void;
  onProfileClick: () => void;
  budgetMode?: 'strict' | 'relaxed';
  onChangeBudgetMode?: () => void;
}

export default function Navigation({ currentSection, setCurrentSection, onProfileClick, budgetMode, onChangeBudgetMode }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'budget', label: 'Budget & Savings', icon: '💰' },
    { id: 'investments', label: 'Investments', icon: '📈' },
    { id: 'account', label: 'Account', icon: '🏦' },
    { id: 'nin-validation', label: 'NIN Validation', icon: '🆔' },
  ];

  const getBudgetModeColor = () => {
    return budgetMode === 'strict' 
      ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 border border-cyan-400' 
      : 'bg-gradient-to-r from-emerald-600 to-emerald-500 border border-emerald-400';
  };

  const getBudgetModeLabel = () => {
    return budgetMode === 'strict' 
      ? '🔒 STRICT MODE - Funds Locked' 
      : '🎯 RELAXED MODE - Flexible Access';
  };

  return (
    <nav className="sticky top-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-50 border-b border-slate-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">RILSTACK</h1>
          
          {budgetMode && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md" style={{ background: budgetMode === 'strict' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}>
              <span className={`text-sm font-semibold ${budgetMode === 'strict' ? 'text-cyan-300' : 'text-emerald-300'}`}>
                {getBudgetModeLabel()}
              </span>
              {onChangeBudgetMode && (
                <button
                  onClick={onChangeBudgetMode}
                  className="ml-2 text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  title="Switch budget mode"
                >
                  Change
                </button>
              )}
            </div>
          )}

          <div className="flex gap-2 items-center overflow-x-auto">
            <div className="flex gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentSection(item.id as any)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all text-sm whitespace-nowrap ${
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
              className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-purple-400 transition-all whitespace-nowrap shadow-md"
              title="Click to view profile"
            >
              👤 Profile
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
