"use client";
import { useState } from "react";

export default function RoundUpToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2 mt-4">
      <span className="font-medium">Round-Up Savings</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-xs text-gray-500">
        Round up each transaction to ₦100 and save the difference
      </span>
    </div>
  );
}
