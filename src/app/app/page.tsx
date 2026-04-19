"use client";
import { useRouter } from "next/navigation";

const choices = [
  {
    key: "budget",
    title: "Budget",
    desc: "Set up your smart budget and track spending.",
    icon: "fa-chart-pie",
    color: "#ffb347",
  },
  {
    key: "savings",
    title: "Savings",
    desc: "Create savings goals and earn daily interest.",
    icon: "fa-piggy-bank",
    color: "#4cd964",
  },
  {
    key: "investments",
    title: "Investments",
    desc: "Build your portfolio and grow your wealth.",
    icon: "fa-chart-line",
    color: "#3e8eff",
  },
];

export default function MainChoice() {
  const router = useRouter();

  const handleChoice = (key: string) => {
    // Optionally save first choice to user profile
    router.push(`/${key}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600 p-4">
      <h2 className="text-3xl font-bold mb-8 text-white">
        What would you like to start with?
      </h2>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl justify-center">
        {choices.map((c) => (
          <button
            key={c.key}
            className="flex-1 bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 transition border-4"
            style={{ borderColor: c.color, minWidth: 260 }}
            onClick={() => handleChoice(c.key)}
          >
            <i
              className={`fas ${c.icon} mb-4`}
              style={{ color: c.color, fontSize: 48 }}
            ></i>
            <div className="text-2xl font-bold mb-2" style={{ color: c.color }}>
              {c.title}
            </div>
            <div className="text-gray-700 text-center">{c.desc}</div>
          </button>
        ))}
      </div>
      <div className="mt-10 text-white opacity-70 text-sm">
        All features become accessible after your first choice.
      </div>
    </div>
  );
}
