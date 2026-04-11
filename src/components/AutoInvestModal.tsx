import React, { useState } from "react";

interface AutoInvestRule {
  goalId: string;
  threshold: number;
  product: string;
}

const INVEST_PRODUCTS = [
  { key: "tbill", label: "T-bill" },
  { key: "bond", label: "Bond" },
  { key: "mutual", label: "Mutual Fund" },
];

interface AutoInvestModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (rule: AutoInvestRule) => void;
  goalId: string;
}

export default function AutoInvestModal({ open, onClose, onCreate, goalId }: AutoInvestModalProps) {
  const [threshold, setThreshold] = useState(100000);
  const [product, setProduct] = useState("tbill");

  if (!open) return null;

  const handleCreate = () => {
    if (!threshold || !product) return;
    onCreate({ goalId, threshold, product });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-md flex flex-col items-center relative">
        <button className="absolute top-4 right-4 text-[#2c3e5f] text-2xl font-bold" onClick={onClose}>&times;</button>
        <div className="p-8 w-full">
          <h2 className="text-xl font-bold mb-4 text-[#2c3e5f]">Set Auto-Invest Rule</h2>
          <label className="block mb-2 font-medium">When savings reach</label>
          <input type="number" className="w-full mb-4 px-3 py-2 border rounded" value={threshold} onChange={e => setThreshold(Number(e.target.value))} min={1} />
          <label className="block mb-2 font-medium">Invest in</label>
          <select className="w-full mb-4 px-3 py-2 border rounded" value={product} onChange={e => setProduct(e.target.value)}>
            {INVEST_PRODUCTS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <button className="w-full bg-[#2c3e5f] text-white px-4 py-2 rounded font-semibold" onClick={handleCreate}>Create Rule</button>
        </div>
      </div>
    </div>
  );
}
