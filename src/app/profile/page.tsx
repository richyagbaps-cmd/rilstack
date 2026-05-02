import { redirect } from "next/navigation";

export default function ProfilePage() {
  redirect("/settings");
}
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
        {/* Notification preferences removed as requested */}
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
