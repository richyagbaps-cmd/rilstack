import React from "react";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <img src="/images/rilstack-logo.png" alt="Rilstack Logo" className="w-60 h-60 mb-6 animate-bounce" />
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Rilstack</h1>
      <p className="text-blue-700">Budget, Save, Invest</p>
      <div className="mt-8">
        <span className="inline-block w-2 h-2 mx-1 bg-blue-400 rounded-full animate-pulse"></span>
        <span className="inline-block w-2 h-2 mx-1 bg-blue-300 rounded-full animate-pulse delay-150"></span>
        <span className="inline-block w-2 h-2 mx-1 bg-blue-200 rounded-full animate-pulse delay-300"></span>
      </div>
    </div>
  );
}
