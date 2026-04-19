// AI helper for savings goals
export type SavingsGoal = {
  label: string;
  description: string;
  icon?: string;
};

export function suggestSavingsGoals(demographics: any): SavingsGoal[] {
  // Example AI logic: suggest based on age, occupation, etc.
  const goals: SavingsGoal[] = [
    {
      label: "Emergency Fund",
      description: "Save for unexpected expenses",
      icon: "🛡️",
    },
    {
      label: "Rent / House",
      description: "Save for rent or a new home",
      icon: "🏠",
    },
    {
      label: "Education",
      description: "Save for school or courses",
      icon: "🎓",
    },
    { label: "Travel", description: "Save for a trip or vacation", icon: "✈️" },
    {
      label: "Business",
      description: "Save to start or grow a business",
      icon: "💼",
    },
    {
      label: "Team Savings",
      description: "Save together with friends or family",
      icon: "🤝",
    },
  ];
  // Example: prioritize education for students, business for self-employed, etc.
  if (demographics.occupation === "Student") {
    return [goals[2], goals[0], goals[3], goals[5]];
  }
  if (demographics.occupation === "Self-Employed") {
    return [goals[4], goals[0], goals[1], goals[5]];
  }
  return goals;
}
