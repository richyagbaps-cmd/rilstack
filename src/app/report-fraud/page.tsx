"use client";
import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const INCIDENT_TYPES = [
  "Unauthorized transaction",
  "Phishing attempt",
  "Account takeover suspected",
  "Lost or stolen device",
  "Other",
];

function ReportFraudFlowContent() {
  const router = useRouter();
  const params = useSearchParams();
  const transactionId = params.get("tx") || "";

  const [step, setStep] = useState(1);
  const [incidentType, setIncidentType] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [ticket, setTicket] = useState("");

  // Step 1: Incident Type
  const handleIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentType) {
      setError("Select an incident type");
      return;
    }
    setError("");
    setStep(2);
  };

  // Step 2: Details
  const handleDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.length < 20) {
      setError("Description must be at least 20 characters");
      return;
    }
    setError("");
    setStep(3);
  };

  // Step 3: Confirm Identity
  const handleIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError("Enter your PIN to confirm");
      return;
    }
    setError("");
    setStep(4);
  };

  // Step 4: Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      const ticketNum = "FR" + Math.floor(Math.random() * 900 + 100);
      setTicket(ticketNum);
      setSuccess(
        `Your fraud report ${ticketNum} is under review. You will receive a confirmation email/SMS.`
      );
      // Optionally: router.push("/support-tickets?new=" + ticketNum);
    }, 1500);
  };

  // File upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {        
    if (!e.target.files) return;
    const selected = Array.from(e.target.files).slice(0, 5 - files.length);     
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
  };
  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow p-6 space-y-6">
        <h2 className="text-2xl font-bold text-[#D32F2F] mb-2 text-center">Report Fraud</h2>
        {step === 1 && (
          <form onSubmit={handleIncident} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Incident Type</label>
              <div className="space-y-2">
                {INCIDENT_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-2">        
                    <input
                      type="radio"
                      name="incidentType"
                      value={type}
                      checked={incidentType === type}
                      onChange={() => setIncidentType(type)}
                      className="accent-[#D32F2F]"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
            {error && <div className="text-red-600 text-xs">{error}</div>}      
            <button
              type="submit"
              className="w-full rounded bg-[#D32F2F] text-white font-semibold py-2 mt-2 hover:bg-[#b71c1c]"
            >
              Continue
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleDetails} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Transaction ID (if applicable)</label>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={transactionId}
                  disabled={!!transactionId}
                  onChange={() => {}}
                  placeholder="e.g. TX123456"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Amount (if known)</label>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full rounded border px-3 py-2"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  className="w-full rounded border px-3 py-2 min-h-[80px]"      
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  minLength={20}
                  required
                  placeholder="Describe what happened (min 20 chars)"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1">Upload Evidence (up to 5 files)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  disabled={files.length >= 5}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-[#F8F9FA] px-2 py-1 rounded text-xs">
                      {file.name}
                      <button type="button" className="text-[#D32F2F] ml-1" onClick={() => removeFile(idx)}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {error && <div className="text-red-600 text-xs">{error}</div>}      
            <button
              type="submit"
              className="w-full rounded bg-[#D32F2F] text-white font-semibold py-2 mt-2 hover:bg-[#b71c1c]"
            >
              Continue
            </button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleIdentity} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Confirm with PIN</label>
              <input
                type="password"
                className="w-full rounded border px-3 py-2"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your PIN"
                required
              />
            </div>
            {error && <div className="text-red-600 text-xs">{error}</div>}      
            <button
              type="submit"
              className="w-full rounded bg-[#D32F2F] text-white font-semibold py-2 mt-2 hover:bg-[#b71c1c]"
            >
              Continue
            </button>
          </form>
        )}
        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-sm bg-[#FFF3E0] border border-[#FFD180] rounded p-3 text-[#D32F2F]">
              <strong>Disclaimer:</strong> False reporting may lead to account suspension.
            </div>
            <button
              type="submit"
              className="w-full rounded bg-[#D32F2F] text-white font-semibold py-2 mt-2 hover:bg-[#b71c1c]"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        )}
        {success && (
          <div className="text-green-700 text-center font-semibold py-4">       
            {success}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportFraudFlow() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
      <ReportFraudFlowContent />
    </Suspense>
  );
}

