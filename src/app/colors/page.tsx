"use client";

import { useState } from "react";
import { useSpeech } from "@/hooks/useSpeech";

interface ColorItem {
  japanese: string;
  romaji: string;
  english: string;
  hex: string;
  text: string;
  border?: string;
}

const COLORS: ColorItem[] = [
  { japanese: "あか",       romaji: "aka",       english: "Red",        hex: "#ef4444", text: "#fff" },
  { japanese: "あお",       romaji: "ao",        english: "Blue",       hex: "#3b82f6", text: "#fff" },
  { japanese: "きいろ",     romaji: "kiiro",     english: "Yellow",     hex: "#eab308", text: "#1f2937" },
  { japanese: "みどり",     romaji: "midori",    english: "Green",      hex: "#22c55e", text: "#fff" },
  { japanese: "オレンジ",   romaji: "orenji",    english: "Orange",     hex: "#f97316", text: "#fff" },
  { japanese: "むらさき",   romaji: "murasaki",  english: "Purple",     hex: "#8b5cf6", text: "#fff" },
  { japanese: "ももいろ",   romaji: "momoiro",   english: "Pink",       hex: "#ec4899", text: "#fff" },
  { japanese: "ちゃいろ",   romaji: "chairo",    english: "Brown",      hex: "#92400e", text: "#fff" },
  { japanese: "みずいろ",   romaji: "mizuiro",   english: "Light Blue", hex: "#38bdf8", text: "#fff" },
  { japanese: "きんいろ",   romaji: "kin'iro",   english: "Gold",       hex: "#f59e0b", text: "#fff" },
  { japanese: "しろ",       romaji: "shiro",     english: "White",      hex: "#f8fafc", text: "#1e293b", border: "#e2e8f0" },
  { japanese: "くろ",       romaji: "kuro",      english: "Black",      hex: "#1e293b", text: "#fff" },
  { japanese: "はいいろ",   romaji: "haiiro",    english: "Gray",       hex: "#6b7280", text: "#fff" },
  { japanese: "ぎんいろ",   romaji: "gin'iro",   english: "Silver",     hex: "#cbd5e1", text: "#1e293b" },
  { japanese: "あずきいろ", romaji: "azukiiro",  english: "Maroon",     hex: "#9f1239", text: "#fff" },
  { japanese: "ネイビー",   romaji: "neibi",     english: "Navy",       hex: "#1e3a5f", text: "#fff" },
];

export default function ColorsPage() {
  const [active, setActive] = useState<string | null>(null);
  const { speak } = useSpeech();

  const handleTap = (c: ColorItem) => {
    speak(c.japanese);
    setActive(c.japanese);
    setTimeout(() => setActive(null), 1800);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-28">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-black text-gray-800">🎨 いろ</h1>
        <p className="text-base text-gray-400">タップして いろの なまえを きこう！</p>
      </div>

      {/* Color grid */}
      <div className="grid grid-cols-2 gap-3">
        {COLORS.map((c) => {
          const isActive = active === c.japanese;
          return (
            <button
              key={c.japanese}
              onClick={() => handleTap(c)}
              className="relative flex flex-col items-center justify-center rounded-3xl overflow-hidden transition-all active:scale-95"
              style={{
                backgroundColor: c.hex,
                border: c.border ? `2px solid ${c.border}` : "2px solid transparent",
                boxShadow: isActive
                  ? `0 0 0 4px ${c.hex}66, 0 8px 24px ${c.hex}55`
                  : "0 2px 12px rgba(0,0,0,0.08)",
                transform: isActive ? "scale(1.04)" : undefined,
                height: "120px",
              }}
            >
              {/* Color swatch fill */}
              <div className="absolute inset-0" style={{ backgroundColor: c.hex }} />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-1 px-3 py-4">
                <span
                  className="text-3xl font-black leading-none"
                  style={{ color: c.text }}
                >
                  {c.japanese}
                </span>
                <span
                  className="text-sm font-bold opacity-80"
                  style={{ color: c.text }}
                >
                  {c.romaji}
                </span>
                <span
                  className="text-xs font-bold opacity-60"
                  style={{ color: c.text }}
                >
                  {c.english}
                </span>
              </div>

              {/* Speaker icon when active */}
              {isActive && (
                <div className="absolute top-2 right-2 text-xl animate-bounce">
                  🔊
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Tip */}
      <p className="text-center text-xs text-gray-300 mt-6 font-bold">
        {COLORS.length}色 · Tap any color to hear its name
      </p>
    </div>
  );
}
