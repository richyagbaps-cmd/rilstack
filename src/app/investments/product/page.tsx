"use client";
import { useState } from "react";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
// TODO: Get productId from route/query if available
const defaultProduct = {
  id: "prod1",
  name: "Rilstack Fixed Income",
  description:
    "A low-risk fixed income product with 18% annualized return. Principal is protected and paid at maturity.",
  unit: 10000,
  available: 50,
  rate: 0.18,
  tenor: 6, // months
  risk: "Low",
  maturity: "2026-10-19",
};

  const [productDetail, setProductDetail] = useState<any>(defaultProduct);
  const [units, setUnits] = useState(1);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userSavings, setUserSavings] = useState(0);
  const searchParams = useSearchParams();

  // Fetch product detail by ID if available, and user savings balance
  useEffect(() => {
    const productId = searchParams.get("id");
    if (productId) {
      fetch(`/api/products`)
        .then((res) => res.json())
        .then((products) => {
          const found = products.find((p: any) => p.id === productId);
          if (found) setProductDetail(found);
        });
    }
    // Fetch user savings balance
    const userId = localStorage.getItem("user_id");
    if (userId) {
      fetch(`/api/payment/account?userId=${userId}`)
        .then((res) => res.json())
        .then((result) => {
          // Try to find savings or main wallet
          const acc = (result.accounts || []).find((a: any) => a.type === "savings" || a.type === "checking");
          setUserSavings(acc?.availableBalance || 0);
        });
    }
  }, [searchParams]);

  const totalCost = units * productDetail.unit;
  const canBuy =
    units > 0 && units <= productDetail.available && totalCost <= userSavings;

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!canBuy) {
      setError("Check units and savings balance.");
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      setError("PIN must be 4-6 digits.");
      return;
    }
    setLoading(true);
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setError("User not logged in");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/investment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          productId: productDetail.id,
          units,
          amountInvested: totalCost,
          expectedReturnTotal: Math.round(totalCost * productDetail.rate),
          startDate: new Date(),
          expectedEndDate: new Date(new Date().setMonth(new Date().getMonth() + (productDetail.tenor || 6))),
          status: "active",
        }),
      });
      if (!res.ok) throw new Error("Failed to invest");
      setSuccess(true);
    } catch (err) {
      setError("Failed to invest");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-2">{productDetail.name}</h2>
      <div className="mb-2 text-gray-700">{productDetail.description}</div>
      <div className="mb-2">
        Unit Amount:{" "}
        <span className="font-bold">
          ₦{productDetail.unit.toLocaleString()}
        </span>
      </div>
      <div className="mb-2">
        Units Available:{" "}
        <span className="font-bold">{productDetail.available}</span>
      </div>
      <div className="mb-2">
        Expected Return:{" "}
        <span className="font-bold">
          {(productDetail.rate * 100).toFixed(1)}%
        </span>
      </div>
      <div className="mb-2">
        Tenor: <span className="font-bold">{productDetail.tenor} months</span>
      </div>
      <div className="mb-2">
        Maturity Date:{" "}
        <span className="font-bold">{productDetail.maturity}</span>
      </div>
      <div className="mb-2">
        Risk Level:{" "}
        <span
          className={`font-bold ${productDetail.risk === "Low" ? "text-green-600" : productDetail.risk === "Medium" ? "text-yellow-600" : "text-red-600"}`}
        >
          {productDetail.risk}
        </span>
      </div>
      <div className="mb-2">
        Your Savings Balance:{" "}
        <span className="font-bold">₦{userSavings.toLocaleString()}</span>
      </div>
      <form onSubmit={handlePurchase} className="space-y-3 mt-4">
        <div>
          <label className="block mb-1 font-medium">Number of Units</label>
          <input
            type="number"
            min={1}
            max={productDetail.available}
            className="w-full border p-2 rounded"
            value={units}
            onChange={(e) => setUnits(Number(e.target.value))}
            required
          />
        </div>
        <div>
          Total Cost:{" "}
          <span className="font-bold">₦{totalCost.toLocaleString()}</span>
        </div>
        <div>
          <label className="block mb-1 font-medium">Confirm with PIN</label>
          <input
            type="password"
            maxLength={6}
            minLength={4}
            pattern="\d*"
            className="w-full border p-2 rounded"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            required
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
          disabled={success || !canBuy}
        >
          Invest Now
        </button>
        {success && (
          <div className="text-green-600 font-bold text-center mt-2">
            Investment successful!
          </div>
        )}
      </form>
    </div>
  );
}
