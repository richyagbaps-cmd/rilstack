// AI-based budget allocation utility
// This function takes demographics and budget type and returns suggested allocations

export interface Demographics {
  occupation: string;
  age: string;
  gender: string;
  state: string;
  country: string;
  income: string;
}

export type BudgetType = "502030" | "zero-based" | "custom";

export interface BudgetSuggestion {
  needs?: number;
  wants?: number;
  savings?: number;
  custom?: Record<string, number>;
}

// Simple AI logic for demonstration. Replace with real ML/AI as needed.
export function suggestBudgetAllocation(
  demographics: Demographics,
  type: BudgetType,
  totalIncome: number,
): BudgetSuggestion {
  if (type === "502030") {
    // Adjust based on demographics (example: students save less, high earners save more)
    let needs = 0.5,
      wants = 0.3,
      savings = 0.2;
    if (demographics.occupation === "Student") {
      savings = 0.1;
      wants = 0.4;
      needs = 0.5;
    } else if (demographics.income === "Above ₦1,000,000") {
      savings = 0.3;
      wants = 0.2;
      needs = 0.5;
    }
    return {
      needs: Math.round(totalIncome * needs),
      wants: Math.round(totalIncome * wants),
      savings: Math.round(totalIncome * savings),
    };
  }
  if (type === "zero-based") {
    // Allocate every naira to something (user input, but can suggest based on occupation/income)
    // Example: Suggest higher savings for high earners
    let savings = 0.2;
    if (demographics.income === "Above ₦1,000,000") savings = 0.3;
    if (demographics.occupation === "Student") savings = 0.1;
    const needs = Math.round(totalIncome * (1 - savings) * 0.7);
    const wants = Math.round(totalIncome * (1 - savings) * 0.3);
    return {
      needs,
      wants,
      savings: Math.round(totalIncome * savings),
    };
  }
  // Custom: let user allocate, but suggest a default
  return {
    custom: {
      "Pocket 1": Math.round(totalIncome * 0.4),
      "Pocket 2": Math.round(totalIncome * 0.3),
      "Pocket 3": Math.round(totalIncome * 0.3),
    },
  };
}
