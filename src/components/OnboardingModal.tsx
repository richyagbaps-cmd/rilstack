import React, { useState } from "react";

const steps = [
  {
    title: "Welcome to Rilstack!",
    description:
      "Budget, save, and invest—all in one free app. Let’s take a quick tour!",
  },
  {
    title: "Budget Smarter",
    description:
      "Track your spending, set budgets, and get insights to improve your financial habits.",
  },
  {
    title: "Save with Safelock",
    description:
      "Lock away funds for your goals and earn better returns with our secure savings options.",
  },
  {
    title: "Invest Easily",
    description:
      "Grow your wealth with curated investment options tailored for you.",
  },
  {
    title: "Get Started!",
    description:
      "You’re all set. Explore the dashboard and take control of your finances!",
  },
];

export default function OnboardingModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close onboarding"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-2">{steps[step].title}</h2>
        <p className="mb-6 text-gray-700">{steps[step].description}</p>
        <div className="flex justify-between items-center">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Back
          </button>
          {step < steps.length - 1 ? (
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white"
              onClick={() => setStep((s) => s + 1)}
            >
              Next
            </button>
          ) : (
            <button
              className="px-4 py-2 rounded bg-green-600 text-white"
              onClick={onClose}
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
