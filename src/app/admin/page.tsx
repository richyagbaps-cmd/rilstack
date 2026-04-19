"use client";

import { useState } from "react";

interface UserData {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  kycLevel?: number;
  balance?: number;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  [key: string]: unknown;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [storage, setStorage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      setUsers(data.users || []);
      setCount(data.count || 0);
      setNote(data.note || "");
      setStorage(data.storage || "");
      setLoggedIn(true);
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUsers([]);
    setCount(0);
    setPassword("");
    setNote("");
    setStorage("");
  };

  const getUserName = (user: UserData) => {
    if (user.name) return user.name;
    if (user.firstName || user.lastName)
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return "";
  };

  const exportToCSV = () => {
    if (users.length === 0) return;

    const headers = [
      "#",
      "Name",
      "Email",
      "Phone",
      "KYC Level",
      "KYC Status",
      "Balance",
      "Date Joined",
      "Last Updated",
    ];
    const rows = users.map((user, idx) => [
      idx + 1,
      `"${getUserName(user).replace(/"/g, '""')}"`,
      `"${(user.email || "").replace(/"/g, '""')}"`,
      `"${(user.phone || "").replace(/"/g, '""')}"`,
      user.kycLevel ?? 0,
      `"${getKycLabel(user.kycLevel)}"`,
      user.balance ?? 0,
      `"${user.createdAt || ""}"`,
      `"${user.updatedAt || ""}"`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rilstack-users-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "₦0.00";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getKycLabel = (level?: number) => {
    const labels: Record<number, string> = {
      0: "None",
      1: "Email",
      2: "BVN",
      3: "NIN",
      4: "Identity",
      5: "Complete",
    };
    return labels[level ?? 0] || `Level ${level}`;
  };

  const getKycColor = (level?: number) => {
    if (!level || level === 0) return "bg-gray-100 text-gray-600";
    if (level <= 2) return "bg-yellow-100 text-yellow-700";
    if (level <= 4) return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
  };

  // Login screen
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[#F1F4F9] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#2c3e5f] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
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
              <h1 className="text-2xl font-bold text-[#1E2A3A]">Admin Panel</h1>
              <p className="text-[#4A5B6E] text-sm mt-1">
                Enter password to continue
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2c3e5f] focus:border-transparent outline-none text-[#1E2A3A] placeholder-gray-400"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#2c3e5f] text-white font-semibold rounded-xl hover:bg-[#1e2d46] transition-colors disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-[#F1F4F9]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2c3e5f] rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1E2A3A]">
                Rilstack Admin
              </h1>
              <p className="text-xs text-[#4A5B6E]">
                User Management Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-sm text-[#4A5B6E]">Total Users</p>
            <p className="text-3xl font-bold text-[#1E2A3A] mt-1">{count}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-sm text-[#4A5B6E]">KYC Verified (Level 3+)</p>
            <p className="text-3xl font-bold text-[#2c3e5f] mt-1">
              {users.filter((u) => (u.kycLevel ?? 0) >= 3).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-sm text-[#4A5B6E]">Total Balance Held</p>
            <p className="text-3xl font-bold text-[#1E2A3A] mt-1">
              {formatCurrency(
                users.reduce((sum, u) => sum + (u.balance ?? 0), 0),
              )}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-sm text-[#4A5B6E]">Storage</p>
            <p className="text-lg font-bold mt-1">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${storage === "redis" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
              >
                {storage === "redis" ? "● Permanent (Redis)" : "● Local (File)"}
              </span>
            </p>
          </div>
        </div>

        {/* Export Button */}
        {users.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2c3e5f] text-white text-sm font-medium rounded-lg hover:bg-[#1e2d46] transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export to Excel (.csv)
            </button>
          </div>
        )}

        {note && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
            {note}
          </div>
        )}

        {/* Table */}
        {users.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-[#4A5B6E] font-medium">
              No registered users yet
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Users will appear here once they sign up
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8F9FC] border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-semibold text-[#4A5B6E] whitespace-nowrap">
                      #
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4A5B6E] whitespace-nowrap">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4A5B6E] whitespace-nowrap">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4A5B6E] whitespace-nowrap">
                      Phone
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4A5B6E] whitespace-nowrap">
                      KYC
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-[#4A5B6E] whitespace-nowrap">
                      Balance
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4A5B6E] whitespace-nowrap">
                      Joined
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-[#4A5B6E] whitespace-nowrap">
                      Last Login
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr
                      key={user.id || user.email || idx}
                      className="border-b border-gray-50 hover:bg-[#F8F9FC] transition-colors"
                    >
                      <td className="px-4 py-3 text-[#4A5B6E]">{idx + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-[#1E2A3A]">
                          {getUserName(user) || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#4A5B6E] whitespace-nowrap">
                        {user.email || "—"}
                      </td>
                      <td className="px-4 py-3 text-[#4A5B6E] whitespace-nowrap">
                        {user.phone || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getKycColor(user.kycLevel)}`}
                        >
                          {getKycLabel(user.kycLevel)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#1E2A3A] whitespace-nowrap">
                        {formatCurrency(user.balance)}
                      </td>
                      <td className="px-4 py-3 text-[#4A5B6E] whitespace-nowrap text-xs">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-[#4A5B6E] whitespace-nowrap text-xs">
                        {formatDate(user.lastLogin)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-[#F8F9FC] border-t border-gray-100 text-xs text-[#4A5B6E]">
              Showing {users.length} user{users.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
