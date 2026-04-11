import React, { useState } from "react";

interface CreateGoalModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (goal: {
    name: string;
    target: number;
    deadline: string;
    team?: string[];
    fundingSource: "budget" | "deposit" | "auto-transfer";
  }) => void;
  aiSuggestions: string[];
}

export default function CreateGoalModal({ open, onClose, onCreate, aiSuggestions }: CreateGoalModalProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [target, setTarget] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [fundingSource, setFundingSource] = useState<"budget" | "deposit" | "auto-transfer">("budget");
  const [teamMode, setTeamMode] = useState(false);
  const [teamEmails, setTeamEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");

  if (!open) return null;

  const handleAddEmail = () => {
    if (emailInput && !teamEmails.includes(emailInput)) {
      setTeamEmails([...teamEmails, emailInput]);
      setEmailInput("");
    }
  };

  const handleCreate = () => {
    if (!name || !target || !deadline) return;
    onCreate({ name, target, deadline, team: teamMode ? teamEmails : undefined, fundingSource });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-md flex flex-col items-center relative">
        <button className="absolute top-4 right-4 text-[#2c3e5f] text-2xl font-bold" onClick={onClose}>&times;</button>
        <div className="p-8 w-full">
          <h2 className="text-xl font-bold mb-4 text-[#2c3e5f]">Create Savings Goal</h2>
          {step === 0 && (
            <>
              <div className="mb-4">
                <div className="font-semibold mb-2">AI Suggestions</div>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map(s => (
                    <button key={s} className="bg-[#f3f4fa] px-3 py-1 rounded-full text-[#2c3e5f] border border-[#e6eaf0]" onClick={() => { setName(s); setStep(1); }}>{s}</button>
                  ))}
                </div>
              </div>
              <button className="mt-2 text-[#00e096] underline" onClick={() => setStep(1)}>Custom goal</button>
            </>
          )}
          {step === 1 && (
            <>
              <label className="block mb-2 font-medium">Goal Name</label>
              <input className="w-full mb-4 px-3 py-2 border rounded" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Emergency fund" />
              <label className="block mb-2 font-medium">Target Amount (₦)</label>
              <input type="number" className="w-full mb-4 px-3 py-2 border rounded" value={target} onChange={e => setTarget(Number(e.target.value))} min={1} />
              <label className="block mb-2 font-medium">Deadline</label>
              <input type="date" className="w-full mb-4 px-3 py-2 border rounded" value={deadline} onChange={e => setDeadline(e.target.value)} />
              <label className="block mb-2 font-medium">Funding Source</label>
              <select className="w-full mb-4 px-3 py-2 border rounded" value={fundingSource} onChange={e => setFundingSource(e.target.value as any)}>
                <option value="budget">Unallocated budget surplus</option>
                <option value="deposit">Direct deposit</option>
                <option value="auto-transfer">Automatic daily/weekly transfer</option>
              </select>
              <div className="flex items-center gap-2 mb-4">
                <input type="checkbox" id="team-mode" checked={teamMode} onChange={e => setTeamMode(e.target.checked)} />
                <label htmlFor="team-mode" className="text-[#2c3e5f]">Team savings goal</label>
              </div>
              {teamMode && (
                <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                    <input className="flex-1 px-2 py-1 border rounded" placeholder="Invite by email" value={emailInput} onChange={e => setEmailInput(e.target.value)} />
                    <button className="bg-[#00e096] text-white px-3 py-1 rounded" onClick={handleAddEmail} type="button">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {teamEmails.map(email => (
                      <span key={email} className="bg-[#e6f7e6] px-2 py-1 rounded-full text-xs text-[#2c3e5f]">{email}</span>
                    ))}
                  </div>
                </div>
              )}
              <button className="w-full bg-[#00e096] text-white px-4 py-2 rounded font-semibold" onClick={handleCreate}>Create Goal</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
