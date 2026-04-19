/*
  This file contains global accessibility and responsiveness helpers.
  - Mobile-first: Tailwind responsive classes
  - ARIA: Use aria-label, role, tabIndex, focus management in modals/components
  - Keyboard: All buttons/inputs are keyboard accessible
  - Error UX: Use aria-live, clear messages, suggestions
*/

import React from "react";

export function ErrorMessage({
  message,
  suggestion,
}: {
  message: string;
  suggestion?: string;
}) {
  return (
    <div
      className="bg-red-50 border border-red-300 text-red-700 rounded p-2 mt-2"
      role="alert"
      aria-live="assertive"
    >
      <div>{message}</div>
      {suggestion && (
        <div className="text-xs text-gray-600 mt-1">{suggestion}</div>
      )}
    </div>
  );
}

// Usage: <ErrorMessage message="Invalid PIN" suggestion="PIN must be 4-6 digits." />

// For modals: set focus to first input/button when opened, trap focus, close on Esc
// For navigation: use semantic <nav>, <main>, <header>, <footer>
// For forms: use <label htmlFor=...> and aria-label
// For toggles: use <input type="checkbox"> with label
// For lists: use <ul>/<li> and aria-label
// For icons: use role="img" and aria-label
// For all interactive elements: ensure tabIndex=0 or native focusable
