import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  TABLES,
  type STSavingsGoal,
  getSavingsGoalsByUser,
  getUserById,
  insertRow,
  koboToNaira,
  logTransaction,
  nairaToKobo,
  updateRow,
} from "@/lib/seatable";

type RetirementPayoutPreference = "wallet" | "compound";
type RetirementClaimReason = "retirement_age" | "incapacitation" | "early";

const RETIREMENT_RATE = 0.18;
const EARLY_WITHDRAWAL_PENALTY = 0.075;
const OFFICIAL_RETIREMENT_AGE = 60;

interface RetirementPolicyMeta {
  kind: "retirement_policy";
  payoutPreference: RetirementPayoutPreference;
  annualRate: number;
  earlyWithdrawalPenaltyRate: number;
  freeWithdrawalQuarterKeys: string[];
  officialRetirementAge: number;
  createdAt: string;
}

function quarterKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
  return `${year}-Q${quarter}`;
}

function parseSafeLocks(raw: string | undefined): Record<string, unknown>[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getRetirementPolicy(safeLocks: Record<string, unknown>[]) {
  return (
    safeLocks.find((item) => item.kind === "retirement_policy") as
      | RetirementPolicyMeta
      | undefined
  );
}

function toClientGoal(goal: STSavingsGoal) {
  const safeLocks = parseSafeLocks(goal.Safe_Locks);
  const retirementPolicy =
    goal.Type === "retirement" ? getRetirementPolicy(safeLocks) : undefined;

  return {
    id: goal.Goal_ID,
    rowId: goal._id,
    userId: goal.User_ID,
    name: goal.Name,
    type: goal.Type,
    targetAmount: koboToNaira(goal.Target_Amount || 0),
    currentAmount: koboToNaira(goal.Current_Amount || 0),
    dueDate: goal.Due_Date || "",
    safeLocks,
    lastInterestCalculationDate: goal.Last_Interest_Date || "",
    retirementPlan:
      goal.Type === "retirement"
        ? {
            fixedRatePerAnnum: RETIREMENT_RATE,
            payoutPreference: retirementPolicy?.payoutPreference || "compound",
            earlyWithdrawalPenaltyRate:
              retirementPolicy?.earlyWithdrawalPenaltyRate ||
              EARLY_WITHDRAWAL_PENALTY,
            freeWithdrawalUsedThisQuarter: Boolean(
              retirementPolicy?.freeWithdrawalQuarterKeys?.includes(quarterKey()),
            ),
            officialRetirementAge:
              retirementPolicy?.officialRetirementAge || OFFICIAL_RETIREMENT_AGE,
            projectedAnnualInterest:
              koboToNaira(goal.Current_Amount || 0) * RETIREMENT_RATE,
          }
        : undefined,
  };
}

async function findGoalByRowId(userId: string, rowId: string) {
  const goals = await getSavingsGoalsByUser(userId);
  return goals.find((goal) => goal._id === rowId) || null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const goals = await getSavingsGoalsByUser(userId);
    return NextResponse.json(goals.map(toClientGoal));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch savings" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action,
      userId,
      rowId,
      goalId,
      name,
      targetAmount,
      dueDate,
      amount,
      payoutPreference,
      claimReason,
      medicalCertified,
    } = body as {
      action?: string;
      userId?: string;
      rowId?: string;
      goalId?: string;
      name?: string;
      targetAmount?: number;
      dueDate?: string;
      amount?: number;
      payoutPreference?: RetirementPayoutPreference;
      claimReason?: RetirementClaimReason;
      medicalCertified?: boolean;
    };

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    if (action === "create_retirement_plan") {
      const existing = (await getSavingsGoalsByUser(userId)).find(
        (goal) => goal.Type === "retirement",
      );
      if (existing) {
        return NextResponse.json(
          { error: "Retirement plan already exists." },
          { status: 409 },
        );
      }

      const policy: RetirementPolicyMeta = {
        kind: "retirement_policy",
        payoutPreference: payoutPreference === "wallet" ? "wallet" : "compound",
        annualRate: RETIREMENT_RATE,
        earlyWithdrawalPenaltyRate: EARLY_WITHDRAWAL_PENALTY,
        freeWithdrawalQuarterKeys: [],
        officialRetirementAge: OFFICIAL_RETIREMENT_AGE,
        createdAt: new Date().toISOString(),
      };

      const initialAmountKobo = nairaToKobo(Number(amount || 0));
      const goal: Omit<STSavingsGoal, "_id"> = {
        Goal_ID: `ret_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
        User_ID: userId,
        Name: "Retirement Plan",
        Target_Amount: nairaToKobo(Number(targetAmount || 0)),
        Current_Amount: initialAmountKobo,
        Due_Date: dueDate,
        Type: "retirement",
        Safe_Locks: JSON.stringify([policy]),
        Interest_Accrued_Total: 0,
        Last_Interest_Date: new Date().toISOString().slice(0, 10),
      };

      const row = await insertRow(TABLES.SAVINGS_GOALS, goal as Record<string, unknown>);
      if (initialAmountKobo > 0) {
        await logTransaction({
          Transaction_ID: `txn_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
          User_ID: userId,
          Type: "retirement_deposit",
          Amount: initialAmountKobo,
          Net_Effect: initialAmountKobo,
          Balance_After: 0,
          Category_Or_Goal: "Retirement Plan",
          Reference_ID: String((row as { _id?: string })._id || ""),
        });
      }

      return NextResponse.json({ success: true }, { status: 201 });
    }

    if (action === "create" || !action) {
      if (!name || !targetAmount) {
        return NextResponse.json(
          { error: "name and targetAmount required" },
          { status: 400 },
        );
      }
      const goal: Omit<STSavingsGoal, "_id"> = {
        Goal_ID: `sg_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
        User_ID: userId,
        Name: name,
        Target_Amount: nairaToKobo(targetAmount),
        Current_Amount: 0,
        Due_Date: dueDate,
        Type: "personal",
        Safe_Locks: "[]",
        Interest_Accrued_Total: 0,
        Last_Interest_Date: new Date().toISOString().slice(0, 10),
      };
      await insertRow(TABLES.SAVINGS_GOALS, goal as Record<string, unknown>);
      return NextResponse.json({ success: true }, { status: 201 });
    }

    if (action === "deposit" || action === "retirement_deposit") {
      if (!rowId || !amount) {
        return NextResponse.json(
          { error: "rowId and amount required" },
          { status: 400 },
        );
      }
      const amtKobo = nairaToKobo(amount);
      await updateRow(TABLES.SAVINGS_GOALS, rowId, {
        Current_Amount: { $add: amtKobo },
      });
      await logTransaction({
        Transaction_ID: `txn_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
        User_ID: userId,
        Type: action === "retirement_deposit" ? "retirement_deposit" : "savings_deposit",
        Amount: amtKobo,
        Net_Effect: amtKobo,
        Balance_After: 0,
        Category_Or_Goal: name || "Savings",
        Reference_ID: goalId || rowId,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "withdraw" || action === "retirement_withdraw") {
      if (!rowId || !amount) {
        return NextResponse.json(
          { error: "rowId and amount required" },
          { status: 400 },
        );
      }

      const goal = await findGoalByRowId(userId, rowId);
      if (!goal) {
        return NextResponse.json({ error: "Goal not found" }, { status: 404 });
      }

      const amtKobo = nairaToKobo(amount);
      if (amtKobo <= 0) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }
      if (amtKobo > (goal.Current_Amount || 0)) {
        return NextResponse.json(
          { error: "Insufficient balance" },
          { status: 400 },
        );
      }

      let penaltyKobo = 0;
      const safeLocks = parseSafeLocks(goal.Safe_Locks);
      const policy = getRetirementPolicy(safeLocks);

      if (action === "retirement_withdraw") {
        const user = await getUserById(userId);
        const ageFromDob = user?.Date_Of_Birth
          ? Math.floor(
              (Date.now() - new Date(user.Date_Of_Birth).getTime()) /
                (1000 * 60 * 60 * 24 * 365.25),
            )
          : 0;

        const reason: RetirementClaimReason =
          claimReason === "retirement_age" || claimReason === "incapacitation"
            ? claimReason
            : "early";

        const retirementAgeMet = reason === "retirement_age" && ageFromDob >= OFFICIAL_RETIREMENT_AGE;
        const incapacitationApproved = reason === "incapacitation" && Boolean(medicalCertified);

        if (!retirementAgeMet && !incapacitationApproved) {
          const currentQuarter = quarterKey();
          const usedQuarterKeys = policy?.freeWithdrawalQuarterKeys || [];
          const hasFreeQuarterWithdrawal = !usedQuarterKeys.includes(currentQuarter);

          if (hasFreeQuarterWithdrawal && policy) {
            policy.freeWithdrawalQuarterKeys = [...usedQuarterKeys, currentQuarter];
            await updateRow(TABLES.SAVINGS_GOALS, rowId, {
              Safe_Locks: JSON.stringify(
                safeLocks.map((item) =>
                  item.kind === "retirement_policy" ? policy : item,
                ),
              ),
            });
          } else {
            const penaltyRate =
              policy?.earlyWithdrawalPenaltyRate || EARLY_WITHDRAWAL_PENALTY;
            penaltyKobo = Math.round(amtKobo * penaltyRate);
          }
        }
      }

      await updateRow(TABLES.SAVINGS_GOALS, rowId, {
        Current_Amount: { $subtract: amtKobo },
      });

      await logTransaction({
        Transaction_ID: `txn_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
        User_ID: userId,
        Type: action === "retirement_withdraw" ? "retirement_withdrawal" : "savings_withdrawal",
        Amount: amtKobo,
        Fee: penaltyKobo > 0 ? penaltyKobo : undefined,
        Net_Effect: -(amtKobo - penaltyKobo),
        Balance_After: 0,
        Category_Or_Goal: name || goal.Name,
        Reference_ID: goalId || rowId,
      });

      return NextResponse.json({
        success: true,
        penalty: koboToNaira(penaltyKobo),
        netAmount: koboToNaira(amtKobo - penaltyKobo),
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed" },
      { status: 500 },
    );
  }
}
