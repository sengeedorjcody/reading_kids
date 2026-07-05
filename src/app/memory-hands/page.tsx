"use client";

import { useState, useEffect } from "react";

const GESTURES = ["✋", "✊", "✌️", "👍", "☝️", "🤘", "👌", "🖐️"];

function randomGesture() {
  return GESTURES[Math.floor(Math.random() * GESTURES.length)];
}

export default function MemoryHandsGame() {
  const [left, setLeft] = useState(() => randomGesture());
  const [right, setRight] = useState(() => randomGesture());

  useEffect(() => {
    const t = setInterval(() => {
      setLeft(randomGesture());
      setRight(randomGesture());
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed inset-0 flex overflow-hidden select-none">
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
  );
}
