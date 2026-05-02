"use client";

import React, { useEffect, useState } from "react";

const PIN_STORAGE_KEY = "rilstack-user-pin";

function hashPin(digits: string[]) {
  const raw = digits.join("");
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 33) ^ raw.charCodeAt(i);
  }
  return "ph_" + Math.abs(hash >>> 0).toString(36);
}

export function hasPin(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(PIN_STORAGE_KEY);
}

export function savePinHash(digits: string[]) {
  localStorage.setItem(PIN_STORAGE_KEY, hashPin(digits));
}

export function verifyPin(digits: string[]): boolean {
  const stored = localStorage.getItem(PIN_STORAGE_KEY);
  if (!stored) return false;
  return hashPin(digits) === stored;
}

// Convenience wrappers used by the new PinModal
export function hasPinStr(): boolean {
  return hasPin();
}
export function savePinStr(pin: string): void {
  savePinHash(pin.split(""));
}
export function verifyPinStr(pin: string): boolean {
  return verifyPin(pin.split(""));
}

interface PinConfirmModalProps {
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  open?: boolean;
}

export default function PinConfirmModal({
  title = "Confirm Action",
  description = "Enter your 4-digit PIN to continue",
  onConfirm,
  onCancel,
  open = true,
}: PinConfirmModalProps) {
  if (!open) return null;
  const [step, setStep] = useState<"enter" | "create" | "confirm">(() =>
    hasPin() ? "enter" : "create",
  );
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [confirmDigits, setConfirmDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");

  useEffect(() => {
    setTimeout(() => document.getElementById("gpin-0")?.focus(), 50);
  }, [step]);

  const handleInput = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    idx: number,
    val: string,
  ) => {
    if (val && !/^\d$/.test(val)) return;
    setter((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
    if (val && idx < 3) {
      document.getElementById(`gpin-${idx + 1}`)?.focus();
    }
  };

  const handleKeyDown = (
    values: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    idx: number,
    e: React.KeyboardEvent,
  ) => {
    if (e.key === "Backspace" && !values[idx] && idx > 0) {
      setter((prev) => {
        const next = [...prev];
        next[idx - 1] = "";
        return next;
      });
      document.getElementById(`gpin-${idx - 1}`)?.focus();
    }
  };

  const renderInputs = (
    values: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => (
    <div className="mt-4 flex justify-center gap-3">
      {values.map((d, i) => (
        <input
          key={i}
          id={`gpin-${i}`}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleInput(setter, i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(values, setter, i, e)}
          className="h-14 w-14 rounded-xl border-2 border-slate-200 text-center text-2xl font-bold text-slate-900 outline-none focus:border-cyan-500 transition-colors"
        />
      ))}
    </div>
  );

  const submit = () => {
    if (step === "create") {
      if (digits.some((d) => !d)) {
        setError("Enter all 4 digits");
        return;
      }
      setError("");
      setConfirmDigits(["", "", "", ""]);
      setStep("confirm");
      return;
    }

    if (step === "confirm") {
      if (confirmDigits.some((d) => !d)) {
        setError("Enter all 4 digits");
        return;
      }
      if (digits.join("") !== confirmDigits.join("")) {
        setError("PINs do not match. Try again.");
        setConfirmDigits(["", "", "", ""]);
        return;
      }
      savePinHash(digits);
      onConfirm();
      return;
    }

    // step === 'enter'
    if (digits.some((d) => !d)) {
      setError("Enter all 4 digits");
      return;
    }
    if (!verifyPin(digits)) {
      setError("Incorrect PIN");
      setDigits(["", "", "", ""]);
      return;
    }
    onConfirm();
  };

  const stepTitle =
    step === "create"
      ? "Create Your PIN"
      : step === "confirm"
        ? "Confirm PIN"
        : title;
  const stepDesc =
    step === "create"
      ? "Set a 4-digit PIN to secure all your actions"
      : step === "confirm"
        ? "Re-enter your PIN to confirm"
        : description;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-100">
            <svg
              className="h-7 w-7 text-cyan-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900">{stepTitle}</h3>
          <p className="mt-2 text-sm text-slate-500">{stepDesc}</p>
        </div>

        {renderInputs(
          step === "confirm" ? confirmDigits : digits,
          step === "confirm" ? setConfirmDigits : setDigits,
        )}

        {error && (
          <p className="mt-3 text-center text-sm text-red-600">{error}</p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 py-3 text-sm font-semibold text-white hover:opacity-95 transition-colors"
          >
            {step === "create"
              ? "Next"
              : step === "confirm"
                ? "Set PIN"
                : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
