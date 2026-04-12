import React, { useEffect, useState } from 'react';
import {
  fetchProfiles, fetchKycDetails, fetchBudgets, fetchBudgetCategories, fetchTransactions, fetchSavingsGoals, fetchSafeLocks, fetchInterestLogs
} from '@/lib/supabaseAdminQueries';
import {
  insertProfile, updateProfile, deleteProfile,
  insertKycDetails, updateKycDetails, deleteKycDetails,
  insertBudget, updateBudget, deleteBudget,
  insertBudgetCategory, updateBudgetCategory, deleteBudgetCategory,
  insertTransaction, updateTransaction, deleteTransaction,
  insertSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
  insertSafeLock, updateSafeLock, deleteSafeLock,
  insertInterestLog, updateInterestLog, deleteInterestLog
} from '@/lib/supabaseAdminMutations';

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [kycDetails, setKycDetails] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [safeLocks, setSafeLocks] = useState([]);
  const [interestLogs, setInterestLogs] = useState([]);

  useEffect(() => {
    fetchProfiles().then(setProfiles);
    fetchKycDetails().then(setKycDetails);
    fetchBudgets().then(setBudgets);
    fetchBudgetCategories().then(setBudgetCategories);
    fetchTransactions().then(setTransactions);
    fetchSavingsGoals().then(setSavingsGoals);
    fetchSafeLocks().then(setSafeLocks);
    fetchInterestLogs().then(setInterestLogs);
  }, []);

  return (
    <div style={{padding: 24}}>
      <h1>Admin Dashboard</h1>
      <h2>Profiles</h2>
      <pre>{JSON.stringify(profiles, null, 2)}</pre>
      <h2>KYC Details</h2>
      <pre>{JSON.stringify(kycDetails, null, 2)}</pre>
      <h2>Budgets</h2>
      <pre>{JSON.stringify(budgets, null, 2)}</pre>
      <h2>Budget Categories</h2>
      <pre>{JSON.stringify(budgetCategories, null, 2)}</pre>
      <h2>Transactions</h2>
      <pre>{JSON.stringify(transactions, null, 2)}</pre>
      <h2>Savings Goals</h2>
      <pre>{JSON.stringify(savingsGoals, null, 2)}</pre>
      <h2>Safe Locks</h2>
      <pre>{JSON.stringify(safeLocks, null, 2)}</pre>
      <h2>Interest Logs</h2>
      <pre>{JSON.stringify(interestLogs, null, 2)}</pre>
    </div>
  );
}
