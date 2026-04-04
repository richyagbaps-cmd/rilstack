'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface UserProfile {
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>({
    id: '1',
    userId: 'USR-2024-001234',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+234-801-234-5678',
    age: 32,
    nin: '12345678901',
  });

  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset } = useForm<Omit<UserProfile, 'id'>>();

  const onSubmit = (data: Omit<UserProfile, 'id'>) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-blue-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">User Profile</h2>
          <button onClick={onClose} className="text-2xl font-bold hover:bg-blue-700 px-2 py-0 rounded">
            ×
          </button>
        </div>

        <div className="p-6">
          {!isEditing && userProfile ? (
            <div className="space-y-4">
              {/* User ID Card */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
                <p className="text-sm opacity-90 mb-1">USER ID</p>
                <p className="text-3xl font-bold">{userProfile.userId}</p>
                <p className="text-xs mt-2 opacity-75">Unique identifier for your account</p>
              </div>

              {/* Profile Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm mb-1">FULL NAME</p>
                  <p className="text-lg font-semibold">{userProfile.name}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm mb-1">AGE</p>
                  <p className="text-lg font-semibold">{userProfile.age} years</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm mb-1">EMAIL ADDRESS</p>
                  <p className="text-lg font-semibold break-all">{userProfile.email}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm mb-1">PHONE NUMBER</p>
                  <p className="text-lg font-semibold">{userProfile.phone}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <p className="text-gray-600 text-sm mb-1">NIN (National Identification Number)</p>
                  <p className="text-lg font-semibold tracking-widest">{userProfile.nin}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsEditing(true);
                  reset(userProfile);
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  {...register('name', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Age</label>
                  <input
                    type="number"
                    placeholder="Enter your age"
                    {...register('age', { required: true, valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g., +234-801-234-5678"
                    {...register('phone', { required: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  {...register('email', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">NIN (National Identification Number)</label>
                <input
                  type="text"
                  placeholder="Enter your 11-digit NIN"
                  maxLength={11}
                  {...register('nin', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-1">11-digit number from your national ID</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  onClick={() => {
                    handleSubmit(onSubmit);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-all"
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
