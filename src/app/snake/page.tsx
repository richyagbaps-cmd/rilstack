"use client";
import SnakeMoneyGame from "../../components/SnakeMoneyGame";

export default function SnakePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] py-8 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Ril-Snack</h1>
      <div className="w-full max-w-xs md:max-w-md rounded-xl shadow-lg bg-[#232f3e] dark:bg-[#111] p-4 flex flex-col items-center">
        <SnakeMoneyGame />
      </div>
      <p className="mt-4 text-center text-gray-600 dark:text-gray-300 text-sm max-w-xs">
        Use arrow keys or on-screen controls to play. Eat the money, grow the
        snack, and beat your high score!
      </p>
    </main>
  );
}
