import React, { useState } from "react";
import BudgetModeSelector from "./BudgetModeSelector";
import BudgetTypeSelector from "./BudgetTypeSelector";
import DemographicsForm from "./DemographicsForm";
import AIAllocationEditor from "./AIAllocationEditor";
import FrequencyStep from "./FrequencyStep";
import ScheduleStep from "./ScheduleStep";

import StrictUnlockStep from "./StrictUnlockStep";
import TermsPinStep from "./TermsPinStep";


interface BudgetingFlowModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BudgetingFlowModal({ open, onClose }: BudgetingFlowModalProps) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"strict" | "relaxed" | null>(null);
  const [type, setType] = useState<"502030" | "zero-based" | "custom" | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [income, setIncome] = useState<number | null>(null);
  const [pockets, setPockets] = useState<any[]>([]);
  const [frequencies, setFrequencies] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [strictUnlocks, setStrictUnlocks] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-3xl flex flex-col items-center relative">
        <button className="absolute top-4 right-4 text-[#2c3e5f] text-2xl font-bold" onClick={onClose}>&times;</button>
        {step === 0 && (
          <BudgetModeSelector onModeSelect={m => { setMode(m); setStep(1); }} />
        )}
        {step === 1 && mode && (
          <BudgetTypeSelector onTypeSelect={t => { setType(t); setStep(2); }} />
        )}
        {step === 2 && mode && type && (
          <DemographicsForm
            mode={mode}
            type={type}
            onSubmit={(profileData: any, totalIncome: number) => {
              setProfile(profileData);
              setIncome(totalIncome);
              setStep(3);
            }}
          />
        )}
        {step === 3 && mode && type && profile && income != null && (
          <AIAllocationEditor
            income={income}
            budgetType={type}
            profile={profile}
            onChange={(pocketsOut, totalAllocated, unallocated) => {
              setPockets(pocketsOut);
            }}
          />
        )}
        {step === 4 && pockets.length > 0 && (
          <FrequencyStep
            pockets={pockets}
            onChange={freqPockets => setFrequencies(freqPockets)}
          />
        )}
        {step === 5 && frequencies.length > 0 && (
          <ScheduleStep
            startDate={startDate}
            endDate={endDate}
            onChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
          />
        )}
        {step === 6 && mode === "strict" && startDate && pockets.length > 0 && (
          <StrictUnlockStep
            pockets={pockets}
            startDate={startDate}
            onChange={setStrictUnlocks}
          />
        )}
        {((step === 6 && mode === "strict" && strictUnlocks.length === pockets.length) || (step === 5 && mode !== "strict" && startDate && endDate)) && !showSuccess && (
          <TermsPinStep
            mode={mode!}
            onConfirm={() => {
              setShowSuccess(true);
              setTimeout(() => {
                window.location.href = "/budgets/budget/dashboard";
              }, 1800);
            }}
          />
        )}
        {showSuccess && (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <svg className="animate-bounce mb-4" width="80" height="80" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#00e096"/><path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div className="text-2xl font-bold text-[#00e096] mb-2">Budget Created!</div>
            <div className="text-[#2c3e5f]">Redirecting to your Budget Dashboard...</div>
          </div>
        )}
        {/* Navigation Buttons */}
        {!showSuccess && (
          <div className="w-full flex justify-between items-center p-4 mt-2">
            {step > 0 && step < 7 && (
              <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => setStep(step - 1)}>Back</button>
            )}
            {step === 3 && pockets.length > 0 && (
              <button className="bg-[#00e096] text-white px-4 py-2 rounded" onClick={() => setStep(4)}>Next: Set Frequency</button>
            )}
            {step === 4 && frequencies.length > 0 && (
              <button className="bg-[#00e096] text-white px-4 py-2 rounded" onClick={() => setStep(5)}>Next: Schedule</button>
            )}
            {step === 5 && startDate && endDate && mode === "strict" && (
              <button className="bg-[#00e096] text-white px-4 py-2 rounded" onClick={() => setStep(6)}>Next: Unlock Schedule</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}