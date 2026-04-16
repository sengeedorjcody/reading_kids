"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
    id: i, word, x: cells[i].x, y: cells[i].y,
    size: 38 + Math.floor(Math.random() * 24),
    rotate: (Math.random() - 0.5) * 18,
    tapped: false,
  }));
}

// Row accent colors for ordered-grid (cycles per row)
const ROW_COLORS = [
  "#f97316", "#8b5cf6", "#ec4899", "#22c55e",
  "#0ea5e9", "#f59e0b", "#ef4444", "#14b8a6",
];

// ── Ordered grid layout (numbers, days of month) ──────────────────────────
function OrderedGridLayout({
  theme,
  onWordTap,
  active,
}: {
  theme: Theme;
  onWordTap: (w: ThemeWord) => void;
  active: ThemeWord | null;
}) {
  const cols = theme.columns ?? 5;
  const isDayTheme = theme.id === "days-of-month";

  return (
    <div className="flex-1 overflow-y-auto p-3 pb-28">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {theme.words.map((word, i) => {
          const isActive = active?.japanese === word.japanese;
          const rowColor = ROW_COLORS[Math.floor(i / cols) % ROW_COLORS.length];
          return (
            <button
              key={i}
              onClick={() => onWordTap(word)}
              className="flex flex-col items-center justify-center py-3 rounded-2xl transition-all active:scale-95 shadow-sm"
              style={isActive
                ? { backgroundColor: rowColor, color: "#fff", transform: "scale(1.08)", boxShadow: `0 4px 14px ${rowColor}66` }
                : { backgroundColor: "rgba(255,255,255,0.85)", borderColor: "#f3f4f6", border: "1px solid #f3f4f6" }
              }
            >
              <span
                className="font-black leading-none"
                style={{
                  fontSize: isDayTheme ? "1.125rem" : "1.25rem",
                  color: isActive ? "#fff" : rowColor,
                }}
              >
                {word.emoji}
              </span>
              <span
                className="mt-1 text-[10px] font-bold leading-none"
                style={{ color: isActive ? "rgba(255,255,255,0.9)" : "#6b7280" }}
              >
                {word.japanese}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Week calendar layout (weekdays) ───────────────────────────────────────
const MONTH_READINGS = [
  "", "いちがつ", "にがつ", "さんがつ", "しがつ", "ごがつ", "ろくがつ",
  "しちがつ", "はちがつ", "くがつ", "じゅうがつ", "じゅういちがつ", "じゅうにがつ",
];
const DAY_READINGS = [
  "", "ついたち", "ふつか", "みっか", "よっか", "いつか", "むいか", "なのか",
  "ようか", "ここのか", "とおか", "じゅういちにち", "じゅうににち", "じゅうさんにち",
  "じゅうよっか", "じゅうごにち", "じゅうろくにち", "じゅうしちにち", "じゅうはちにち",
  "じゅうくにち", "はつか", "にじゅういちにち", "にじゅうににち", "にじゅうさんにち",
  "にじゅうよっか", "にじゅうごにち", "にじゅうろくにち", "にじゅうしちにち",
  "にじゅうはちにち", "にじゅうくにち", "さんじゅうにち", "さんじゅういちにち",
];

function WeekCalendarLayout({
  theme,
  onWordTap,
  active,
}: {
  theme: Theme;
  onWordTap: (w: ThemeWord) => void;
  active: ThemeWord | null;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [now, setNow] = useState(() => new Date());

  // Live clock — ticks every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getWeekStart = (offset: number) => {
    const d = new Date(today);
    const dow = d.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + diff + offset * 7);
    return d;
  };

  const weekStart = getWeekStart(weekOffset);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const isToday = (d: Date) => d.getTime() === today.getTime();

  const dayWords = theme.words.slice(0, 7);
  const extraWords = theme.words.slice(7);

  const DAY_HEADERS = ["月", "火", "水", "木", "金", "土", "日"];
  const weekLabel = weekOffset === -1 ? "先週" : weekOffset === 0 ? "今週" : "来週";

  const ty = today.getFullYear();
  const tm = today.getMonth() + 1;
  const td = today.getDate();
  const todayDisplay = `${ty}年${tm}月${td}日`;
  const todayJapanese = `${ty}年${MONTH_READINGS[tm]}${DAY_READINGS[td]}`;

  const todayWord: ThemeWord = {
    emoji: "📅",
    japanese: todayJapanese,
    romaji: `${ty}nen ${MONTH_READINGS[tm]} ${DAY_READINGS[td]}`,
    english: todayDisplay,
  };

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      {/* Today's date + live clock banner */}
      <button
        onClick={() => onWordTap(todayWord)}
        className="w-full px-4 py-3 bg-white/80 border-b border-gray-100 flex items-center justify-between gap-2 active:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <span className="text-xl font-black text-gray-800">{todayDisplay}</span>
          <span className="text-sm text-gray-400 font-bold">
            （{dayWords[today.getDay() === 0 ? 6 : today.getDay() - 1].japanese}）
          </span>
        </div>
        {/* Live digital clock */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-black tabular-nums text-white text-base"
          style={{ backgroundColor: theme.activeColor }}
        >
          <span>🕐</span>
          <span>
            {now.getHours().toString().padStart(2, "0")}
            <span className="animate-pulse">:</span>
            {now.getMinutes().toString().padStart(2, "0")}
            <span className="text-xs opacity-80 ml-0.5">
              :{now.getSeconds().toString().padStart(2, "0")}
            </span>
          </span>
        </div>
      </button>

      <div className="p-3">
        {/* Week navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="flex items-center gap-1 px-4 py-2 rounded-2xl bg-white/80 text-gray-700 font-black text-sm shadow-sm active:scale-95 transition-all"
          >
            ← 先週
          </button>
          <span className="font-black text-lg text-gray-700">{weekLabel}</span>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="flex items-center gap-1 px-4 py-2 rounded-2xl bg-white/80 text-gray-700 font-black text-sm shadow-sm active:scale-95 transition-all"
          >
            来週 →
          </button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {DAY_HEADERS.map((h, i) => (
            <div
              key={h}
              className={`text-center text-xs font-black py-1 ${
                i === 5 ? "text-blue-500" : i === 6 ? "text-red-500" : "text-gray-500"
              }`}
            >
              {h}
            </div>
          ))}
          {days.map((d, i) => {
            const todayCell = isToday(d);
            const isSat = i === 5;
            const isSun = i === 6;
            const isActive = active?.japanese === dayWords[i].japanese;
            return (
              <button
                key={i}
                onClick={() => onWordTap(dayWords[i])}
                className="flex flex-col items-center justify-center py-2 rounded-2xl transition-all active:scale-95"
                style={
                  todayCell
                    ? { backgroundColor: theme.activeColor, boxShadow: `0 4px 12px ${theme.activeColor}55` }
                    : isActive
                    ? { backgroundColor: `${theme.activeColor}22`, border: `1px solid ${theme.activeColor}` }
                    : { backgroundColor: "rgba(255,255,255,0.7)" }
                }
              >
                <span
                  className="text-xl font-black leading-none"
                  style={{
                    color: todayCell ? "#fff" : isSat ? "#3b82f6" : isSun ? "#ef4444" : "#1f2937",
                  }}
                >
                  {d.getDate()}
                </span>
                <span
                  className="text-[9px] font-bold mt-0.5"
                  style={{ color: todayCell ? "rgba(255,255,255,0.7)" : "#9ca3af" }}
                >
                  {d.getMonth() + 1}/{d.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Extra vocabulary words */}
        <div className="grid grid-cols-2 gap-2">
          {extraWords.map((word, i) => {
            const isActive = active?.japanese === word.japanese;
            return (
              <button
                key={i}
                onClick={() => onWordTap(word)}
                className="flex items-center gap-2 p-3 rounded-2xl transition-all active:scale-95"
                style={
                  isActive
                    ? { backgroundColor: theme.activeColor, boxShadow: `0 4px 12px ${theme.activeColor}55` }
                    : { backgroundColor: "rgba(255,255,255,0.7)" }
                }
              >
                <span className="text-xl">{word.emoji}</span>
                <div className="text-left">
                  <p className="font-black text-sm" style={{ color: isActive ? "#fff" : "#1f2937" }}>
                    {word.japanese}
                  </p>
                  <p className="text-xs" style={{ color: isActive ? "rgba(255,255,255,0.7)" : "#9ca3af" }}>
                    {word.english}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function ThemesPage() {
  const [themeId, setThemeId] = useState(THEMES[0].id);
  const theme = THEMES.find((t) => t.id === themeId)!;

  const [placed, setPlaced] = useState<PlacedWord[]>(() => buildLayout(theme.words));
  const [active, setActive] = useState<ThemeWord | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const { speak } = useSpeech();
  const labelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const handleWordTap = useCallback((word: ThemeWord) => {
    speak(word.japanese);
    setActive(word);
    if (labelTimer.current) clearTimeout(labelTimer.current);
    labelTimer.current = setTimeout(() => setActive(null), 2200);
  }, [speak]);

  const handleScatterTap = useCallback((p: PlacedWord) => {
    handleWordTap(p.word);
    setPlaced((prev) => prev.map((i) => (i.id === p.id ? { ...i, tapped: true } : i)));
    if (tapTimers.current.has(p.id)) clearTimeout(tapTimers.current.get(p.id));
    const t = setTimeout(() => {
      setPlaced((prev) => prev.map((i) => (i.id === p.id ? { ...i, tapped: false } : i)));
      tapTimers.current.delete(p.id);
    }, 400);
    tapTimers.current.set(p.id, t);
  }, [handleWordTap]);

  const handleSentenceTap = (word: ThemeWord, idx: number) => {
    speak(word.japanese);
    setPlayingId(idx);
    setTimeout(() => setPlayingId(null), 2500);
  };

  const switchTheme = (t: Theme) => {
    setThemeId(t.id);
    setActive(null);
    setPlayingId(null);
    if (labelTimer.current) clearTimeout(labelTimer.current);
    if (!t.layout || t.layout === "scatter") {
      setPlaced(buildLayout(t.words));
    }
  };

  const isScatter = !theme.layout || theme.layout === "scatter";

  return (
    <div className={`fixed inset-0 flex flex-col bg-gradient-to-br ${theme.bg} overflow-hidden`}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div>
            <h1 className="text-xl font-black text-gray-800">{theme.icon} {theme.label}</h1>
            <p className="text-xs text-gray-400">
              {theme.isSentences ? "Tap a sentence to hear it spoken" : "Tap to hear the Japanese word"}
            </p>
          </div>
          {isScatter && (
            <button
              onClick={() => { setPlaced(buildLayout(theme.words)); setActive(null); }}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-black text-xs active:scale-95 transition-all"
            >
              <span className="text-lg">🔀</span>
              Shuffle
            </button>
          )}
        </div>

        {/* Category tabs — horizontal scroll, single row */}
        <div className="flex gap-2 px-3 pb-3 overflow-x-auto scrollbar-none">
          {THEMES.map((t) => {
            const isActive = themeId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => switchTheme(t)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-black transition-all active:scale-95"
                style={isActive
                  ? { backgroundColor: t.activeColor, color: "#fff", boxShadow: `0 4px 12px ${t.activeColor}55`, transform: "scale(1.05)" }
                  : { backgroundColor: "#f3f4f6", color: "#6b7280" }
                }
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content area ── */}
      {theme.isSentences ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 flex flex-col gap-3">
          {theme.words.map((word, idx) => {
            const isPlaying = playingId === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSentenceTap(word, idx)}
                className="w-full text-left flex items-center gap-4 px-5 py-4 rounded-3xl border-2 shadow-sm transition-all active:scale-95"
                style={{
                  backgroundColor: isPlaying ? "#fffbeb" : "#ffffff",
                  borderColor: isPlaying ? theme.activeColor : theme.borderHex,
                  boxShadow: isPlaying ? `0 4px 16px ${theme.activeColor}33` : undefined,
                }}
              >
                <span className="text-4xl flex-shrink-0">{word.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-gray-800 leading-snug">{word.japanese}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: theme.activeColor }}>{word.romaji}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{word.english}</p>
                </div>
                <span
                  className="text-2xl flex-shrink-0 transition-transform"
                  style={{ transform: isPlaying ? "scale(1.3)" : "scale(1)" }}
                >
                  🔊
                </span>
              </button>
            );
          })}
        </div>
      ) : theme.layout === "calendar" ? (
        <WeekCalendarLayout theme={theme} onWordTap={handleWordTap} active={active} />
      ) : theme.layout === "ordered-grid" ? (
        <OrderedGridLayout theme={theme} onWordTap={handleWordTap} active={active} />
      ) : (
        /* Scatter layout */
        <div className="flex-1 relative overflow-hidden">
          {placed.map((p) => (
            <button
              key={p.id}
              onClick={() => handleScatterTap(p)}
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
        </div>
      )}

      {/* ── Floating label card (scatter + grid layouts) ── */}
      {active && !theme.isSentences && (
        <div
          key={active.japanese}
          className="fixed bottom-28 left-1/2 z-50 animate-fade-in"
          style={{ transform: "translateX(-50%)" }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border-2 px-6 py-4 flex items-center gap-4 min-w-[240px]"
            style={{ borderColor: theme.borderHex }}
          >
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
  );
}
