"use client";

import { useState, useEffect } from "react";

const GESTURES = ["✋", "✊", "✌️", "👍", "☝️", "🤘", "👌", "🖐️"];
const SPEED_OPTIONS = [3, 5, 8, 10];

function randomGesture() {
  return GESTURES[Math.floor(Math.random() * GESTURES.length)];
}

export default function MemoryHandsGame() {
  const [left, setLeft] = useState(() => randomGesture());
  const [right, setRight] = useState(() => randomGesture());
  const [speed, setSpeed] = useState(3);

  useEffect(() => {
    const t = setInterval(() => {
      setLeft(randomGesture());
      setRight(randomGesture());
    }, speed * 1000);
    return () => clearInterval(t);
  }, [speed]);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden select-none">
      {/* Speed selector */}
      <div className="flex-shrink-0 flex items-center justify-center gap-1.5 py-2 z-10" style={{ background: "#1e293b" }}>
        {SPEED_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className="px-3 py-1 rounded-full text-xs font-black transition-all active:scale-95"
            style={
              speed === s
                ? { background: "#ff9f43", color: "#fff" }
                : { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }
            }
          >
            {s}s
          </button>
        ))}
      </div>

      <div className="flex-1 flex">
      {/* Left hand */}
      <div
        className="flex-1 flex flex-col items-center justify-center gap-3 relative"
        style={{ background: "#a2d2ff", borderRight: "4px solid #fff" }}
      >
        <span className="font-black text-2xl tracking-wide uppercase" style={{ color: "#2c3e50" }}>
          Left Hand
        </span>
        <span style={{ fontSize: 110, minHeight: 150, display: "flex", alignItems: "center" }}>
          {left}
        </span>
      </div>

      {/* Right hand */}
      <div
        className="flex-1 flex flex-col items-center justify-center gap-3 relative"
        style={{ background: "#bdf0c0" }}
      >
        <span className="font-black text-2xl tracking-wide uppercase" style={{ color: "#2c3e50" }}>
          Right Hand
        </span>
        <span style={{ fontSize: 110, minHeight: 150, display: "flex", alignItems: "center", transform: "scaleX(-1)" }}>
          {right}
        </span>
      </div>
      </div>
    </div>
  );
}
