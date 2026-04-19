export type RoundUpMode = "nearest-100" | "nearest-500" | "nearest-1000";
export type ReminderFrequency = "weekly" | "biweekly" | "monthly";

export interface AutomationSettings {
  autosaveEnabled: boolean;
  autosavePercent: number;
  paydaySweepDay: number;
  roundUpsEnabled: boolean;
  roundUpMode: RoundUpMode;
  emergencyBufferEnabled: boolean;
  emergencyBufferTarget: number;
  strictLockDefault: boolean;
  allowEarlyAccess: boolean;
  reminderFrequency: ReminderFrequency;
}

export const AUTOMATION_SETTINGS_KEY = "rilstack-automation-settings";

export const DEFAULT_AUTOMATION_SETTINGS: AutomationSettings = {
  autosaveEnabled: true,
  autosavePercent: 12,
  paydaySweepDay: 28,
  roundUpsEnabled: true,
  roundUpMode: "nearest-500",
  emergencyBufferEnabled: true,
  emergencyBufferTarget: 250000,
  strictLockDefault: true,
  allowEarlyAccess: false,
  reminderFrequency: "weekly",
};

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const formatNaira = (amount: number) =>
  `N${Math.round(amount).toLocaleString()}`;

export const loadAutomationSettings = (): AutomationSettings => {
  if (typeof window === "undefined") {
    return DEFAULT_AUTOMATION_SETTINGS;
  }

  try {
    const rawValue = window.localStorage.getItem(AUTOMATION_SETTINGS_KEY);
    if (!rawValue) {
      return DEFAULT_AUTOMATION_SETTINGS;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<AutomationSettings>;
    return {
      ...DEFAULT_AUTOMATION_SETTINGS,
      ...parsedValue,
      autosavePercent: clampNumber(
        Number(
          parsedValue.autosavePercent ??
            DEFAULT_AUTOMATION_SETTINGS.autosavePercent,
        ),
        1,
        40,
      ),
      paydaySweepDay: clampNumber(
        Number(
          parsedValue.paydaySweepDay ??
            DEFAULT_AUTOMATION_SETTINGS.paydaySweepDay,
        ),
        1,
        31,
      ),
      emergencyBufferTarget: Math.max(
        5000,
        Number(
          parsedValue.emergencyBufferTarget ??
            DEFAULT_AUTOMATION_SETTINGS.emergencyBufferTarget,
        ),
      ),
    };
  } catch {
    return DEFAULT_AUTOMATION_SETTINGS;
  }
};

export const saveAutomationSettings = (settings: AutomationSettings) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    AUTOMATION_SETTINGS_KEY,
    JSON.stringify(settings),
  );
};

export const getRoundUpAverage = (mode: RoundUpMode) => {
  if (mode === "nearest-100") return 1500;
  if (mode === "nearest-500") return 4200;
  return 7500;
};

export const estimateMonthlyAutoSave = (
  income: number,
  settings: AutomationSettings,
) => {
  const baseAutoSave = settings.autosaveEnabled
    ? income * (settings.autosavePercent / 100)
    : 0;
  const roundUps = settings.roundUpsEnabled
    ? getRoundUpAverage(settings.roundUpMode)
    : 0;
  return Math.round(baseAutoSave + roundUps);
};

export const getReminderLabel = (frequency: ReminderFrequency) => {
  if (frequency === "weekly") return "Weekly nudges";
  if (frequency === "biweekly") return "Twice monthly";
  return "Monthly check-ins";
};

export const getNextSweepLabel = (paydaySweepDay: number) => {
  const today = new Date();
  const sweepDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    paydaySweepDay,
  );
  if (sweepDate.getTime() < today.getTime()) {
    sweepDate.setMonth(sweepDate.getMonth() + 1);
  }

  return sweepDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};
