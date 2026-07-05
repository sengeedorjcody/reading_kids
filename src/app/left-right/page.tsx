"use client";

import { useState } from "react";
import { useSpeech } from "@/hooks/useSpeech";

interface Round {
  emoji: string;
  japanese: string;
  romaji: string;
  mongolian: string;
}

interface Pair {
  left: Round;
  right: Round;
}

const ROUNDS: Pair[] = [
  {
    left:  { emoji: "🖐️", japanese: "ひだりて", romaji: "hidari te", mongolian: "Зүүн гар" },
    right: { emoji: "✌️", japanese: "みぎて",   romaji: "migi te",   mongolian: "Баруун гар" },
  },
  {
    left:  { emoji: "🦵", japanese: "ひだりあし", romaji: "hidari ashi", mongolian: "Зүүн хөл" },
    right: { emoji: "🦶", japanese: "みぎあし",   romaji: "migi ashi",   mongolian: "Баруун хөл" },
  },
  {
    left:  { emoji: "👈", japanese: "ひだり", romaji: "hidari", mongolian: "Зүүн тал" },
    right: { emoji: "👉", japanese: "みぎ",   romaji: "migi",   mongolian: "Баруун тал" },
  },
  {
    left:  { emoji: "↩️", japanese: "ひだりに まがる", romaji: "hidari ni magaru", mongolian: "Зүүн тийш эргэх" },
    right: { emoji: "↪️", japanese: "みぎに まがる",   romaji: "migi ni magaru",   mongolian: "Баруун тийш эргэх" },
  },
  {
    left:  { emoji: "👁️", japanese: "ひだりめ", romaji: "hidari me", mongolian: "Зүүн нүд" },
    right: { emoji: "👁️", japanese: "みぎめ",   romaji: "migi me",   mongolian: "Баруун нүд" },
  },
];

export default function LeftRightPage() {
  const [idx, setIdx] = useState(0);
  const [flash, setFlash] = useState<"left" | "right" | null>(null);
  const { speak } = useSpeech();

  const pair = ROUNDS[idx];

  const tap = (side: "left" | "right") => {
    const r = pair[side];
    speak(r.japanese);
    setFlash(side);
    setTimeout(() => setFlash(null), 250);
  };

  const next = () => setIdx((i) => (i + 1) % ROUNDS.length);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 text-center py-3 z-10" style={{ background: "#1e293b" }}>
        <h1 className="text-white font-black text-lg">👈👉 ひだり・みぎ</h1>
        <p className="text-white/50 text-xs font-bold">Зүүн ба баруун тал</p>
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
            {pair.left.mongolian}
          </span>
          <span style={{ fontSize: 100 }} className="drop-shadow-lg">{pair.left.emoji}</span>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-white font-black text-2xl drop-shadow">{pair.left.japanese}</span>
            <span className="text-white/70 text-sm font-bold">{pair.left.romaji}</span>
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
            {pair.right.mongolian}
          </span>
          <span style={{ fontSize: 100 }} className="drop-shadow-lg">{pair.right.emoji}</span>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-white font-black text-2xl drop-shadow">{pair.right.japanese}</span>
            <span className="text-white/70 text-sm font-bold">{pair.right.romaji}</span>
          </div>
        </button>
      </div>

      {/* Next button */}
      <div className="flex-shrink-0 flex justify-center py-6 z-10" style={{ background: "#1e293b" }}>
        <button
          onClick={next}
          className="flex items-center gap-2 px-8 py-4 rounded-full font-black text-white text-lg active:scale-95 transition-all shadow-xl"
          style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
        >
          ДАРААГИЙН →
        </button>
      </div>
    </div>
  );
}
