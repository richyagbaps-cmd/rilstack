"use client";
import React, { useEffect, useState } from 'react';

// Define interfaces for all table data (adjust fields as needed)
interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  created_at: string;
}
interface KycDetail {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  date_of_birth: string;
  gender: string;
  occupation: string;
  income_range: string;
  address: string;
  city: string;
  state: string;
  country: string;
  nationality: string;
  bvn: string;
  nin: string;
  id_document_type: string;
  id_document_url: string;
  proof_of_address_url: string;
  is_verified: boolean;
  verified_at: string;
  created_at: string;
}
interface Budget {
  id: string;
  user_id: string;
  name: string;
  budget_type: string;
  mode: string;
  penalty_fee_percent: number;
  start_date: string;
  end_date: string;
  spending_frequency: string;
  total_budget: number;
  needs_amount: number;
  wants_amount: number;
  savings_amount: number;
  created_at: string;
  terms_accepted: boolean;
  user_pin_hash: string;
}
interface BudgetCategory {
  id: string;
  budget_id: string;
  name: string;
  allocated_amount: number;
  spent_so_far: number;
  is_need: boolean;
  is_want: boolean;
  requires_safe_lock: boolean;
  created_at: string;
}
interface Transaction {
  id: string;
  user_id: string;
  budget_id: string;
  category_id: string;
  amount: number;
  type: string;
  description: string;
  penalty_fee_applied: number;
  created_at: string;
}
interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  is_team_goal: boolean;
  team_members: any;
  deadline: string;
  ai_suggested: boolean;
  created_at: string;
}
interface SafeLock {
  id: string;
  user_id: string;
  amount: number;
  release_date: string;
  created_at: string;
}
interface InterestLog {
  id: string;
  user_id: string;
  savings_balance_basis: number;
  daily_rate: number;
  interest_earned: number;
  date: string;
}


export default function AdminDashboard() {


  return (
    <div style={{padding: 24}}>
      <h1>Admin Dashboard</h1>
      <p>Supabase integration has been removed. No data to display.</p>
    </div>
  );
}
