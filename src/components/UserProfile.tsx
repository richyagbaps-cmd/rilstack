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
      <div className="mx-4 max-h-screen w-full max-w-2xl overflow-y-auto rounded-[16px] bg-white shadow-2xl" style={{fontFamily: "'Inter', sans-serif", boxShadow: "0 6px 24px 0 rgba(26,95,122,0.13), 0 1.5px 0 #F4A261 inset"}}>
        <div className="sticky top-0 flex items-center justify-between bg-[#1A5F7A] p-6 text-white rounded-t-[16px]">
          <h2 className="text-2xl font-bold">User Profile</h2>
          <button
            onClick={onClose}
            className="rounded-[8px] px-2 py-0 text-2xl font-bold hover:bg-[#F4A261] hover:text-[#1A5F7A] transition"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {!isEditing && userProfile ? (
            <div className="space-y-4">
              <div className="rounded-[16px] bg-[#1A5F7A] p-6 text-white shadow" style={{boxShadow: "2px 2px 0 #F4A26155"}}>
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
                className="w-full rounded-[16px] bg-[#F4A261] py-3 font-semibold text-white transition-all hover:bg-[#1A5F7A] hover:text-[#F4A261]"
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
                  className="w-full rounded-[12px] border border-[#1A5F7A] px-4 py-2 focus:border-[#F4A261] focus:outline-none"
                />
              </div>


              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Age</label>
                  <input
                    type="number"
                    placeholder="e.g., 32"
                    {...register("age", { required: true, valueAsNumber: true })}
                    className="w-full rounded-[12px] border border-[#1A5F7A] px-4 py-2 focus:border-[#F4A261] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g., +234-801-234-5678"
                    {...register("phone", { required: true })}
                    className="w-full rounded-[12px] border border-[#1A5F7A] px-4 py-2 focus:border-[#F4A261] focus:outline-none"
                  />
                </div>
              </div>


              <div>
                <label className="mb-2 block text-sm font-semibold">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g., user@email.com"
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
                  className="w-full rounded-[12px] border border-[#1A5F7A] px-4 py-2 tracking-widest focus:border-[#F4A261] focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  11-digit number from your national ID
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-[16px] bg-[#F4A261] py-3 font-semibold text-white transition-all hover:bg-[#1A5F7A] hover:text-[#F4A261]"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                  className="flex-1 rounded-[16px] bg-[#F8F9FA] py-3 font-semibold text-[#1A5F7A] transition-all hover:bg-[#F4A261] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      {/* Settings Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">Change Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">PIN (4-6 digits)</label>
            <input
              type="password"
              placeholder="e.g., 1234"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Biometric Login</label>
            <input type="checkbox" className="mr-2" /> Enable
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Privacy Mode</label>
            <input type="checkbox" className="mr-2" /> Enable
          </div>
        </div>
      </div>
    </div>
  );
}
