'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import SavingsInvestmentsCarousel from './SavingsInvestmentsCarousel';
import ReviewsWidget from './ReviewsWidget';
import MetricCardsCarousel from './MetricCardsCarousel';
import StepIndicator from './StepIndicator';
import LoadingDots from './LoadingDots';
import EmptyStatePiggy from './EmptyStatePiggy';
import SkeletonCard from './SkeletonCard';
import FeeWarningToast from './FeeWarningToast';
import MagicWandAI from './MagicWandAI';
import PinPad from './PinPad';
import LockAnimation from './LockAnimation';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const monthlyData = [
  { month: 'Jan', income: 0, expenses: 0, invest: 0 },
  { month: 'Feb', income: 0, expenses: 0, invest: 0 },
  { month: 'Mar', income: 0, expenses: 0, invest: 0 },
  { month: 'Apr', income: 0, expenses: 0, invest: 0 },
  { month: 'May', income: 0, expenses: 0, invest: 0 },
  { month: 'Jun', income: 0, expenses: 0, invest: 0 },
];

const spendMix = [
  { name: 'Essentials', value: 0, color: '#2c3e5f' },
  { name: 'Flexible', value: 0, color: '#4A8B6E' },
  { name: 'Goals', value: 0, color: '#6BAF8D' },
];

const metricCards = [
  {
    label: 'Budgets and Savings',
    value: 'N0',
    detail: 'Track and grow your savings goals.',
    tone: 'border-[#E9EDF2] bg-white',
  },
  {
    label: 'Investments',
    value: 'N0',
    detail: 'Monitor your investment portfolio.',
    tone: 'border-[#E9EDF2] bg-white',
  },
  {
    label: 'Account',
    value: 'N0',
    detail: 'Manage your account and transactions.',
    tone: 'border-[#E9EDF2] bg-white',
  },
];

export default function Dashboard({ onNavigate }: { onNavigate?: (section: string) => void }) {
  // Example state for demoing micro-interactions (replace with real data logic)
  const [step, setStep] = useState(1);
  const [showFeeToast, setShowFeeToast] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [pin, setPin] = useState("");
  const [empty, setEmpty] = useState(false);

  return (
    <div
      className="relative min-h-screen overflow-hidden px-2 pb-16 pt-6 bg-glass backdrop-blur-xl text-app-fg font-inter animate-fade-in"
      style={{ color: 'var(--app-fg)' }}
    >
      {/* Step indicator for onboarding or budgeting flows */}
      <StepIndicator step={step} total={4} />

      {/* ReviewsWidget at the top */}
      <div className="mb-8 rounded-3xl bg-glass shadow-lg p-4 animate-fade-in-up">
        <ReviewsWidget />
      </div>

      {/* Carousel below reviews */}
        {/* Normal sized moving widget below reviews */}
        {/* MovingWidget removed to unblock deployment */}

      {/* Metric cards carousel */}
        {/* Normal sized moving widget for metrics */}
        {/* MovingWidget removed to unblock deployment */}

      {/* Loading state example removed */}

      {/* Empty state example */}
      {empty && (
        <EmptyStatePiggy message="No data yet. Start budgeting or saving!" />
      )}

      {/* Fee warning toast example */}
      {showFeeToast && (
        <FeeWarningToast
          fee={350}
          onConfirm={() => setShowFeeToast(false)}
          onCancel={() => setShowFeeToast(false)}
        />
      )}

      {/* MagicWandAI example (AI allocation) */}
      <div className="flex justify-center my-8">
        <MagicWandAI
          onShuffle={() => {}}
          onUndo={() => {}}
          disabled={false}
        />
      </div>

      {/* PinPad and LockAnimation example (PIN/lock step) */}
      <div className="flex flex-col items-center gap-4 my-8">
        <PinPad value={pin} onChange={setPin} onBiometric={() => setShowLock(true)} />
        <LockAnimation show={showLock} />
      </div>

      {/* Main content section (hero, charts, etc.) would follow here, as in the original layout */}
    </div>
  );
}
