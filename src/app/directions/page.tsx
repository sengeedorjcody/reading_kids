"use client";

import { useState } from "react";
import { useSpeech } from "@/hooks/useSpeech";

interface DirWord {
  japanese: string;
  romaji: string;
  english: string;
  emoji: string;
  color: string;
  textColor?: string;
}

// ── Basic directions (compass + relative) ─────────────────────────────────
const BASIC: DirWord[] = [
  { japanese: "うえ",     romaji: "ue",       english: "Up",      emoji: "⬆️", color: "#3b82f6", textColor: "#fff" },
  { japanese: "した",     romaji: "shita",    english: "Down",    emoji: "⬇️", color: "#8b5cf6", textColor: "#fff" },
  { japanese: "みぎ",     romaji: "migi",     english: "Right",   emoji: "➡️", color: "#22c55e", textColor: "#fff" },
  { japanese: "ひだり",   romaji: "hidari",   english: "Left",    emoji: "⬅️", color: "#f97316", textColor: "#fff" },
  { japanese: "まえ",     romaji: "mae",      english: "Forward", emoji: "↗️", color: "#0ea5e9", textColor: "#fff" },
  { japanese: "うしろ",   romaji: "ushiro",   english: "Behind",  emoji: "↙️", color: "#ec4899", textColor: "#fff" },
];

// ── Compass directions ─────────────────────────────────────────────────────
const COMPASS: DirWord[] = [
  { japanese: "きた",     romaji: "kita",     english: "North",       emoji: "🧭", color: "#ef4444", textColor: "#fff" },
  { japanese: "みなみ",   romaji: "minami",   english: "South",       emoji: "🧭", color: "#f97316", textColor: "#fff" },
  { japanese: "ひがし",   romaji: "higashi",  english: "East",        emoji: "🧭", color: "#eab308", textColor: "#1f2937" },
  { japanese: "にし",     romaji: "nishi",    english: "West",        emoji: "🧭", color: "#6366f1", textColor: "#fff" },
];

// ── Location words ─────────────────────────────────────────────────────────
const LOCATION: DirWord[] = [
  { japanese: "ここ",         romaji: "koko",         english: "Here",           emoji: "📍", color: "#14b8a6", textColor: "#fff" },
  { japanese: "そこ",         romaji: "soko",         english: "There",          emoji: "📌", color: "#8b5cf6", textColor: "#fff" },
  { japanese: "あそこ",       romaji: "asoko",        english: "Over there",     emoji: "👆", color: "#f43f5e", textColor: "#fff" },
  { japanese: "なか",         romaji: "naka",         english: "Inside / Middle",emoji: "⬛", color: "#64748b", textColor: "#fff" },
  { japanese: "そと",         romaji: "soto",         english: "Outside",        emoji: "🔲", color: "#94a3b8", textColor: "#fff" },
  { japanese: "となり",       romaji: "tonari",       english: "Next to",        emoji: "↔️", color: "#22c55e", textColor: "#fff" },
  { japanese: "まっすぐ",     romaji: "massugu",      english: "Straight ahead", emoji: "⏫", color: "#0ea5e9", textColor: "#fff" },
  { japanese: "ちかい",       romaji: "chikai",       english: "Near / Close",   emoji: "🔵", color: "#3b82f6", textColor: "#fff" },
  { japanese: "とおい",       romaji: "tooi",         english: "Far",            emoji: "⚪", color: "#6b7280", textColor: "#fff" },
  { japanese: "みぎにまがる", romaji: "migi ni magaru",  english: "Turn right",  emoji: "↪️", color: "#16a34a", textColor: "#fff" },
  { japanese: "ひだりにまがる", romaji: "hidari ni magaru", english: "Turn left", emoji: "↩️", color: "#dc2626", textColor: "#fff" },
  { japanese: "むこう",       romaji: "mukou",        english: "Other side",     emoji: "🔄", color: "#7c3aed", textColor: "#fff" },
];

function DirCard({ word, onTap, isActive }: { word: DirWord; onTap: () => void; isActive: boolean }) {
  return (
    <button
      onClick={onTap}
      className="flex flex-col items-center justify-center rounded-3xl transition-all active:scale-95 p-3 gap-1"
      style={{
        backgroundColor: isActive ? word.color : "rgba(255,255,255,0.9)",
        boxShadow: isActive
          ? `0 6px 20px ${word.color}55`
          : "0 2px 8px rgba(0,0,0,0.06)",
        transform: isActive ? "scale(1.06)" : undefined,
        border: `2px solid ${isActive ? word.color : "#f1f5f9"}`,
        minHeight: "90px",
      }}
    >
      <span className="text-3xl leading-none">{word.emoji}</span>
      <span
        className="text-lg font-black leading-tight mt-1"
        style={{ color: isActive ? (word.textColor ?? "#fff") : word.color }}
      >
        {word.japanese}
      </span>
      <span
        className="text-[11px] font-bold"
        style={{ color: isActive ? "rgba(255,255,255,0.75)" : "#94a3b8" }}
      >
        {word.romaji}
      </span>
      <span
        className="text-[10px] font-bold"
        style={{ color: isActive ? "rgba(255,255,255,0.6)" : "#cbd5e1" }}
      >
        {word.english}
      </span>
      {isActive && <span className="text-xs mt-0.5">🔊</span>}
    </button>
  );
}

export default function DirectionsPage() {
  const [active, setActive] = useState<string | null>(null);
  const { speak } = useSpeech();

  const tap = (w: DirWord) => {
    speak(w.japanese);
    setActive(w.japanese);
    setTimeout(() => setActive(null), 1800);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-28">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-black text-gray-800">🧭 ほうこう</h1>
        <p className="text-base text-gray-400">タップして ほうこうを きこう！</p>
      </div>

      {/* ── Basic 6 directions — 3×2 grid ── */}
      <div className="mb-2">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
          基本の方向
        </p>

        {/* Arrow cross layout — up center, left/right/down */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div />
          <DirCard word={BASIC[0]} onTap={() => tap(BASIC[0])} isActive={active === BASIC[0].japanese} />
          <div />

          <DirCard word={BASIC[3]} onTap={() => tap(BASIC[3])} isActive={active === BASIC[3].japanese} />
          <div className="flex items-center justify-center rounded-3xl bg-gray-100 text-gray-300 text-4xl font-black" style={{ minHeight: 90 }}>
            ＋
          </div>
          <DirCard word={BASIC[2]} onTap={() => tap(BASIC[2])} isActive={active === BASIC[2].japanese} />

          <div />
          <DirCard word={BASIC[1]} onTap={() => tap(BASIC[1])} isActive={active === BASIC[1].japanese} />
          <div />
        </div>

        {/* Forward + Behind */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <DirCard word={BASIC[4]} onTap={() => tap(BASIC[4])} isActive={active === BASIC[4].japanese} />
          <DirCard word={BASIC[5]} onTap={() => tap(BASIC[5])} isActive={active === BASIC[5].japanese} />
        </div>
      </div>

      {/* ── Compass — 2×2 ── */}
      <div className="mb-4">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
          方位 (Compass)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {COMPASS.map((w) => (
            <DirCard key={w.japanese} word={w} onTap={() => tap(w)} isActive={active === w.japanese} />
          ))}
        </div>
      </div>

      {/* ── Location words — 3-col grid ── */}
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
          場所・移動
        </p>
        <div className="grid grid-cols-3 gap-2">
          {LOCATION.map((w) => (
            <DirCard key={w.japanese} word={w} onTap={() => tap(w)} isActive={active === w.japanese} />
          ))}
        </div>
      </div>
    </div>
  );
}
