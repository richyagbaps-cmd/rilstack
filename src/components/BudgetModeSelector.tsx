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
    <div className="min-h-screen bg-[#F8F9FC] p-4 md:p-8">
      {/* Header */}
      <div className="mx-auto mb-10 max-w-6xl md:mb-16">
        <h1 className="mb-4 text-3xl font-bold text-[#1E2A3A] md:text-5xl">Choose Your Budgeting Style</h1>
        <p className="text-base text-[#4A5B6E] md:text-lg">Select how you want to manage your finances. You can change this anytime.</p>
      </div>

      {/* Mode Cards */}
      <div className="mx-auto mb-10 grid max-w-6xl grid-cols-1 gap-6 md:mb-12 md:grid-cols-2 md:gap-8">
        {/* STRICT Mode Card */}
        <div
          onClick={() => handleSelect('strict')}
          className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${
            selectedMode === 'strict' 
              ? 'ring-2 ring-[#2c3e5f] shadow-2xl scale-105' 
              : 'hover:shadow-xl'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#2c3e5f] to-[#1e2d46] opacity-90"></div>
          <div className="relative p-6 text-white md:p-12">
            {/* Icon */}
            <div className="mb-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/30 md:mb-6 md:h-16 md:w-16">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <h2 className="mb-4 text-2xl font-bold md:text-3xl">STRICT MODE</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-emerald-200">How It Works</h3>
                <p className="text-emerald-100 leading-relaxed">
                  Your money is locked in designated accounts based on how often you need it. Once locked, funds can only be released on the scheduled unlock date.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-emerald-200">Lock Periods</h3>
                <ul className="space-y-2 text-emerald-100">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-300 font-semibold">•</span>
                    <span><strong>Daily:</strong> Money unlocks each day for recurring expenses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-300 font-semibold">•</span>
                    <span><strong>Weekly:</strong> Money unlocks each week (groceries, transport)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-300 font-semibold">•</span>
                    <span><strong>Monthly:</strong> Money unlocks monthly (rent, utilities, subscriptions)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-300 font-semibold">•</span>
                    <span><strong>Yearly:</strong> Money unlocks yearly (insurance, annual fees)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-950/50 rounded-lg p-4 border border-emerald-400/30">
                <h3 className="text-lg font-semibold mb-2 text-emerald-200">Benefits</h3>
                <ul className="space-y-2 text-emerald-100 text-sm">
                  <li>✓ Prevents overspending through forced discipline</li>
                  <li>✓ Automates your budget execution</li>
                  <li>✓ Builds strong financial habits</li>
                  <li>✓ Perfect for fixed recurring expenses</li>
                </ul>
              </div>

              <div className="bg-emerald-900/30 rounded-lg p-4 border border-emerald-500/50">
                <p className="text-emerald-100 text-sm">
                  <strong>Zero Penalty:</strong> No penalty for emergency early withdrawals (emergency only)
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('strict');
              }}
              className={`w-full mt-8 py-3 px-6 rounded-[40px] font-semibold transition-all ${
                selectedMode === 'strict'
                  ? 'bg-white text-[#2c3e5f]'
                  : 'bg-white/20 text-white hover:bg-white/30'
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
              ? 'ring-2 ring-[#2c3e5f] shadow-2xl scale-105' 
              : 'hover:shadow-xl'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#4A8B6E] to-[#2c3e5f] opacity-90"></div>
          <div className="relative p-6 text-white md:p-12">
            {/* Icon */}
            <div className="mb-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/30 md:mb-6 md:h-16 md:w-16">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <h2 className="mb-4 text-2xl font-bold md:text-3xl">RELAXED MODE</h2>
            
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
              className={`w-full mt-8 py-3 px-6 rounded-[40px] font-semibold transition-all ${
                selectedMode === 'relaxed'
                  ? 'bg-white text-[#2c3e5f]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {selectedMode === 'relaxed' ? '✓ Selected' : 'Select Relaxed Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mx-auto mb-10 max-w-6xl md:mb-12">
        <h2 className="mb-6 text-2xl font-bold text-[#1E2A3A] md:mb-8 md:text-3xl">Quick Comparison</h2>
        <div className="overflow-x-auto rounded-[28px] border border-[#E9EDF2] bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F1F4F9] border-b border-[#E9EDF2]">
                <th className="px-4 py-4 text-left text-sm font-semibold text-[#1E2A3A] md:px-6">Feature</th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-[#2c3e5f] md:px-6">STRICT MODE</th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-[#4A8B6E] md:px-6">RELAXED MODE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EDF2]">
              <tr className="hover:bg-[#F8F9FC] transition-colors">
                <td className="px-4 py-4 text-sm text-[#4A5B6E] md:px-6">Withdrawal Freedom</td>
                <td className="px-4 py-4 text-center text-sm text-[#2c3e5f] md:px-6">Limited (by unlock date)</td>
                <td className="px-4 py-4 text-center text-sm text-[#4A8B6E] md:px-6">Unlimited</td>
              </tr>
              <tr className="hover:bg-[#F8F9FC] transition-colors">
                <td className="px-4 py-4 text-sm text-[#4A5B6E] md:px-6">Withdrawal Penalty</td>
                <td className="px-4 py-4 text-center text-sm text-[#2c3e5f] md:px-6">0%</td>
                <td className="px-4 py-4 text-center text-sm text-red-500 md:px-6">2% on amount</td>
              </tr>
              <tr className="hover:bg-[#F8F9FC] transition-colors">
                <td className="px-4 py-4 text-sm text-[#4A5B6E] md:px-6">Best For</td>
                <td className="px-4 py-4 text-center text-sm text-[#2c3e5f] md:px-6">Fixed recurring expenses</td>
                <td className="px-4 py-4 text-center text-sm text-[#4A8B6E] md:px-6">Variable expenses</td>
              </tr>
              <tr className="hover:bg-[#F8F9FC] transition-colors">
                <td className="px-4 py-4 text-sm text-[#4A5B6E] md:px-6">Discipline Level</td>
                <td className="px-4 py-4 text-center text-sm text-[#2c3e5f] md:px-6">Highest</td>
                <td className="px-4 py-4 text-center text-sm text-[#4A8B6E] md:px-6">Flexible</td>
              </tr>
              <tr className="hover:bg-[#F8F9FC] transition-colors">
                <td className="px-4 py-4 text-sm text-[#4A5B6E] md:px-6">Learning Curve</td>
                <td className="px-4 py-4 text-center text-sm text-[#2c3e5f] md:px-6">Moderate</td>
                <td className="px-4 py-4 text-center text-sm text-[#4A8B6E] md:px-6">Simple</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[28px] border border-[#E9EDF2] bg-white p-6 shadow-sm md:p-8">
          <h3 className="text-xl font-bold text-[#1E2A3A] mb-4">Pro Tips</h3>
          <ul className="space-y-3 text-[#4A5B6E]">
            <li className="flex gap-3">
              <span className="text-[#2c3e5f]">→</span>
              <span><strong>Use STRICT</strong> for essential, recurring expenses like rent, utilities, and insurance</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#2c3e5f]">→</span>
              <span><strong>Use RELAXED</strong> for variable expenses like dining, shopping, and entertainment</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#2c3e5f]">→</span>
              <span><strong>Hybrid Approach:</strong> Many users combine both modes - strict for essentials, relaxed for discretionary</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#2c3e5f]">→</span>
              <span><strong>Easy Switch:</strong> Change modes anytime from your dashboard settings</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Note */}
      {selectedMode && (
        <div className="max-w-6xl mx-auto mt-12 p-6 bg-[#F1F4F9] border-l-4 border-[#2c3e5f] rounded-[28px]">
          <p className="text-[#4A5B6E] text-center">
            You selected <strong className="text-[#2c3e5f]">{selectedMode.toUpperCase()} MODE</strong>. 
            You can change this in settings anytime.
          </p>
        </div>
      )}
    </div>
  );
}
