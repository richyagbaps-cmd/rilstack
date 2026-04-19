"use client";
import { useState } from "react";

const demoLeaders = [
  { name: "You", percent: 22 },
  { name: "User 2", percent: 28 },
  { name: "User 3", percent: 19 },
  { name: "User 4", percent: 15 },
];

export default function Leaderboard({
  optIn,
  setOptIn,
}: {
  optIn: boolean;
  setOptIn: (v: boolean) => void;
}) {
  return (
    <div className="bg-purple-50 rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold">Savings Circle Leaderboard</span>
        <label className="flex items-center gap-1 ml-auto">
          <input
            type="checkbox"
            checked={optIn}
            onChange={(e) => setOptIn(e.target.checked)}
          />
          <span className="text-xs">Opt-in</span>
        </label>
      </div>
      {optIn ? (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-gray-500">
              <th>Name</th>
              <th>Percent Saved</th>
            </tr>
          </thead>
          <tbody>
            {demoLeaders.map((l) => (
              <tr
                key={l.name}
                className={l.name === "You" ? "font-bold text-blue-700" : ""}
              >
                <td>{l.name === "You" ? "You" : "Anon"}</td>
                <td>{l.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-gray-500 text-xs">
          Opt in to see your ranking in your Savings Circle.
        </div>
      )}
    </div>
  );
}
