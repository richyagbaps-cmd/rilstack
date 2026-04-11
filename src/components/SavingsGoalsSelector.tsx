import { useState } from "react";
import { suggestSavingsGoals, SavingsGoal } from "@/utils/ai-savings-goals";

export default function SavingsGoalsSelector({ demographics, onSelect, customGoals = [] }: {
  demographics: any;
  onSelect: (goals: string[]) => void;
  customGoals?: string[];
}) {
  const aiGoals: SavingsGoal[] = suggestSavingsGoals(demographics);
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [customList, setCustomList] = useState<string[]>(customGoals);

  const handleToggle = (goal: string) => {
    setSelected(sel => sel.includes(goal) ? sel.filter(g => g !== goal) : [...sel, goal]);
  };
  const handleAddCustom = () => {
    if (custom.trim() && !customList.includes(custom.trim())) {
      setCustomList(list => [...list, custom.trim()]);
      setCustom("");
    }
  };

  return (
    <div className="w-full mt-6">
      <h2 className="text-lg font-bold mb-2 text-[#2c3e5f]">Choose Your Savings Goals</h2>
      <div className="flex flex-col gap-2">
        {aiGoals.map(goal => (
          <label key={goal.label} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(goal.label)}
              onChange={() => handleToggle(goal.label)}
            />
            <span>{goal.icon} <span className="font-semibold">{goal.label}</span> <span className="text-xs text-[#4A5B6E]">{goal.description}</span></span>
          </label>
        ))}
        {customList.map(goal => (
          <label key={goal} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(goal)}
              onChange={() => handleToggle(goal)}
            />
            <span>📝 <span className="font-semibold">{goal}</span> <span className="text-xs text-[#4A5B6E]">(Custom)</span></span>
          </label>
        ))}
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            placeholder="Add custom or team goal"
            className="p-2 border rounded w-full"
          />
          <button type="button" className="bg-[#00e096] text-white px-3 rounded" onClick={handleAddCustom}>Add</button>
        </div>
      </div>
      <button
        className="mt-4 bg-[#00e096] text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-[#00c080] transition text-base"
        onClick={() => onSelect(selected)}
        disabled={selected.length === 0}
      >Confirm Goals</button>
    </div>
  );
}
