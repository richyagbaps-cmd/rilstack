"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";

interface UserProfileData {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  nin: string;
}

interface UserProfileProps {
  onClose: () => void;
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>({
    id: "1",
    userId: "USR-2024-001234",
    name: session?.user?.name || "RILSTACK User",
    email: session?.user?.email || "user@rilstack.com",
    phone: "+234-801-234-5678",
    age: 32,
    nin: "12345678901",
  });
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset } =
    useForm<Omit<UserProfileData, "id">>();

  useEffect(() => {
    setUserProfile((current) => ({
      id: current?.id || "1",
      userId: current?.userId || "USR-2024-001234",
      name: session?.user?.name || current?.name || "RILSTACK User",
      email: session?.user?.email || current?.email || "user@rilstack.com",
      phone: current?.phone || "+234-801-234-5678",
      age: current?.age || 32,
      nin: current?.nin || "12345678901",
    }));
  }, [session]);

  const onSubmit = (data: Omit<UserProfileData, "id">) => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        ...data,
      });
    }
    setIsEditing(false);
    reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-h-screen w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between bg-[#2c3e5f] p-6 text-white">
          <h2 className="text-2xl font-bold">User Profile</h2>
          <button
            onClick={onClose}
            className="rounded px-2 py-0 text-2xl font-bold hover:bg-blue-700"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {!isEditing && userProfile ? (
            <div className="space-y-4">
              <div className="rounded-[28px] bg-[#2c3e5f] p-6 text-white">
                <p className="mb-1 text-sm opacity-90">USER ID</p>
                <p className="text-3xl font-bold">{userProfile.userId}</p>
                <p className="mt-2 text-xs opacity-75">
                  Unique identifier for your account
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-sm text-gray-600">FULL NAME</p>
                  <p className="text-lg font-semibold">{userProfile.name}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-sm text-gray-600">AGE</p>
                  <p className="text-lg font-semibold">
                    {userProfile.age} years
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-sm text-gray-600">EMAIL ADDRESS</p>
                  <p className="break-all text-lg font-semibold">
                    {userProfile.email}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-sm text-gray-600">PHONE NUMBER</p>
                  <p className="text-lg font-semibold">{userProfile.phone}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
                  <p className="mb-1 text-sm text-gray-600">
                    NIN (National Identification Number)
                  </p>
                  <p className="text-lg font-semibold tracking-widest">
                    {userProfile.nin}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsEditing(true);
                  reset(userProfile);
                }}
                className="w-full rounded-[40px] bg-[#2c3e5f] py-3 font-semibold text-white transition-all hover:bg-[#1e2d46]"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  {...register("name", { required: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Age
                  </label>
                  <input
                    type="number"
                    placeholder="Enter your age"
                    {...register("age", {
                      required: true,
                      valueAsNumber: true,
                    })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g., +234-801-234-5678"
                    {...register("phone", { required: true })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  {...register("email", { required: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  NIN (National Identification Number)
                </label>
                <input
                  type="text"
                  placeholder="Enter your 11-digit NIN"
                  maxLength={11}
                  {...register("nin", { required: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 tracking-widest focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  11-digit number from your national ID
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-[40px] bg-[#2c3e5f] py-3 font-semibold text-white transition-all hover:bg-[#1e2d46]"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                  className="flex-1 rounded-lg bg-gray-300 py-3 font-semibold text-gray-800 transition-all hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
