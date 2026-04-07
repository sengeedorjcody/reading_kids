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
const TARGET_COUNT = 4;

// Kid-friendly vibrant palette (used in default state)
const COLORS = [
  "#f97316", "#8b5cf6", "#0ea5e9", "#ec4899",
  "#84cc16", "#f59e0b", "#06b6d4", "#d946ef",
  "#14b8a6", "#6366f1", "#e11d48", "#65a30d",
];

// Small kana characters — second char in combos like きゃ
const SMALL_KANA = new Set("ぁぃぅぇぉっゃゅょゎゕゖァィゥェォッャュョヮヵヶ");

interface GameItem {
  id: number;
  char: string;
  romaji: string;
  speakText: string; // what to pass to TTS
  x: number;
  y: number;
  size: number;
  rotate: number;
  color: string;
  state: "default" | "correct" | "wrong";
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Divide the play field into an 8×7 grid (56 cells).
 * Y range is capped at 78% so nothing ends up behind the bottom nav (~96px).
 */
function buildGrid(): Array<{ x: number; y: number }> {
  const COLS = 8, ROWS = 7;
  const X_RANGE = 90, Y_RANGE = 75; // % — Y capped to avoid bottom nav
  const cellW = X_RANGE / COLS;
  const cellH = Y_RANGE / ROWS;
  const cells: Array<{ x: number; y: number }> = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      cells.push({
        x: 5 + c * cellW + cellW * 0.2 + Math.random() * cellW * 0.6,
        y: 5 + r * cellH + cellH * 0.2 + Math.random() * cellH * 0.6,
      });
    }
  }
  cells.sort(() => Math.random() - 0.5);
  return cells.slice(0, TOTAL_ITEMS);
}

function generateItems(target: KanaChar, allChars: KanaChar[]): GameItem[] {
  const others = allChars.filter((c) => c.char !== target.char);
  const positions = buildGrid();
  const items: GameItem[] = [];

  const toSpeakText = (k: KanaChar) => k.phonetic ?? k.romaji ?? k.char;

  // Target appears TARGET_COUNT times
  for (let i = 0; i < TARGET_COUNT; i++) {
    const pos = positions[i];
    items.push({
      id: i,
      char: target.char,
      romaji: target.romaji,
      speakText: toSpeakText(target),
      x: pos.x,
      y: pos.y,
      size: 28 + Math.floor(Math.random() * 40), // 28–68px
      rotate: (Math.random() - 0.5) * 30,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      state: "default",
    });
  }

  // Fill rest with random distractors
  for (let i = TARGET_COUNT; i < TOTAL_ITEMS; i++) {
    const pos = positions[i];
    const other = randomItem(others);
    items.push({
      id: i,
      char: other.char,
      romaji: other.romaji,
      speakText: toSpeakText(other),
      x: pos.x,
      y: pos.y,
      size: 22 + Math.floor(Math.random() * 36), // 22–58px
      rotate: (Math.random() - 0.5) * 30,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      state: "default",
    });
  }

  return items.sort(() => Math.random() - 0.5);
}

/** Render a character — combo chars (e.g. きゃ) get the second glyph smaller */
function CharGlyph({ char }: { char: string }) {
  if (char.length === 2 && SMALL_KANA.has(char[1])) {
    return (
      <span style={{ display: "inline-flex", alignItems: "flex-end", lineHeight: 1 }}>
        <span style={{ lineHeight: 1 }}>{char[0]}</span>
        <span style={{ fontSize: "0.52em", lineHeight: 1 }}>{char[1]}</span>
      </span>
    );
  }
  return <>{char}</>;
}

export default function GamePage() {
  const [charset, setCharset] = useState<Charset>("hiragana");
  const [target, setTarget] = useState<KanaChar>(() => randomItem(HIRAGANA));
  const [items, setItems] = useState<GameItem[]>(() =>
    generateItems(randomItem(HIRAGANA), HIRAGANA)
  );
  const [found, setFound] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const { speak } = useSpeech();
  const wrongTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const startRound = useCallback((cs: Charset) => {
    const chars = CHARSET_MAP[cs];
    const newTarget = randomItem(chars);
    setTarget(newTarget);
    setItems(generateItems(newTarget, chars));
    setFound(0);
    setShowCongrats(false);
    wrongTimers.current.forEach(clearTimeout);
    wrongTimers.current.clear();
  }, []);

  const switchCharset = (cs: Charset) => {
    setCharset(cs);
    startRound(cs);
  };

  const handleTap = (item: GameItem) => {
    if (item.state === "correct") return;
    speak(item.speakText);

    if (item.char === target.char) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, state: "correct" } : i))
      );
      setFound((f) => {
        const next = f + 1;
        if (next >= TARGET_COUNT) setShowCongrats(true);
        return next;
      });
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, state: "wrong" } : i))
      );
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
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex-shrink-0 z-20 bg-white/90 backdrop-blur border-b border-purple-100 shadow-sm">
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold">Found</span>
            <span className="text-2xl font-black text-green-500 tabular-nums">
              {found}
              <span className="text-sm text-gray-300">/{TARGET_COUNT}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 pb-3 gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Find all:</span>
            <div className={`w-14 h-14 rounded-2xl bg-white border-2 flex items-center justify-center shadow-lg ${charsetColors[charset].ring}`}>
              <span
                className="font-black text-gray-800 select-none"
                style={{ fontSize: target.char.length > 1 ? "1.6rem" : "2.25rem" }}
              >
                <CharGlyph char={target.char} />
              </span>
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
          const color = isCorrect ? "#22c55e" : isWrong ? "#ef4444" : item.color;
          const shadow = isCorrect
            ? "0 0 14px rgba(34,197,94,0.8)"
            : isWrong
            ? "0 0 14px rgba(239,68,68,0.8)"
            : "none";

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
                color,
                textShadow: shadow,
                transition: "color 0.15s, text-shadow 0.15s",
                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: "none",
                zIndex: isCorrect ? 10 : 1,
                fontWeight: "bold",
              }}
              className="active:scale-125 focus:outline-none"
            >
              <CharGlyph char={item.char} />
            </button>
          );
        })}

        {/* ── Congrats popup ── */}
        {showCongrats && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl px-8 py-10 flex flex-col items-center gap-5 mx-6 animate-fade-in">
              <div className="text-7xl animate-bounce">🎉</div>
              <p className="text-2xl font-black text-green-600 text-center">
                You found all {TARGET_COUNT}!
              </p>
              {/* Show the character they just found */}
              <div className="flex items-center gap-3">
                <div className={`w-16 h-16 rounded-2xl bg-green-50 border-2 border-green-400 flex items-center justify-center shadow`}>
                  <span className="text-4xl font-black text-green-600 select-none">
                    <CharGlyph char={target.char} />
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-green-500">{target.romaji}</p>
                  <p className="text-sm text-gray-400">Great job! 🌟</p>
                </div>
              </div>
              <button
                onClick={() => startRound(charset)}
                className="w-full py-4 rounded-3xl bg-green-500 hover:bg-green-600 text-white text-xl font-black shadow-lg active:scale-95 transition-all"
              >
                Find Next ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
