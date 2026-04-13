"use client";

import { useState, useRef, useCallback } from "react";
import { THEMES, Theme, ThemeWord } from "@/constants/themes";
import { useSpeech } from "@/hooks/useSpeech";

interface PlacedWord {
  id: number;
  word: ThemeWord;
  x: number;
  y: number;
  size: number;
  rotate: number;
  tapped: boolean;
}

function buildLayout(words: ThemeWord[]): PlacedWord[] {
  const COLS = 5, ROWS = 5;
  const cellW = 88 / COLS;
  const cellH = 76 / ROWS;

  const cells: { x: number; y: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      cells.push({
        x: 6 + c * cellW + cellW * 0.1 + Math.random() * cellW * 0.8,
        y: 6 + r * cellH + cellH * 0.1 + Math.random() * cellH * 0.8,
      });
    }
  }
  cells.sort(() => Math.random() - 0.5);
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, cells.length).map((word, i) => ({
    id: i, word,
    x: cells[i].x, y: cells[i].y,
    size: 38 + Math.floor(Math.random() * 24),
    rotate: (Math.random() - 0.5) * 18,
    tapped: false,
  }));
}

export default function ThemesPage() {
  const [themeId, setThemeId] = useState(THEMES[0].id);
  const theme = THEMES.find((t) => t.id === themeId)!;

  const [placed, setPlaced] = useState<PlacedWord[]>(() => buildLayout(theme.words));
  const [active, setActive] = useState<ThemeWord | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const { speak } = useSpeech();
  const labelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const switchTheme = (t: Theme) => {
    setThemeId(t.id);
    setActive(null);
    setPlayingId(null);
    if (labelTimer.current) clearTimeout(labelTimer.current);
    setPlaced(buildLayout(t.words));
  };

  // For scattered emoji themes
  const handleTap = useCallback((p: PlacedWord) => {
    speak(p.word.japanese);
    setActive(p.word);
    if (labelTimer.current) clearTimeout(labelTimer.current);
    labelTimer.current = setTimeout(() => setActive(null), 2500);

    setPlaced((prev) => prev.map((i) => (i.id === p.id ? { ...i, tapped: true } : i)));
    if (tapTimers.current.has(p.id)) clearTimeout(tapTimers.current.get(p.id));
    const t = setTimeout(() => {
      setPlaced((prev) => prev.map((i) => (i.id === p.id ? { ...i, tapped: false } : i)));
      tapTimers.current.delete(p.id);
    }, 400);
    tapTimers.current.set(p.id, t);
  }, [speak]);

  // For sentence card themes
  const handleSentenceTap = (word: ThemeWord, idx: number) => {
    speak(word.japanese);
    setPlayingId(idx);
    setTimeout(() => setPlayingId(null), 2500);
  };

  return (
    <div className={`fixed inset-0 flex flex-col bg-gradient-to-br ${theme.bg} overflow-hidden`}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        {/* Title row */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div>
            <h1 className="text-xl font-black text-gray-800">{theme.icon} {theme.label}</h1>
            <p className="text-xs text-gray-400">
              {theme.isSentences ? "Tap a sentence to hear it spoken" : "Tap to hear the Japanese word"}
            </p>
          </div>
          {!theme.isSentences && (
            <button
              onClick={() => { setPlaced(buildLayout(theme.words)); setActive(null); }}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-black text-xs active:scale-95 transition-all"
            >
              <span className="text-lg">🔀</span>
              Shuffle
            </button>
          )}
        </div>

        {/* Category tabs — wrapping */}
        <div className="flex flex-wrap gap-2 px-3 pb-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTheme(t)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-black transition-all shadow ${
                themeId === t.id
                  ? t.color + " shadow-md scale-105"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Sentence card layout ── */}
      {theme.isSentences ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {theme.words.map((word, idx) => {
            const isPlaying = playingId === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSentenceTap(word, idx)}
                className={`w-full text-left flex items-center gap-4 px-5 py-4 rounded-3xl border-2 shadow-sm transition-all active:scale-95 ${
                  isPlaying
                    ? "bg-amber-50 border-amber-400 shadow-amber-200 shadow-md"
                    : "bg-white border-amber-100 hover:border-amber-300"
                }`}
              >
                <span className="text-4xl flex-shrink-0">{word.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-gray-800 leading-snug">{word.japanese}</p>
                  <p className="text-sm font-bold text-amber-600 mt-0.5">{word.romaji}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{word.english}</p>
                </div>
                <span className={`text-2xl flex-shrink-0 transition-transform ${isPlaying ? "scale-125" : ""}`}>
                  🔊
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        /* ── Scattered emoji layout ── */
        <div className="flex-1 relative overflow-hidden">
          {placed.map((p) => (
            <button
              key={p.id}
              onClick={() => handleTap(p)}
              style={{
                position: "absolute",
                left: `${p.x}%`,
                top: `${p.y}%`,
                fontSize: `${p.size}px`,
                transform: `translate(-50%, -50%) rotate(${p.rotate}deg) scale(${p.tapped ? 1.4 : 1})`,
                lineHeight: 1,
                transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: "manipulation",
                zIndex: p.tapped ? 20 : 1,
              }}
              className="focus:outline-none"
              aria-label={p.word.english}
            >
              {p.word.emoji}
            </button>
          ))}

          {/* Floating label card */}
          {active && (
            <div
              key={active.japanese}
              className="fixed bottom-28 left-1/2 z-50 animate-fade-in"
              style={{ transform: "translateX(-50%)" }}
            >
              <div className={`bg-white rounded-3xl shadow-2xl border ${theme.borderColor} px-6 py-4 flex items-center gap-4 min-w-[240px]`}>
                <span className="text-5xl">{active.emoji}</span>
                <div>
                  <p className="text-3xl font-black text-gray-800 leading-tight">{active.japanese}</p>
                  <p className="text-base font-bold text-blue-500">{active.romaji}</p>
                  <p className="text-sm text-gray-400">{active.english}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
