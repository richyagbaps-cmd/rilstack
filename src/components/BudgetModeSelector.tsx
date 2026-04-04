'use client';

import React, { useState } from 'react';

interface BudgetModeSelectorProps {
  onModeSelect: (mode: 'strict' | 'relaxed') => void;
}

export default function BudgetModeSelector({ onModeSelect }: BudgetModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<'strict' | 'relaxed' | null>(null);

  const handleSelect = (mode: 'strict' | 'relaxed') => {
    setSelectedMode(mode);
    onModeSelect(mode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-16">
        <h1 className="text-5xl font-bold text-white mb-4">Choose Your Budgeting Style</h1>
        <p className="text-slate-400 text-lg">Select how you want to manage your finances. You can change this anytime.</p>
      </div>

      {/* Mode Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* STRICT Mode Card */}
        <div
          onClick={() => handleSelect('strict')}
          className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${
            selectedMode === 'strict' 
              ? 'ring-2 ring-blue-500 shadow-2xl scale-105' 
              : 'hover:shadow-xl'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-900 opacity-90"></div>
          <div className="relative p-12 text-white">
            {/* Icon */}
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-400/30 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4">STRICT MODE</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-200">How It Works</h3>
                <p className="text-blue-100 leading-relaxed">
                  Your money is locked in designated accounts based on how often you need it. Once locked, funds can only be released on the scheduled unlock date.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-200">Lock Periods</h3>
                <ul className="space-y-2 text-blue-100">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-300 font-semibold">•</span>
                    <span><strong>Daily:</strong> Money unlocks each day for recurring expenses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-300 font-semibold">•</span>
                    <span><strong>Weekly:</strong> Money unlocks each week (groceries, transport)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-300 font-semibold">•</span>
                    <span><strong>Monthly:</strong> Money unlocks monthly (rent, utilities, subscriptions)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-300 font-semibold">•</span>
                    <span><strong>Yearly:</strong> Money unlocks yearly (insurance, annual fees)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-950/50 rounded-lg p-4 border border-blue-400/30">
                <h3 className="text-lg font-semibold mb-2 text-blue-200">Benefits</h3>
                <ul className="space-y-2 text-blue-100 text-sm">
                  <li>✓ Prevents overspending through forced discipline</li>
                  <li>✓ Automates your budget execution</li>
                  <li>✓ Builds strong financial habits</li>
                  <li>✓ Perfect for fixed recurring expenses</li>
                </ul>
              </div>

              <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/50">
                <p className="text-blue-100 text-sm">
                  <strong>Zero Penalty:</strong> No penalty for emergency early withdrawals (emergency only)
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('strict');
              }}
              className={`w-full mt-8 py-3 px-6 rounded-lg font-semibold transition-all ${
                selectedMode === 'strict'
                  ? 'bg-blue-400 text-blue-900'
                  : 'bg-blue-500/20 text-blue-100 hover:bg-blue-500/30'
              }`}
            >
              {selectedMode === 'strict' ? '✓ Selected' : 'Select Strict Mode'}
            </button>
          </div>
        </div>

        {/* RELAXED Mode Card */}
        <div
          onClick={() => handleSelect('relaxed')}
          className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${
            selectedMode === 'relaxed' 
              ? 'ring-2 ring-emerald-500 shadow-2xl scale-105' 
              : 'hover:shadow-xl'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-900 opacity-90"></div>
          <div className="relative p-12 text-white">
            {/* Icon */}
            <div className="mb-6">
              <div className="w-16 h-16 bg-emerald-400/30 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4">RELAXED MODE</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-emerald-200">How It Works</h3>
                <p className="text-emerald-100 leading-relaxed">
                  Full flexibility with your budget. Withdraw money from any category anytime you need it. A small penalty applies to encourage discipline.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-emerald-200">Withdrawal Flexibility</h3>
                <ul className="space-y-2 text-emerald-100">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-300 font-semibold">•</span>
                    <span>Withdraw from any category anytime</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-300 font-semibold">•</span>
                    <span>No waiting periods or lock-ins</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-300 font-semibold">•</span>
                    <span>Perfect for variable or flexible expenses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-300 font-semibold">•</span>
                    <span>Adjust allocations on the fly</span>
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-950/50 rounded-lg p-4 border border-emerald-400/30">
                <h3 className="text-lg font-semibold mb-2 text-emerald-200">Features</h3>
                <ul className="space-y-2 text-emerald-100 text-sm">
                  <li>✓ Complete withdrawal freedom</li>
                  <li>✓ Real-time budget adjustments</li>
                  <li>✓ No complex lock periods</li>
                  <li>✓ Great for unpredictable expenses</li>
                </ul>
              </div>

              <div className="bg-red-900/30 rounded-lg p-4 border border-red-500/50">
                <p className="text-red-100 text-sm">
                  <strong>2% Withdrawal Penalty:</strong> Each withdrawal incurs a 2% fee on the amount withdrawn
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('relaxed');
              }}
              className={`w-full mt-8 py-3 px-6 rounded-lg font-semibold transition-all ${
                selectedMode === 'relaxed'
                  ? 'bg-emerald-400 text-emerald-900'
                  : 'bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30'
              }`}
            >
              {selectedMode === 'relaxed' ? '✓ Selected' : 'Select Relaxed Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-6xl mx-auto mb-12">
        <h2 className="text-3xl font-bold text-white mb-8">Quick Comparison</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/50 border-b border-slate-600">
                <th className="px-6 py-4 text-left text-slate-200 font-semibold">Feature</th>
                <th className="px-6 py-4 text-center text-blue-300 font-semibold">STRICT MODE</th>
                <th className="px-6 py-4 text-center text-emerald-300 font-semibold">RELAXED MODE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              <tr className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 text-slate-300">Withdrawal Freedom</td>
                <td className="px-6 py-4 text-center text-blue-400">Limited (by unlock date)</td>
                <td className="px-6 py-4 text-center text-emerald-400">Unlimited</td>
              </tr>
              <tr className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 text-slate-300">Withdrawal Penalty</td>
                <td className="px-6 py-4 text-center text-blue-400">0%</td>
                <td className="px-6 py-4 text-center text-red-400">2% on amount</td>
              </tr>
              <tr className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 text-slate-300">Best For</td>
                <td className="px-6 py-4 text-center text-blue-400">Fixed recurring expenses</td>
                <td className="px-6 py-4 text-center text-emerald-400">Variable expenses</td>
              </tr>
              <tr className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 text-slate-300">Discipline Level</td>
                <td className="px-6 py-4 text-center text-blue-400">Highest</td>
                <td className="px-6 py-4 text-center text-emerald-400">Flexible</td>
              </tr>
              <tr className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 text-slate-300">Learning Curve</td>
                <td className="px-6 py-4 text-center text-blue-400">Moderate</td>
                <td className="px-6 py-4 text-center text-emerald-400">Simple</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">Pro Tips</h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex gap-3">
              <span className="text-slate-500">→</span>
              <span><strong>Use STRICT</strong> for essential, recurring expenses like rent, utilities, and insurance</span>
            </li>
            <li className="flex gap-3">
              <span className="text-slate-500">→</span>
              <span><strong>Use RELAXED</strong> for variable expenses like dining, shopping, and entertainment</span>
            </li>
            <li className="flex gap-3">
              <span className="text-slate-500">→</span>
              <span><strong>Hybrid Approach:</strong> Many users combine both modes - strict for essentials, relaxed for discretionary</span>
            </li>
            <li className="flex gap-3">
              <span className="text-slate-500">→</span>
              <span><strong>Easy Switch:</strong> Change modes anytime from your dashboard settings</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Note */}
      {selectedMode && (
        <div className="max-w-6xl mx-auto mt-12 p-6 bg-slate-900/50 border-l-4 border-slate-600 rounded-lg">
          <p className="text-slate-400 text-center">
            You selected <strong className={selectedMode === 'strict' ? 'text-blue-400' : 'text-emerald-400'}>{selectedMode.toUpperCase()} MODE</strong>. 
            You can change this in settings anytime.
          </p>
        </div>
      )}
    </div>
  );
}
