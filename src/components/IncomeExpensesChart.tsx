import React from "react";

interface IncomeExpensesChartProps {
  months: string[];
  income: number[];
  expenses: number[];
}

export default function IncomeExpensesChart({
  months,
  income,
  expenses,
}: IncomeExpensesChartProps) {
  const max = Math.max(...income, ...expenses, 1);
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md w-full max-w-xl mx-auto mt-8">
      <h3 className="text-lg font-bold mb-4 text-slate-900">
        Income & Expenses
      </h3>
      <div className="flex gap-2 items-end h-40">
        {months.map((month, i) => (
          <div key={month} className="flex flex-col items-center flex-1">
            <div className="flex gap-1 h-full items-end">
              <div
                className="bg-blue-500 rounded-t w-4"
                style={{ height: `${(income[i] / max) * 100}%` }}
                title={`Income: ${income[i]}`}
              />
              <div
                className="bg-rose-400 rounded-t w-4"
                style={{ height: `${(expenses[i] / max) * 100}%` }}
                title={`Expenses: ${expenses[i]}`}
              />
            </div>
            <span className="text-xs mt-2 text-slate-600">{month}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-2">
        <span className="flex items-center">
          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1" />
          Income
        </span>
        <span className="flex items-center">
          <span className="inline-block w-3 h-3 bg-rose-400 rounded-full mr-1" />
          Expenses
        </span>
      </div>
    </div>
  );
}
