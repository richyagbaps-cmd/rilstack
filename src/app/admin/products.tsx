"use client";
import React, { useEffect, useState } from "react";

interface Product {
  _id: string;
  Product_ID: string;
  Name: string;
  Description?: string;
  Unit_Amount: number;
  Total_Units_Available: number;
  Tenor_Days: number;
  Is_Flexible?: boolean;
  Return_Rate_Percent: number;
  Return_Type: "fixed_at_maturity" | "daily_interest";
  Early_Withdrawal_Penalty_Percent?: number;
  Risk_Level?: "Low" | "Medium" | "High";
  Is_Active?: boolean;
}

type FormMode = "add" | "edit" | null;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inventoryEdit, setInventoryEdit] = useState<{ [key: string]: number }>({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unitAmount: 1000,
    totalUnits: 100,
    tenorDays: 90,
    isFlexible: false,
    returnRatePercent: 8,
    returnType: "fixed_at_maturity" as const,
    penaltyPercent: 5,
    riskLevel: "Low" as const,
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddClick = () => {
    setFormMode("add");
    setEditingProduct(null);
    setError("");
    setSuccess("");
    setFormData({
      name: "",
      description: "",
      unitAmount: 1000,
      totalUnits: 100,
      tenorDays: 90,
      isFlexible: false,
      returnRatePercent: 8,
      returnType: "fixed_at_maturity",
      penaltyPercent: 5,
      riskLevel: "Low",
    });
  };

  const handleEditClick = (product: Product) => {
    setFormMode("edit");
    setEditingProduct(product);
    setError("");
    setSuccess("");
    setFormData({
      name: product.Name,
      description: product.Description || "",
      unitAmount: product.Unit_Amount / 100,
      totalUnits: product.Total_Units_Available,
      tenorDays: product.Tenor_Days,
      isFlexible: product.Is_Flexible || false,
      returnRatePercent: product.Return_Rate_Percent,
      returnType: product.Return_Type,
      penaltyPercent: product.Early_Withdrawal_Penalty_Percent || 5,
      riskLevel: product.Risk_Level || "Low",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? parseFloat(value) || 0
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (formMode === "add") {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create product");
        setSuccess("Product created successfully");
      } else if (formMode === "edit" && editingProduct) {
        const res = await fetch("/api/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rowId: editingProduct._id,
            updates: {
              Name: formData.name,
              Description: formData.description,
              Unit_Amount: Math.round(formData.unitAmount * 100),
              Total_Units_Available: formData.totalUnits,
              Tenor_Days: formData.tenorDays,
              Is_Flexible: formData.isFlexible,
              Return_Rate_Percent: formData.returnRatePercent,
              Return_Type: formData.returnType,
              Early_Withdrawal_Penalty_Percent: formData.penaltyPercent,
              Risk_Level: formData.riskLevel,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update product");
        setSuccess("Product updated successfully");
      }
      setTimeout(() => {
        fetchProducts();
        setFormMode(null);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryUpdate = async (product: Product) => {
    const newUnits = inventoryEdit[product._id];
    if (newUnits === undefined || newUnits === product.Total_Units_Available)
      return;

    try {
      setLoading(true);
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowId: product._id,
          updates: { Total_Units_Available: newUnits },
        }),
      });
      if (!res.ok) throw new Error("Failed to update inventory");
      setSuccess("Inventory updated");
      setInventoryEdit((prev) => {
        const copy = { ...prev };
        delete copy[product._id];
        return copy;
      });
      await fetchProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setFormMode(null);
    setEditingProduct(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">
            Investment Products
          </h1>
          <button
            onClick={handleAddClick}
            disabled={formMode !== null}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition"
          >
            + Add Product
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-500 text-red-300 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-900/30 border border-green-500 text-green-300 rounded-lg">
            {success}
          </div>
        )}

        {/* Form Modal */}
        {formMode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  {formMode === "add" ? "Add New Product" : "Edit Product"}
                </h2>
                <button
                  onClick={handleCloseForm}
                  disabled={loading}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Tenor (Days) *
                    </label>
                    <input
                      type="number"
                      name="tenorDays"
                      value={formData.tenorDays}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                    rows={2}
                  />
                </div>

                {/* Pricing & Units */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Unit Price (₦) *
                    </label>
                    <input
                      type="number"
                      name="unitAmount"
                      value={formData.unitAmount}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Total Units Available *
                    </label>
                    <input
                      type="number"
                      name="totalUnits"
                      value={formData.totalUnits}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Returns */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Return Rate (%) *
                    </label>
                    <input
                      type="number"
                      name="returnRatePercent"
                      value={formData.returnRatePercent}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.1"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Return Type *
                    </label>
                    <select
                      name="returnType"
                      value={formData.returnType}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                    >
                      <option value="fixed_at_maturity">Fixed at Maturity</option>
                      <option value="daily_interest">Daily Interest</option>
                    </select>
                  </div>
                </div>

                {/* Options */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Risk Level
                    </label>
                    <select
                      name="riskLevel"
                      value={formData.riskLevel}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Early Withdrawal Penalty (%)
                    </label>
                    <input
                      type="number"
                      name="penaltyPercent"
                      value={formData.penaltyPercent}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFlexible"
                    name="isFlexible"
                    checked={formData.isFlexible}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isFlexible" className="text-white font-semibold">
                    Flexible Withdrawal
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded font-semibold transition"
                  >
                    {loading ? "Saving..." : "Save Product"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    disabled={loading}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-700 border-b border-slate-600">
                <tr>
                  <th className="px-6 py-3 font-semibold text-white">Product</th>
                  <th className="px-6 py-3 font-semibold text-white">Tenor</th>
                  <th className="px-6 py-3 font-semibold text-white">Unit Price</th>
                  <th className="px-6 py-3 font-semibold text-white">Units</th>
                  <th className="px-6 py-3 font-semibold text-white">Return</th>
                  <th className="px-6 py-3 font-semibold text-white">Risk</th>
                  <th className="px-6 py-3 font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-slate-400 text-center">
                      No products yet. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-white">
                            {product.Name}
                          </p>
                          {product.Description && (
                            <p className="text-xs text-slate-400">
                              {product.Description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {product.Tenor_Days}d
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        ₦{(product.Unit_Amount / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={
                              inventoryEdit[product._id] ??
                              product.Total_Units_Available
                            }
                            onChange={(e) =>
                              setInventoryEdit((prev) => ({
                                ...prev,
                                [product._id]: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-center text-sm"
                          />
                          {inventoryEdit[product._id] !==
                            product.Total_Units_Available && (
                            <button
                              onClick={() => handleInventoryUpdate(product)}
                              disabled={loading}
                              className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition"
                            >
                              Update
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {product.Return_Rate_Percent}%{" "}
                        <span className="text-xs text-slate-400">
                          ({product.Return_Type === "fixed_at_maturity"
                            ? "Fixed"
                            : "Daily"})
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            product.Risk_Level === "Low"
                              ? "bg-green-900/30 text-green-300"
                              : product.Risk_Level === "Medium"
                                ? "bg-yellow-900/30 text-yellow-300"
                                : "bg-red-900/30 text-red-300"
                          }`}
                        >
                          {product.Risk_Level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEditClick(product)}
                          disabled={formMode !== null || loading}
                          className="text-blue-400 hover:text-blue-300 disabled:text-slate-500 transition text-sm font-semibold"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";
import React, { useEffect, useState } from "react";

interface Product {
  _id: string;
  Product_ID: string;
  Name: string;
  Description?: string;
  Unit_Amount: number;
  Total_Units_Available: number;
  Tenor_Days: number;
  Is_Flexible?: boolean;
  Return_Rate_Percent: number;
  Return_Type: "fixed_at_maturity" | "daily_interest";
  Early_Withdrawal_Penalty_Percent?: number;
  Risk_Level?: "Low" | "Medium" | "High";
  Is_Active?: boolean;
}

type FormMode = "add" | "edit" | null;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inventoryEdit, setInventoryEdit] = useState<{ [key: string]: number }>({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unitAmount: 1000,
    totalUnits: 100,
    tenorDays: 90,
    isFlexible: false,
    returnRatePercent: 8,
    returnType: "fixed_at_maturity" as const,
    penaltyPercent: 5,
    riskLevel: "Low" as const,
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddClick = () => {
    setFormMode("add");
    setEditingProduct(null);
    setError("");
    setSuccess("");
    setFormData({
      name: "",
      description: "",
      unitAmount: 1000,
      totalUnits: 100,
      tenorDays: 90,
      isFlexible: false,
      returnRatePercent: 8,
      returnType: "fixed_at_maturity",
      penaltyPercent: 5,
      riskLevel: "Low",
    });
  };

  const handleEditClick = (product: Product) => {
    setFormMode("edit");
    setEditingProduct(product);
    setError("");
    setSuccess("");
    setFormData({
      name: product.Name,
      description: product.Description || "",
      unitAmount: product.Unit_Amount / 100,
      totalUnits: product.Total_Units_Available,
      tenorDays: product.Tenor_Days,
      isFlexible: product.Is_Flexible || false,
      returnRatePercent: product.Return_Rate_Percent,
      returnType: product.Return_Type,
      penaltyPercent: product.Early_Withdrawal_Penalty_Percent || 5,
      riskLevel: product.Risk_Level || "Low",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? parseFloat(value) || 0
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (formMode === "add") {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create product");
        setSuccess("Product created successfully");
      } else if (formMode === "edit" && editingProduct) {
        const res = await fetch("/api/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rowId: editingProduct._id,
            updates: {
              Name: formData.name,
              Description: formData.description,
              Unit_Amount: Math.round(formData.unitAmount * 100),
              Total_Units_Available: formData.totalUnits,
              Tenor_Days: formData.tenorDays,
              Is_Flexible: formData.isFlexible,
              Return_Rate_Percent: formData.returnRatePercent,
              Return_Type: formData.returnType,
              Early_Withdrawal_Penalty_Percent: formData.penaltyPercent,
              Risk_Level: formData.riskLevel,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update product");
        setSuccess("Product updated successfully");
      }
      setTimeout(() => {
        fetchProducts();
        setFormMode(null);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryUpdate = async (product: Product) => {
    const newUnits = inventoryEdit[product._id];
    if (newUnits === undefined || newUnits === product.Total_Units_Available)
      return;

    try {
      setLoading(true);
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowId: product._id,
          updates: { Total_Units_Available: newUnits },
        }),
      });
      if (!res.ok) throw new Error("Failed to update inventory");
      setSuccess("Inventory updated");
      setInventoryEdit((prev) => {
        const copy = { ...prev };
        delete copy[product._id];
        return copy;
      });
      await fetchProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setFormMode(null);
    setEditingProduct(null);
    setError("");
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">
        Set Available Investment Amount
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Select Product</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedId}
            onChange={(e) => handleSelect(e.target.value)}
            required
          >
            <option value="">-- Select --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.type})
              </option>
            ))}
          </select>
        </div>
        {selectedId && (
          <div>
            <label className="block font-semibold mb-1">
              Available for Purchase
            </label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={amount}
              min={products.find((p) => p.id === selectedId)?.sold || 0}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
            <div className="text-xs text-slate-500 mt-1">
              Already sold:{" "}
              {products.find((p) => p.id === selectedId)?.sold || 0}
            </div>
          </div>
        )}
        {error && <div className="text-red-600 font-semibold">{error}</div>}
        {success && (
          <div className="text-green-600 font-semibold">{success}</div>
        )}
        <button
          type="submit"
          className="bg-[#2c3e5f] text-white px-6 py-2 rounded font-semibold mt-2 disabled:opacity-50"
          disabled={!selectedId || loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
