// AI helper for pocket frequency suggestion
export type Frequency = "daily" | "weekly" | "monthly";

export function suggestPocketFrequency(pocketLabel: string, amount: number): Frequency {
  // Example logic: higher amounts = monthly, lower = daily, else weekly
  if (amount >= 100000) return "monthly";
  if (amount <= 20000) return "daily";
  return "weekly";
}
