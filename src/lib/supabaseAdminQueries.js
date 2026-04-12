import { supabase } from '@/lib/supabaseClient';

// Fetch all profiles
export async function fetchProfiles() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  return data;
}

// Fetch all KYC details
export async function fetchKycDetails() {
  const { data, error } = await supabase.from('kyc_details').select('*');
  if (error) throw error;
  return data;
}

// Fetch all budgets
export async function fetchBudgets() {
  const { data, error } = await supabase.from('budgets').select('*');
  if (error) throw error;
  return data;
}

// Fetch all budget categories
export async function fetchBudgetCategories() {
  const { data, error } = await supabase.from('budget_categories').select('*');
  if (error) throw error;
  return data;
}

// Fetch all transactions
export async function fetchTransactions() {
  const { data, error } = await supabase.from('transactions').select('*');
  if (error) throw error;
  return data;
}

// Fetch all savings goals
export async function fetchSavingsGoals() {
  const { data, error } = await supabase.from('savings_goals').select('*');
  if (error) throw error;
  return data;
}

// Fetch all safe locks
export async function fetchSafeLocks() {
  const { data, error } = await supabase.from('safe_locks').select('*');
  if (error) throw error;
  return data;
}

// Fetch all interest logs
export async function fetchInterestLogs() {
  const { data, error } = await supabase.from('interest_logs').select('*');
  if (error) throw error;
  return data;
}
