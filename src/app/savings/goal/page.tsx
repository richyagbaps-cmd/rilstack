"use client";
import { useState } from "react";

const aiGoals = [
  "Emergency Fund",
  "Travel",
  "Education",
  "House Deposit",
  "Wedding",
  "New Gadget",
];

export default function SavingsGoal() {
  const [step, setStep] = useState<
    "choose" | "custom" | "team" | "teamDetails"
  >("choose");
  const [goal, setGoal] = useState<string>("");
  const [customGoal, setCustomGoal] = useState<string>("");
  const [team, setTeam] = useState({
    name: "",
    amount: "",
    date: "",
    emails: "",
    approval: false,
  });
  const [error, setError] = useState("");

  const handleSelect = (g: string) => {
    if (g === "custom") setStep("custom");
    else if (g === "team") setStep("team");
    else {
      setGoal(g);
      // Save and continue
    }
  };

  const handleCustom = () => {
    if (!customGoal) return setError("Enter a goal name");
    setGoal(customGoal);
    // Save and continue
  };

  const handleTeam = () => {
    if (!team.name || !team.amount || !team.date)
      return setError("All fields required");
    setStep("teamDetails");
  };

  const handleInvite = () => {
    // Simulate invite (send emails)
    // Save team goal
    setGoal(team.name);
    // Continue to progress bar, etc.
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Create a savings goal
        </h2>
        {step === "choose" && (
          <>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiGoals.map((g) => (
                <button
                  key={g}
                  className="bg-blue-50 rounded-lg p-4 font-semibold hover:bg-blue-100"
                  onClick={() => handleSelect(g)}
                >
                  {g}
                </button>
              ))}
              <button
                className="bg-green-50 rounded-lg p-4 font-semibold hover:bg-green-100"
                onClick={() => handleSelect("custom")}
              >
                Custom Goal
              </button>
              <button
                className="bg-yellow-50 rounded-lg p-4 font-semibold hover:bg-yellow-100"
                onClick={() => handleSelect("team")}
              >
                Team Savings Goal
              </button>
            </div>
          </>
        )}
        {step === "custom" && (
          <div>
            <label className="block mb-2 font-medium">Custom Goal Name</label>
            <input
              className="w-full border p-2 rounded mb-2"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
            />
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={handleCustom}
            >
              Create Goal
            </button>
          </div>
        )}
        {step === "team" && (
          <div className="space-y-3">
            <label className="block font-medium">Team Goal Name</label>
            <input
              className="w-full border p-2 rounded"
              value={team.name}
              onChange={(e) => setTeam({ ...team, name: e.target.value })}
            />
            <label className="block font-medium">Target Amount (₦)</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={team.amount}
              onChange={(e) => setTeam({ ...team, amount: e.target.value })}
            />
            <label className="block font-medium">Due Date</label>
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={team.date}
              onChange={(e) => setTeam({ ...team, date: e.target.value })}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
              onClick={handleTeam}
            >
              Next
            </button>
            {error && <div className="text-red-500">{error}</div>}
          </div>
        )}
        {step === "teamDetails" && (
          <div className="space-y-3">
            <label className="block font-medium">
              Invite by Email (comma separated)
            </label>
            <input
              className="w-full border p-2 rounded"
              value={team.emails}
              onChange={(e) => setTeam({ ...team, emails: e.target.value })}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={team.approval}
                onChange={(e) =>
                  setTeam({ ...team, approval: e.target.checked })
                }
              />
              Withdrawal requires admin approval
            </label>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
              onClick={handleInvite}
            >
              Send Invites & Create Goal
            </button>
          </div>
        )}
        {goal && (
          <div className="mt-6 text-green-700 font-bold text-center">
            Goal created: {goal}
          </div>
        )}
      </div>
    </div>
  );
}
