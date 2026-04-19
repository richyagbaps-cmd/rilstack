export const formatCurrency = (
  amount: number,
  currency: string = "USD",
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

export const getDaysUntil = (date: Date | string): number => {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const difference = targetDate.getTime() - today.getTime();
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
};

export const calculateROI = (
  currentValue: number,
  investedAmount: number,
): number => {
  if (investedAmount === 0) return 0;
  return ((currentValue - investedAmount) / investedAmount) * 100;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const groupBy = <T, K extends string | number>(
  arr: T[],
  fn: (item: T) => K,
): Record<K, T[]> => {
  return arr.reduce(
    (result, item) => {
      const key = fn(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
      return result;
    },
    {} as Record<K, T[]>,
  );
};
