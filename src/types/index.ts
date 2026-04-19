export interface User {
  id: string;
  userId: string; // Custom User ID for display
  name: string;
  email: string;
  phone: string;
  age: number;
  nin: string; // National Identification Number
  ninValidated: boolean;
  ninDetails?: NINDetails; // Details fetched from NIN
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  category: string;
  description: string;
  method: "card" | "transfer" | "ussd"; // Payment method
  date: Date;
  status: "pending" | "completed" | "failed";
}

export type BudgetModel = "50-30-20" | "zero-based";
export type CategoryType = "strict" | "lax";

export interface BudgetCategory {
  id: string;
  name: string;
  type: CategoryType;
  description: string;
  examples: string[];
}

export interface Budget {
  id: string;
  userId: string;
  model: BudgetModel;
  category: string;
  categoryType: CategoryType;
  limit: number;
  spent: number;
  percentage?: number; // For 50-30-20 model
  currency: string;
  month: number;
  year: number;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
  createdAt: Date;
}

export type InvestmentType = "tbill" | "bond" | "mutual-fund";

export interface SaleCycle {
  cycleNumber: number;
  cycleDate: Date;
  amountAvailable: number;
  amountSold: number;
  status: "open" | "closed" | "expired";
}

export interface Investment {
  id: string;
  userId: string;
  type: InvestmentType;
  name: string;
  symbol: string;
  principal: number;
  interestRate: number;
  maturityDate: Date;
  purchaseDate: Date;
  currentValue: number;
  isClosed: boolean;
  saleCycles: SaleCycle[];
}

export interface Account {
  id: string;
  userId: string;
  type: "checking" | "savings" | "investment" | "credit";
  name: string;
  balance: number;
  availableBalance: number; // Ready for withdrawal
  currency: string;
  createdAt: Date;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "rejected";
  requestDate: Date;
  processDate?: Date;
}

export type LockPeriod = "hourly" | "daily" | "monthly" | "yearly";

export interface LockedSavings {
  id: string;
  userId: string;
  amount: number;
  lockPeriod: LockPeriod;
  createdDate: Date;
  unlockDate: Date;
  status: "locked" | "unlocked" | "withdrawn";
  interestRate?: number;
  interestEarned?: number; // Interest calculated at end
  description: string;
}

export interface NINDetails {
  nin: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: "M" | "F";
  stateOfOrigin: string;
  validated: boolean;
}

export interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  message: string;
  timestamp: Date;
}
