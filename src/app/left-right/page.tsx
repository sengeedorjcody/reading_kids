"use client";

import { useState, useEffect } from "react";
import { useSpeech } from "@/hooks/useSpeech";

const HAND_SHAPES = ["✋", "🖐️", "✌️", "✊", "👍", "☝️", "🤘", "👌"];
const SPEED_OPTIONS = [3, 5, 8, 10];

function randomShape() {
  return HAND_SHAPES[Math.floor(Math.random() * HAND_SHAPES.length)];
}

export default function LeftRightPage() {
  const [leftShape, setLeftShape] = useState(() => randomShape());
  const [rightShape, setRightShape] = useState(() => randomShape());
  const [flash, setFlash] = useState<"left" | "right" | null>(null);
  const [speed, setSpeed] = useState(5);
  const { speak } = useSpeech();

  const tap = (side: "left" | "right") => {
    speak(side === "left" ? "ひだりて" : "みぎて");
    setFlash(side);
    setTimeout(() => setFlash(null), 250);
  };

  useEffect(() => {
    const t = setInterval(() => {
      setLeftShape(randomShape());
      setRightShape(randomShape());
    }, speed * 1000);
    return () => clearInterval(t);
  }, [speed]);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 text-center py-3 z-10" style={{ background: "#1e293b" }}>
        <h1 className="text-white font-black text-lg">👈👉 ひだり・みぎ</h1>
        <p className="text-white/50 text-xs font-bold mb-2">Зүүн ба баруун гар</p>
        <div className="flex items-center justify-center gap-1.5">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className="px-3 py-1 rounded-full text-xs font-black transition-all active:scale-95"
              style={
                speed === s
                  ? { background: "#f97316", color: "#fff" }
                  : { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }
              }
            >
              {s}s
            </button>
          ))}
        </div>
      </div>

      {/* Split screen */}
      <div className="flex-1 flex">
        {/* Left panel */}
        <button
          onClick={() => tap("left")}
          className="flex-1 flex flex-col items-center justify-center gap-4 transition-all active:brightness-110"
          style={{
            background: flash === "left" ? "#60a5fa" : "#93c5fd",
          }}
        >
          <span className="text-white font-black text-xl tracking-wide uppercase drop-shadow">
            Зүүн гар
          </span>
          <span style={{ fontSize: 110 }} className="drop-shadow-lg">{leftShape}</span>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-white font-black text-2xl drop-shadow">ひだりて</span>
            <span className="text-white/70 text-sm font-bold">hidari te</span>
          </div>
        </button>

        {/* Right panel */}
        <button
          onClick={() => tap("right")}
          className="flex-1 flex flex-col items-center justify-center gap-4 transition-all active:brightness-110"
          style={{
            background: flash === "right" ? "#4ade80" : "#86efac",
          }}
        >
          <span className="text-white font-black text-xl tracking-wide uppercase drop-shadow">
            Баруун гар
          </span>
          <span style={{ fontSize: 110, display: "inline-block", transform: "scaleX(-1)" }} className="drop-shadow-lg">{rightShape}</span>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-white font-black text-2xl drop-shadow">みぎて</span>
            <span className="text-white/70 text-sm font-bold">migi te</span>
          </div>
        </button>
      </div>
    </div>
  );
}
