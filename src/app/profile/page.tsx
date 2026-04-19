"use client";
import { useState } from "react";

const initialProfile = {
  fullName: "Jane Doe",
  dob: "1990-01-01",
  phone: "08012345678",
  email: "jane@email.com",
  bvn: "12345678901",
  nin: "12345678901",
  address: "Lagos, Nigeria",
  state: "Lagos",
  lga: "Ikeja",
  idType: "National ID",
  idNumber: "A1234567",
  occupation: "Engineer",
  income: "500000",
};

const notifTypes = ["Celebratory", "Alerts", "Nudges", "Milestones"];

export default function ProfileScreen() {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [pinEdit, setPinEdit] = useState(false);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [biometric, setBiometric] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [notifs, setNotifs] = useState<string[]>(notifTypes);
  const [showTerms, setShowTerms] = useState(false);
  const [pinVerify, setPinVerify] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = () => {
    setEditing(false);
    setSuccess("Profile updated!");
    setTimeout(() => setSuccess(""), 1200);
  };

  const handlePinChange = () => {
    setError("");
    if (!/^\d{4,6}$/.test(newPin) || newPin !== confirmPin) {
      setError("PINs must match and be 4-6 digits");
      return;
    }
    setPinEdit(false);
    setSuccess("PIN changed!");
    setTimeout(() => setSuccess(""), 1200);
    setOldPin("");
    setNewPin("");
    setConfirmPin("");
  };

  const handleSensitiveEdit = () => {
    if (!/^\d{4,6}$/.test(pin)) {
      setError("PIN required to edit sensitive fields");
      return;
    }
    setPinVerify(false);
    setEditing(true);
    setPin("");
    setError("");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Profile</h2>
      <div className="flex flex-col gap-4">
        {Object.entries(profile).map(([k, v]) => (
          <div key={k} className="flex gap-2 items-center">
            <label className="w-32 font-medium capitalize">
              {k.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              className={`flex-1 border p-2 rounded ${editing ? "" : "bg-gray-100"}`}
              value={v}
              onChange={(e) => setProfile({ ...profile, [k]: e.target.value })}
              disabled={!editing || (["bvn", "nin"].includes(k) && !pinVerify)}
            />
            {["bvn", "nin"].includes(k) && !pinVerify && editing && (
              <button
                className="text-blue-600 underline text-xs"
                onClick={() => setPinVerify(true)}
              >
                Re-verify PIN
              </button>
            )}
          </div>
        ))}
        {editing ? (
          <div className="flex gap-2 mt-2">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        )}
        {pinVerify && (
          <div className="flex gap-2 items-center mt-2">
            <input
              type="password"
              className="border p-2 rounded"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded"
              onClick={handleSensitiveEdit}
            >
              Verify
            </button>
          </div>
        )}
        <div className="border-t my-4" />
        <div className="flex items-center gap-2">
          <span className="font-medium">PIN Change</span>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => setPinEdit(true)}
          >
            Change
          </button>
        </div>
        {pinEdit && (
          <div className="flex flex-col gap-2 mt-2">
            <input
              type="password"
              className="border p-2 rounded"
              placeholder="Old PIN"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
            />
            <input
              type="password"
              className="border p-2 rounded"
              placeholder="New PIN"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
            />
            <input
              type="password"
              className="border p-2 rounded"
              placeholder="Confirm New PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
            />
            <button
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={handlePinChange}
            >
              Save PIN
            </button>
            <button
              className="bg-gray-300 px-3 py-1 rounded"
              onClick={() => setPinEdit(false)}
            >
              Cancel
            </button>
            {error && <div className="text-red-500">{error}</div>}
          </div>
        )}
        <div className="flex items-center gap-2 mt-4">
          <span className="font-medium">Biometric Login</span>
          <input
            type="checkbox"
            checked={biometric}
            onChange={(e) => setBiometric(e.target.checked)}
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-medium">Privacy Mode</span>
          <input
            type="checkbox"
            checked={privacy}
            onChange={(e) => setPrivacy(e.target.checked)}
          />
        </div>
        <div className="mt-4">
          <span className="font-medium">Notification Preferences</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {notifTypes.map((n) => (
              <label key={n} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={notifs.includes(n)}
                  onChange={(e) =>
                    setNotifs(
                      e.target.checked
                        ? [...notifs, n]
                        : notifs.filter((x) => x !== n),
                    )
                  }
                />
                {n}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <button
            className="text-blue-600 underline"
            onClick={() => setShowTerms(true)}
          >
            View Terms & Conditions
          </button>
        </div>
        {showTerms && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full relative">
              <h3 className="font-bold mb-2">Terms & Conditions</h3>
              <div className="mb-4 text-sm max-h-64 overflow-auto">
                By using this app, you agree to the platform's terms and
                conditions...
              </div>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                onClick={() => setShowTerms(false)}
              >
                ×
              </button>
            </div>
          </div>
        )}
        <div className="mt-8">
          <button className="bg-red-600 text-white px-4 py-2 rounded w-full">
            Logout
          </button>
        </div>
        {success && (
          <div className="text-green-600 font-bold text-center mt-2">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}
