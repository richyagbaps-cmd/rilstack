"use client";
import { useState, useEffect } from "react";

const streaksDemo = {
  login: 7,
  savings: 4,
  budget: 5,
};

export default function StreaksBar() {
  return (
    <div className="flex gap-4 bg-blue-50 rounded-lg p-4 items-center justify-center mb-4">
      <div className="flex flex-col items-center">
        <span className="font-bold text-blue-700">{streaksDemo.login}d</span>
        <span className="text-xs">Login Streak</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="font-bold text-green-700">{streaksDemo.savings}d</span>
        <span className="text-xs">Savings Streak</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="font-bold text-yellow-700">{streaksDemo.budget}d</span>
        <span className="text-xs">Budget Streak</span>
      </div>
    </div>
  );
}
