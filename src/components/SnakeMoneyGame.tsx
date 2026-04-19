"use client";
import React, { useEffect, useRef, useState } from "react";

export default function SnakeMoneyGame() {
  // Types and constants
  interface Point {
    x: number;
    y: number;
  }
  type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
  const GRID_SIZE = 16;
  const INITIAL_SNAKE: Point[] = [{ x: 8, y: 8 }];
  const INITIAL_MONEY: Point = { x: 4, y: 4 };
  const INITIAL_DIRECTION: Direction = "RIGHT";
  const INITIAL_SPEED = 220; // Start slower
  const MIN_SPEED = 60; // Fastest possible
  const SPEED_STEP = 14; // How much faster after each bite
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  // State
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [money, setMoney] = useState<Point>(INITIAL_MONEY);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [moneySize, setMoneySize] = useState(1);
  const moveRef = useRef<NodeJS.Timeout | null>(null);
  const dirRef = useRef(direction);
  dirRef.current = direction;

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && dirRef.current !== "DOWN") setDirection("UP");
      else if (e.key === "ArrowDown" && dirRef.current !== "UP")
        setDirection("DOWN");
      else if (e.key === "ArrowLeft" && dirRef.current !== "RIGHT")
        setDirection("LEFT");
      else if (e.key === "ArrowRight" && dirRef.current !== "LEFT")
        setDirection("RIGHT");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Main game loop
  useEffect(() => {
    if (gameOver) return;
    moveRef.current = setTimeout(() => {
      setSnake((prev) => {
        const head = { ...prev[0] };
        if (dirRef.current === "UP") head.y -= 1;
        else if (dirRef.current === "DOWN") head.y += 1;
        else if (dirRef.current === "LEFT") head.x -= 1;
        else if (dirRef.current === "RIGHT") head.x += 1;

        // Wall or self collision
        if (
          head.x < 0 ||
          head.x >= GRID_SIZE ||
          head.y < 0 ||
          head.y >= GRID_SIZE ||
          prev.some((s) => s.x === head.x && s.y === head.y)
        ) {
          setGameOver(true);
          return prev;
        }

        let newSnake = [head, ...prev];
        // Eat money
        if (head.x === money.x && head.y === money.y) {
          setScore((s) => s + 1);
          setMoneySize((ms) => ms + 1);
          setMoney(getRandomPoint([...newSnake]));
          setSpeed((sp) => Math.max(MIN_SPEED, sp - SPEED_STEP)); // Increase speed
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, speed);
    return () => {
      if (moveRef.current) clearTimeout(moveRef.current);
    };
  }, [snake, money, gameOver, speed]);

  // Touch controls for mobile
  useEffect(() => {
    let startX = 0,
      startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20 && dirRef.current !== "LEFT") setDirection("RIGHT");
        else if (dx < -20 && dirRef.current !== "RIGHT") setDirection("LEFT");
      } else {
        if (dy > 20 && dirRef.current !== "UP") setDirection("DOWN");
        else if (dy < -20 && dirRef.current !== "DOWN") setDirection("UP");
      }
    };
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  function getRandomPoint(exclude: Point[]): Point {
    let point: Point;
    do {
      point = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (exclude.some((p) => p.x === point.x && p.y === point.y));
    return point;
  }

  const handleRestart = () => {
    setSnake(INITIAL_SNAKE);
    setMoney(INITIAL_MONEY);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setMoneySize(1);
    setSpeed(INITIAL_SPEED);
  };

  // Render grid
  return (
    <div className="w-full flex flex-col items-center justify-center py-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-bold text-lg">Ril-Snack</span>
        <span className="text-xs bg-green-100 text-green-700 rounded px-2 py-0.5">
          Offline Ready
        </span>
      </div>
      <div
        className="relative"
        style={{
          width: 320,
          height: 320,
          background: "#222",
          borderRadius: 12,
          boxShadow: "0 2px 8px #0002",
          touchAction: "none",
        }}
      >
        {/* Snake */}
        {snake.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(s.x / GRID_SIZE) * 100}%`,
              top: `${(s.y / GRID_SIZE) * 100}%`,
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              background: i === 0 ? "#2c3e5f" : "#4A8B6E",
              borderRadius: 4,
              zIndex: 2,
            }}
          />
        ))}
        {/* Money (gets bigger) */}
        <div
          style={{
            position: "absolute",
            left: `${(money.x / GRID_SIZE) * 100}%`,
            top: `${(money.y / GRID_SIZE) * 100}%`,
            width: `${(moneySize * 100) / GRID_SIZE}%`,
            height: `${(moneySize * 100) / GRID_SIZE}%`,
            background: "gold",
            borderRadius: "50%",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 8px 2px #ffd70099",
          }}
        >
          <span
            role="img"
            aria-label="money"
            style={{ fontSize: 18 + moneySize * 2 }}
          >
            💰
          </span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-4">
        <span className="text-sm">
          Score: <b>{score}</b>
        </span>
        {gameOver && (
          <button
            className="ml-2 px-3 py-1 rounded bg-[#2c3e5f] text-white text-xs"
            onClick={handleRestart}
          >
            Restart
          </button>
        )}
      </div>
      {/* On-screen arrow controls for mobile */}
      <div className="mt-4 flex flex-col items-center gap-2 select-none md:hidden">
        <div className="flex justify-center gap-8">
          <button
            aria-label="Up"
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 active:bg-blue-300 dark:active:bg-blue-600 shadow"
            onClick={() => direction !== "DOWN" && setDirection("UP")}
            tabIndex={0}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 4l-7 8h14l-7-8z" fill="currentColor" />
            </svg>
          </button>
        </div>
        <div className="flex gap-8">
          <button
            aria-label="Left"
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 active:bg-blue-300 dark:active:bg-blue-600 shadow"
            onClick={() => direction !== "RIGHT" && setDirection("LEFT")}
            tabIndex={0}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M4 12l8-7v14l-8-7z" fill="currentColor" />
            </svg>
          </button>
          <button
            aria-label="Down"
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 active:bg-blue-300 dark:active:bg-blue-600 shadow"
            onClick={() => direction !== "UP" && setDirection("DOWN")}
            tabIndex={0}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 20l7-8H5l7 8z" fill="currentColor" />
            </svg>
          </button>
          <button
            aria-label="Right"
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 active:bg-blue-300 dark:active:bg-blue-600 shadow"
            onClick={() => direction !== "LEFT" && setDirection("RIGHT")}
            tabIndex={0}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M20 12l-8 7V5l8 7z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-500">
        Use arrow keys, swipe, or tap arrows to play
      </div>
    </div>
  );
}
