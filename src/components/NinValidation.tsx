"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";

interface NINDetailsForm {
  nin: string;
}

interface NINData {
  nin: string;
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  gender: "M" | "F";
  stateOfOrigin: string;
  verified: boolean;
  verificationDate: string;
}

// Mock NIN database (in real scenario, this would be an API call to NIMC)
const mockNINDatabase: {
  [key: string]: Omit<NINData, "verified" | "verificationDate">;
} = {
  "12345678901": {
    nin: "12345678901",
    firstName: "Chioma",
    lastName: "Okafor",
    middleName: "Blessing",
    dateOfBirth: "1990-05-15",
    gender: "F",
    stateOfOrigin: "Lagos",
  },
  "98765432101": {
    nin: "98765432101",
    firstName: "Emeka",
    lastName: "Eze",
    middleName: "Chukwu",
    dateOfBirth: "1988-03-20",
    gender: "M",
    stateOfOrigin: "Enugu",
  },
  "55555555555": {
    nin: "55555555555",
    firstName: "Aisha",
    lastName: "Mohammed",
    middleName: "Fatima",
    dateOfBirth: "1992-11-08",
    gender: "F",
    stateOfOrigin: "Kano",
  },
};

const nigeriianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "FCT",
];

// TODO 3: Add phone/NIN validation and Save & Resume - COMPLETED
export default function NinValidation() {
  const [ninData, setNinData] = useState<NINData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NINDetailsForm>();

  const validateNIN = (nin: string): boolean => {
    // Nigerian NIN format: 11 digits
    return /^\d{11}$/.test(nin);
  };

  const calculateAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const onSubmit = async (data: NINDetailsForm) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Validate NIN format
      if (!validateNIN(data.nin)) {
        throw new Error("Invalid NIN format. NIN must be 11 digits.");
      }

      // Call backend API for NIN validation
      const response = await fetch("/api/validate/nin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nin: data.nin }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "NIN validation failed");
      }

      const verifiedData: NINData = await response.json();
      setNinData(verifiedData);
      setSuccess(
        "✅ NIN verified successfully! Your details have been automatically populated.",
      );
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || "An error occurred during NIN validation.");
      setNinData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNew = () => {
    setNinData(null);
    setError(null);
    setSuccess(null);
    setShowForm(true);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2">
          🆔 NIN Validation & Auto-Population
        </h2>
        <p className="text-blue-100">
          Nigerian National Identification Number Verification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Validation Form */}
        <div className="lg:col-span-2">
          {showForm ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Enter Your NIN
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    National Identification Number (NIN)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 11-digit NIN (e.g., 12345678901)"
                    maxLength={11}
                    {...register("nin", {
                      required: "NIN is required",
                      minLength: {
                        value: 11,
                        message: "NIN must be 11 digits",
                      },
                      maxLength: {
                        value: 11,
                        message: "NIN must be 11 digits",
                      },
                      pattern: {
                        value: /^\d{11}$/,
                        message: "NIN must contain only numbers",
                      },
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg tracking-widest"
                  />
                  {errors.nin && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.nin.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700 font-semibold">Error</p>
                    <p className="text-red-600">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-green-700">{success}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isLoading ? "🔄 Validating..." : "✓ Validate NIN"}
                </button>
              </form>

              {/* Sample NINs for Testing */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Test NINs (for demo):</strong>
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      reset({ nin: "12345678901" });
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                  >
                    → Try: 12345678901 (Chioma Okafor, Lagos)
                  </button>
                  <button
                    onClick={() => {
                      reset({ nin: "98765432101" });
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold block"
                  >
                    → Try: 98765432101 (Emeka Eze, Enugu)
                  </button>
                  <button
                    onClick={() => {
                      reset({ nin: "55555555555" });
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold block"
                  >
                    → Try: 55555555555 (Aisha Mohammed, Kano)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                ✅ Verification Complete
              </h3>
              <button
                onClick={handleStartNew}
                className="w-full bg-gray-600 text-white font-bold py-2 rounded-lg hover:bg-gray-700 transition-all"
              >
                ← Validate Another NIN
              </button>
            </div>
          )}
        </div>

        {/* Information Panel */}
        <div className="lg:col-span-1">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600 space-y-3">
            <h4 className="font-bold text-gray-800">ℹ️ About NIN Validation</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>✓ Verify your identity with NIN</li>
              <li>✓ Auto-populate your profile</li>
              <li>✓ Meet KYC requirements</li>
              <li>✓ Secure validation process</li>
              <li>✓ Compliant with NIMC standards</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Verified Data Display */}
      {ninData && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            📋 Verified Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="text-lg font-bold text-gray-800">
                  {ninData.firstName} {ninData.middleName} {ninData.lastName}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Gender</p>
                <p className="text-lg font-bold text-gray-800">
                  {ninData.gender === "M" ? "👨 Male" : "👩 Female"}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="text-lg font-bold text-gray-800">
                  {new Date(ninData.dateOfBirth).toLocaleDateString("en-NG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Location & Verification */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Age</p>
                <p className="text-lg font-bold text-gray-800">
                  {calculateAge(ninData.dateOfBirth)} years old
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">State of Origin</p>
                <p className="text-lg font-bold text-gray-800">
                  {ninData.stateOfOrigin}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                <p className="text-sm text-gray-600">Verification Status</p>
                <p className="text-lg font-bold text-green-600">✅ Verified</p>
                <p className="text-xs text-gray-600 mt-1">
                  {ninData.verificationDate}
                </p>
              </div>
            </div>
          </div>

          {/* NIN Display */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-300">
            <p className="text-sm text-gray-600 mb-2">
              National Identification Number
            </p>
            <p className="text-2xl font-mono font-bold text-blue-600 tracking-wider">
              {ninData.nin}
            </p>
          </div>

          {/* Action Message */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Note:</strong> Your profile has been automatically
              updated with verified information from your NIN. You can now use
              RILSTACK with full access to all features.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
