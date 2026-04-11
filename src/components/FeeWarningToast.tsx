import React from "react";

export default function FeeWarningToast({ fee, onConfirm, onCancel }: { fee: number; onConfirm: () => void; onCancel: () => void }) {
  const [checked, setChecked] = React.useState(false);
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white border border-red-300 shadow-lg rounded-xl px-6 py-4 flex flex-col items-center animate-fade-in">
      <div className="text-red-600 font-bold mb-2">3.5% fee (₦{fee.toLocaleString()}) will be deducted</div>
      <div className="flex items-center gap-2 mb-2">
        <input type="checkbox" id="fee-confirm" checked={checked} onChange={e => setChecked(e.target.checked)} />
        <label htmlFor="fee-confirm" className="text-sm text-[#2c3e5f]">I understand and accept the fee</label>
      </div>
      <div className="flex gap-4">
        <button className="bg-red-600 text-white px-4 py-1 rounded" disabled={!checked} onClick={onConfirm}>Proceed</button>
        <button className="bg-gray-200 text-[#2c3e5f] px-4 py-1 rounded" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
