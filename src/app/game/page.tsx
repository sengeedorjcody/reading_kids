"use client";

import { useState, useCallback, useRef } from "react";
import { HIRAGANA } from "@/constants/hiragana";
import { KATAKANA } from "@/constants/katakana";
import { MONGOLIAN } from "@/constants/mongolian";
import { useSpeech } from "@/hooks/useSpeech";
import { KanaChar } from "@/types";

type Charset = "hiragana" | "katakana" | "mongolian";

const CHARSET_MAP: Record<Charset, KanaChar[]> = {
  hiragana: HIRAGANA,
  katakana: KATAKANA,
  mongolian: MONGOLIAN as unknown as KanaChar[],
};

const TOTAL_ITEMS = 50;
const TARGET_COUNT = 9; // how many times target appears in the pool

interface GameItem {
  id: number;
  char: string;
  romaji: string;
  x: number;   // % left
  y: number;   // % top
  size: number; // font-size px
  rotate: number; // deg rotation for extra chaos
  state: "default" | "correct" | "wrong";
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateItems(target: KanaChar, allChars: KanaChar[]): GameItem[] {
  const others = allChars.filter((c) => c.char !== target.char);
  const items: GameItem[] = [];

  // Target appears TARGET_COUNT times
  for (let i = 0; i < TARGET_COUNT; i++) {
    items.push({
      id: i,
      char: target.char,
      romaji: target.romaji,
      x: 4 + Math.random() * 82,
      y: 4 + Math.random() * 82,
      size: 28 + Math.floor(Math.random() * 52), // 28–80px
      rotate: (Math.random() - 0.5) * 40,
      state: "default",
    });
  }

  // Fill rest with random distractors (can repeat)
  for (let i = TARGET_COUNT; i < TOTAL_ITEMS; i++) {
    const other = randomItem(others);
    items.push({
      id: i,
      char: other.char,
      romaji: other.romaji,
      x: 4 + Math.random() * 82,
      y: 4 + Math.random() * 82,
      size: 20 + Math.floor(Math.random() * 48), // 20–68px
      rotate: (Math.random() - 0.5) * 40,
      state: "default",
    });
  }

  // Shuffle
  return items.sort(() => Math.random() - 0.5);
}

export default function GamePage() {
  const [charset, setCharset] = useState<Charset>("hiragana");
  const [target, setTarget] = useState<KanaChar>(() => randomItem(HIRAGANA));
  const [items, setItems] = useState<GameItem[]>(() =>
    generateItems(randomItem(HIRAGANA), HIRAGANA)
  );
  const [found, setFound] = useState(0);
  const { speak } = useSpeech();
  const wrongTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const complete = found >= TARGET_COUNT;

  const startRound = useCallback((cs: Charset) => {
    const chars = CHARSET_MAP[cs];
    const newTarget = randomItem(chars);
    setTarget(newTarget);
    setItems(generateItems(newTarget, chars));
    setFound(0);
    wrongTimers.current.forEach(clearTimeout);
    wrongTimers.current.clear();
  }, []);

  const switchCharset = (cs: Charset) => {
    setCharset(cs);
    startRound(cs);
  };

  const handleTap = (item: GameItem) => {
    if (item.state === "correct") return;

    // Speak the character
    speak(item.char);

    if (item.char === target.char) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, state: "correct" } : i))
      );
      setFound((f) => f + 1);
    } else {
      // Show red briefly
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, state: "wrong" } : i))
      );
      // Clear any existing timer for this item
      if (wrongTimers.current.has(item.id)) {
        clearTimeout(wrongTimers.current.get(item.id));
      }
      const timer = setTimeout(() => {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id && i.state === "wrong" ? { ...i, state: "default" } : i
          )
        );
        wrongTimers.current.delete(item.id);
      }, 700);
      wrongTimers.current.set(item.id, timer);
    }
  };

  const charsetColors: Record<Charset, { active: string; ring: string }> = {
    hiragana: { active: "bg-pink-500 text-white shadow-pink-200", ring: "border-pink-400" },
    katakana: { active: "bg-blue-500 text-white shadow-blue-200", ring: "border-blue-400" },
    mongolian: { active: "bg-green-500 text-white shadow-green-200", ring: "border-green-400" },
  };

  return (
    // Fixed full-screen layout — hide the bottom nav area
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex-shrink-0 z-20 bg-white/90 backdrop-blur border-b border-purple-100 shadow-sm">

        {/* Top row: charset switcher + score */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1 gap-2">
          <div className="flex gap-1.5">
            {(["hiragana", "katakana", "mongolian"] as Charset[]).map((cs) => (
              <button
                key={cs}
                onClick={() => switchCharset(cs)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all shadow ${
                  charset === cs
                    ? charsetColors[cs].active + " shadow-md scale-105"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {cs === "hiragana" ? "あ" : cs === "katakana" ? "ア" : "А"}
              </button>
            ))}
          </div>

          {/* Score */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold">Found</span>
            <span className="text-2xl font-black text-green-500 tabular-nums">
              {found}
              <span className="text-sm text-gray-300">/{TARGET_COUNT}</span>
            </span>
          </div>
        </div>

        {/* Bottom row: target character */}
        <div className="flex items-center justify-between px-3 pb-3 gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Find all:</span>
            <div
              className={`w-14 h-14 rounded-2xl border-3 flex items-center justify-center shadow-lg ${charsetColors[charset].ring} bg-white border-2`}
            >
              <span className="text-4xl font-black text-gray-800 select-none">{target.char}</span>
            </div>
            <div>
              <p className="text-xl font-black text-purple-600">{target.romaji}</p>
              <p className="text-xs text-gray-400">Tap every one you find</p>
            </div>
          </div>

          <button
            onClick={() => startRound(charset)}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-600 font-black text-xs active:scale-95 transition-all"
          >
            <span className="text-lg">🔀</span>
            New
          </button>
        </div>
      </div>

      {/* ── Game area ── */}
      <div className="flex-1 relative overflow-hidden">
        {items.map((item) => {
          const isCorrect = item.state === "correct";
          const isWrong = item.state === "wrong";

          return (
            <button
              key={item.id}
              onPointerDown={(e) => {
                e.preventDefault();
                handleTap(item);
              }}
              style={{
                position: "absolute",
                left: `${item.x}%`,
                top: `${item.y}%`,
                fontSize: `${item.size}px`,
                transform: `translate(-50%, -50%) rotate(${item.rotate}deg)`,
                lineHeight: 1,
                color: isCorrect
                  ? "#22c55e"
                  : isWrong
                  ? "#ef4444"
                  : "#374151",
                textShadow: isCorrect
                  ? "0 0 12px rgba(34,197,94,0.7)"
                  : isWrong
                  ? "0 0 12px rgba(239,68,68,0.7)"
                  : "none",
                transition: "color 0.15s, text-shadow 0.15s, transform 0.1s",
                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: "none",
                zIndex: isCorrect ? 10 : 1,
              }}
              className="font-bold active:scale-125 focus:outline-none"
            >
              {item.char}
            </button>
          );
        })}

        {/* ── All found celebration ── */}
        {complete && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm z-30 gap-4">
            <div className="text-7xl animate-bounce">🎉</div>
            <p className="text-3xl font-black text-green-600">All {TARGET_COUNT} found!</p>
            <button
              onClick={() => startRound(charset)}
              className="mt-2 px-8 py-4 rounded-3xl bg-green-500 hover:bg-green-600 text-white text-xl font-black shadow-xl active:scale-95 transition-all"
            >
              Next Round ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
