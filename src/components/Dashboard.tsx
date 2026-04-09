'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import SavingsInvestmentsCarousel from './SavingsInvestmentsCarousel';
import ReviewsWidget from './ReviewsWidget';
import MetricCardsCarousel from './MetricCardsCarousel';
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
  return (
    <div className="relative min-h-screen overflow-hidden px-2 pb-16 pt-6 bg-gradient-to-br from-[#F8F9FC] via-[#f3f7fa] to-[#eaf2fa] text-[#1E2A3A]" style={{ color: 'var(--app-fg)' }}>
      {/* ReviewsWidget at the top */}
      <div className="mb-8">
        <ReviewsWidget />
      </div>
      {/* Carousel below reviews */}
      <div className="mb-12">
        <SavingsInvestmentsCarousel />
      </div>
      {/* Metric cards carousel */}
      <div className="rounded-[32px] border-2 p-2 shadow-xl overflow-hidden bg-white mb-12" style={{ borderColor: 'var(--app-border)' }}>
        <div className="relative w-full">
          <MetricCardsCarousel cards={metricCards} />
        </div>
      </div>
      {/* Main content section (hero, charts, etc.) would follow here, as in the original layout */}
    </div>
  );
}
