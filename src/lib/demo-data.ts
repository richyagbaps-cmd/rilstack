// Demo data for the logged-in owner account.
// All new real users start at ₦0 across all sections.

export const DEMO_EMAIL = "richyagbaps@gmail.com"; // Owner's email - gets demo balance

export const DEMO_TOTAL_BALANCE = 10_456_993.38;

// Split: Budget ₦2,500,000 | Savings ₦3,456,993.38 | Investments ₦4,500,000
export const DEMO_BUDGET_ALLOCATED = 2_500_000;
export const DEMO_BUDGET_SPENT     = 1_875_000;

export const DEMO_SAVINGS_GOALS = [
  {
    id: "demo-sg-1",
    name: "Emergency Fund",
    target: 2_000_000,
    saved: 1_500_000,
    currentAmount: 1_500_000,
    dailyRate: 0.03,
    startDate: "2026-01-15",
    lastInterestCalculationDate: "2026-04-01",
    safeLocks: [],
  },
  {
    id: "demo-sg-2",
    name: "House Deposit",
    target: 5_000_000,
    saved: 1_200_000,
    currentAmount: 1_200_000,
    dailyRate: 0.03,
    startDate: "2026-02-01",
    lastInterestCalculationDate: "2026-04-01",
    safeLocks: [],
  },
  {
    id: "demo-sg-3",
    name: "Vacation Fund",
    target: 1_000_000,
    saved: 756_993.38,
    currentAmount: 756_993.38,
    dailyRate: 0.03,
    startDate: "2026-03-10",
    lastInterestCalculationDate: "2026-04-01",
    safeLocks: [],
  },
];

export const DEMO_INVESTMENTS = [
  {
    id: "demo-inv-1",
    productName: "FGN Bond 2028",
    amountInvested: 2_000_000,
    expectedReturnTotal: 360_000,
    rate: 0.18,
    status: "active",
    startDate: "2026-01-20",
    expectedEndDate: "2028-01-20",
    units: 40,
  },
  {
    id: "demo-inv-2",
    productName: "91-Day Treasury Bill",
    amountInvested: 1_500_000,
    expectedReturnTotal: 67_500,
    rate: 0.18,
    status: "active",
    startDate: "2026-04-01",
    expectedEndDate: "2026-06-30",
    units: 30,
  },
  {
    id: "demo-inv-3",
    productName: "Commercial Paper — Dangote",
    amountInvested: 1_000_000,
    expectedReturnTotal: 205_000,
    rate: 0.205,
    status: "active",
    startDate: "2026-03-01",
    expectedEndDate: "2027-03-01",
    units: 20,
  },
];

export const DEMO_TRANSACTIONS = [
  { label: "Salary Credit", sub: "Apr 15", amount: "+₦2,500,000", color: "#22C55E" },
  { label: "Budget: Groceries", sub: "Apr 14", amount: "-₦45,000", color: "#EF4444" },
  { label: "Savings — Emergency", sub: "Apr 13", amount: "-₦100,000", color: "#5BB5E0" },
  { label: "Investment — FGN Bond", sub: "Apr 10", amount: "-₦500,000", color: "#A78BFA" },
  { label: "Interest Earned", sub: "Apr 09", amount: "+₦3,150", color: "#22C55E" },
];

export function fmt(n: number) {
  return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
