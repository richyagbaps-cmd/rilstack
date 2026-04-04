'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

export default function SavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 600000,
      currentAmount: 450000,
      deadline: '2025-12-31',
      category: 'Safety Net',
    },
    {
      id: '2',
      name: 'Vacation',
      targetAmount: 150000,
      currentAmount: 75000,
      deadline: '2025-08-31',
      category: 'Recreation',
    },
    {
      id: '3',
      name: 'Down Payment',
      targetAmount: 1500000,
      currentAmount: 1050000,
      deadline: '2026-06-30',
      category: 'Housing',
    },
  ]);

  const { register, handleSubmit, reset } = useForm<{ name: string; targetAmount: string; deadline: string; category: string }>();

  const onSubmit = (data: { name: string; targetAmount: string; deadline: string; category: string }) => {
    const newGoal: SavingsGoal = {
      id: Date.now().toString(),
      name: data.name,
      targetAmount: parseFloat(data.targetAmount),
      currentAmount: 0,
      deadline: data.deadline,
      category: data.category,
    };
    setGoals([...goals, newGoal]);
    reset();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Goals List */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Savings Goals</h2>
          <div className="space-y-4">
            {goals.map((goal) => {
              const percentage = (goal.currentAmount / goal.targetAmount) * 100;
              const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{goal.name}</h3>
                      <p className="text-sm text-gray-500">{goal.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₦{goal.currentAmount.toLocaleString()} / ₦{goal.targetAmount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{daysLeft} days left</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{percentage.toFixed(1)}% complete</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Goal Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Create Goal</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Goal Name</label>
            <input
              type="text"
              placeholder="e.g., Car Purchase"
              {...register('name', { required: true })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Target Amount (₦ Min: ₦5,000)</label>
            <input
              type="number"
              step="1"
              placeholder="e.g., 100000"
              {...register('targetAmount', { 
                required: 'Target amount is required',
                valueAsNumber: true,
                min: { value: 5000, message: 'Minimum target is ₦5,000' },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Category</label>
            <select {...register('category', { required: true })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
              <option>Safety Net</option>
              <option>Recreation</option>
              <option>Housing</option>
              <option>Education</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Target Date</label>
            <input
              type="date"
              {...register('deadline', { required: true })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
            Create Goal
          </button>
        </form>
      </div>
    </div>
  );
}
