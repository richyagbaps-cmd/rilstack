import React from 'react';

interface MovingWidgetProps {
  type: 'metrics' | 'savings-investments';
}

export default function MovingWidget({ type }: MovingWidgetProps) {
  // Placeholder for a normal sized moving widget
  return (
    <div className="w-full h-32 flex items-center justify-center bg-gradient-to-r from-[#f3f4fa] to-[#e5e7eb] rounded-2xl shadow animate-pulse">
      <span className="text-xl font-semibold text-[#2c3e5f]">
        {type === 'metrics' ? 'Metrics Widget' : 'Savings & Investments Widget'}
      </span>
    </div>
  );
}