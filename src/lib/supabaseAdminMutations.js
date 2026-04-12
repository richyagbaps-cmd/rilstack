import { supabase } from '@/lib/supabaseClient';

// --- PROFILES ---
export async function insertProfile(profile) {
  const { data, error } = await supabase.from('profiles').insert([profile]);
  if (error) throw error;
  return data;
}
export async function updateProfile(id, updates) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', id);
  if (error) throw error;
  return data;
}
export async function deleteProfile(id) {
  const { data, error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw error;
  return data;
}

// --- KYC DETAILS ---
export async function insertKycDetails(details) {
  const { data, error } = await supabase.from('kyc_details').insert([details]);
  if (error) throw error;
  return data;
}
export async function updateKycDetails(id, updates) {
  const { data, error } = await supabase.from('kyc_details').update(updates).eq('id', id);
  if (error) throw error;
  return data;
}
export async function deleteKycDetails(id) {
  const { data, error } = await supabase.from('kyc_details').delete().eq('id', id);
  if (error) throw error;
  return data;
}

// --- BUDGETS ---
export async function insertBudget(budget) {
  const { data, error } = await supabase.from('budgets').insert([budget]);
  if (error) throw error;
  return data;
}
export async function updateBudget(id, updates) {
  const { data, error } = await supabase.from('budgets').update(updates).eq('id', id);
  if (error) throw error;
  return data;
}
export async function deleteBudget(id) {
  const { data, error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw error;
  return data;
}

// --- BUDGET CATEGORIES ---
export async function insertBudgetCategory(category) {
  const { data, error } = await supabase.from('budget_categories').insert([category]);
  if (error) throw error;
  return data;
}
export async function updateBudgetCategory(id, updates) {
  const { data, error } = await supabase.from('budget_categories').update(updates).eq('id', id);
  if (error) throw error;
  return data;
}
export async function deleteBudgetCategory(id) {
  const { data, error } = await supabase.from('budget_categories').delete().eq('id', id);
  if (error) throw error;
  return data;
}

// --- TRANSACTIONS ---
export async function insertTransaction(tx) {
  const { data, error } = await supabase.from('transactions').insert([tx]);
  if (error) throw error;
  return data;
}
export async function updateTransaction(id, updates) {
  const { data, error } = await supabase.from('transactions').update(updates).eq('id', id);
  if (error) throw error;
  return data;
}
export async function deleteTransaction(id) {
  const { data, error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
  return data;
}

// --- SAVINGS GOALS ---
export async function insertSavingsGoal(goal) {
  const { data, error } = await supabase.from('savings_goals').insert([goal]);
  if (error) throw error;
  return data;
}
export async function updateSavingsGoal(id, updates) {
  const { data, error } = await supabase.from('savings_goals').update(updates).eq('id', id);
  if (error) throw error;
  return data;
}
export async function deleteSavingsGoal(id) {
  const { data, error } = await supabase.from('savings_goals').delete().eq('id', id);
  if (error) throw error;
  return data;
}

// --- SAFE LOCKS ---
export async function insertSafeLock(lock) {
  const { data, error } = await supabase.from('safe_locks').insert([lock]);
  if (error) throw error;
  return data;
}
export async function updateSafeLock(id, updates) {
  const { data, error } = await supabase.from('safe_locks').update(updates).eq('id', id);
  if (error) throw error;
  return data;
}
export async function deleteSafeLock(id) {
  const { data, error } = await supabase.from('safe_locks').delete().eq('id', id);
  if (error) throw error;
  return data;
}

// --- INTEREST LOGS ---
export async function insertInterestLog(log) {
  const { data, error } = await supabase.from('interest_logs').insert([log]);
  if (error) throw error;
  return data;
}
export async function updateInterestLog(id, updates) {
  const { data, error } = await supabase.from('interest_logs').update(updates).eq('id', id);
  if (error) throw error;
  return data;
}
export async function deleteInterestLog(id) {
  const { data, error } = await supabase.from('interest_logs').delete().eq('id', id);
  if (error) throw error;
  return data;
}
