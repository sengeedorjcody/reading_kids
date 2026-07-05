"use client";

import { useState, useRef, useCallback } from "react";

const GESTURES = ["✋", "✊", "✌️", "👍", "☝️"];

type GameState = "START" | "MEMORIZE" | "HIDDEN" | "REVEALED";

function randomGesture() {
  return GESTURES[Math.floor(Math.random() * GESTURES.length)];
}

export default function MemoryHandsGame() {
  const [state, setState] = useState<GameState>("START");
  const [left, setLeft] = useState("👋");
  const [right, setRight] = useState("👋");
  const [countdown, setCountdown] = useState(3);
  const [level, setLevel] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hideAndAsk = useCallback(() => {
    setState("HIDDEN");
  }, []);

  const startNextRound = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState("MEMORIZE");
    setLeft(randomGesture());
    setRight(randomGesture());
    setCountdown(3);

    let n = 3;
    timerRef.current = setInterval(() => {
      n -= 1;
      if (n > 0) {
        setCountdown(n);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        hideAndAsk();
      }
    }, 1000);
  }, [hideAndAsk]);

  const revealGestures = () => {
    setState("REVEALED");
  };

  const handleButtonClick = () => {
    if (state === "START") {
      setLevel(1);
      startNextRound();
    } else if (state === "REVEALED") {
      setLevel((l) => l + 1);
      startNextRound();
    } else if (state === "HIDDEN") {
      revealGestures();
    }
  };

  const showButton = state !== "MEMORIZE";
  const btnLabel =
    state === "START" ? "START GAME 🎮" :
    state === "HIDDEN" ? "REVEAL 👀" :
    "NEXT LEVEL ➡️";

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden select-none"
      style={{ touchAction: "manipulation" }}
    >
      {/* Level badge */}
      {state !== "START" && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1 rounded-full font-black text-sm text-white"
          style={{ background: "rgba(0,0,0,0.3)" }}>
          Level {level}
        </div>
      )}

      {/* Split screen */}
      <div className="flex-1 flex">
        {/* Left hand */}
        <div
          className="flex-1 flex flex-col items-center justify-center gap-3 relative transition-colors"
          style={{ background: "#a2d2ff", borderRight: "4px solid #fff" }}
        >
          <span className="font-black text-2xl tracking-wide uppercase" style={{ color: "#2c3e50" }}>
            Left Hand
          </span>
          <span style={{ fontSize: 110, minHeight: 150, display: "flex", alignItems: "center" }}>
            {state === "HIDDEN" ? "❓" : left}
          </span>
          {state === "MEMORIZE" && (
            <div className="absolute top-5 px-5 py-1.5 rounded-full font-black text-2xl text-white"
              style={{ background: "rgba(0,0,0,0.2)" }}>
              {countdown}
            </div>
          )}
        </div>

        {/* Right hand */}
        <div
          className="flex-1 flex flex-col items-center justify-center gap-3 relative transition-colors"
          style={{ background: "#bdf0c0" }}
        >
          <span className="font-black text-2xl tracking-wide uppercase" style={{ color: "#2c3e50" }}>
            Right Hand
          </span>
          <span style={{ fontSize: 110, minHeight: 150, display: "flex", alignItems: "center" }}>
            {state === "HIDDEN" ? "❓" : right}
          </span>
          {state === "MEMORIZE" && (
            <div className="absolute top-5 px-5 py-1.5 rounded-full font-black text-2xl text-white"
              style={{ background: "rgba(0,0,0,0.2)" }}>
              {countdown}
            </div>
          )}
        </div>
      </div>

      {/* Bottom control bar */}
      <div
        className="flex-shrink-0 flex justify-center items-center z-10"
        style={{ height: 100, background: "#ffffff", boxShadow: "0 -4px 10px rgba(0,0,0,0.05)" }}
      >
        {showButton && (
          <button
            onClick={handleButtonClick}
            className="font-black text-white active:scale-95 transition-all"
            style={{
              padding: "16px 50px",
              fontSize: 22,
              borderRadius: 40,
              background: state === "HIDDEN" ? "#10ac84" : "#ff9f43",
              boxShadow: state === "HIDDEN"
                ? "0 6px 12px rgba(16,172,132,0.3)"
                : "0 6px 12px rgba(255,159,67,0.3)",
              border: "none",
            }}
          >
            {btnLabel}
          </button>
        )}
      </div>
    </div>
  );
}
