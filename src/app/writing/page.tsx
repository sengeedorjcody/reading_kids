"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ANIMALS } from "@/constants/animals";
import { HOME_ITEMS } from "@/constants/homeitems";
import { BODY_PARTS } from "@/constants/bodyparts";
import { THEMES } from "@/constants/themes";
import { useSpeech } from "@/hooks/useSpeech";
import { IDictionaryWord } from "@/types";

interface WordItem {
  emoji: string;
  imageUrl?: string;
  japanese: string;
  romaji: string;
  english: string;
}

type Category = "all" | "hiragana" | "katakana" | "kanji";

// ── Character detectors ───────────────────────────────────────────────────
const isHiragana  = (s: string) => /[\u3041-\u3096]/.test(s);
const isKatakana  = (s: string) => /[\u30A1-\u30FC]/.test(s);
const isKanji     = (s: string) => /[\u4E00-\u9FFF]/.test(s);

const THEME_WORDS: WordItem[] = THEMES.flatMap((t) => t.words);
const STATIC_WORDS: WordItem[] = [...ANIMALS, ...HOME_ITEMS, ...BODY_PARTS, ...THEME_WORDS];

const CANVAS_RES = 600;

function pickRandom(pool: WordItem[], exclude?: WordItem): WordItem {
  const filtered = exclude ? pool.filter((w) => w.japanese !== exclude.japanese) : pool;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function dictToWordItem(w: IDictionaryWord): WordItem {
  return {
    emoji: "📖",
    imageUrl: w.example_image_url || undefined,
    japanese: w.japanese_word,
    romaji: w.romaji || "",
    english: w.english_meaning || "",
  };
}

const CATEGORY_CONFIG: Record<Category, { label: string; jp: string; color: string; icon: string }> = {
  all:      { label: "All",      jp: "すべて",   color: "#6b7280", icon: "📝" },
  hiragana: { label: "Hiragana", jp: "ひらがな", color: "#ec4899", icon: "あ" },
  katakana: { label: "Katakana", jp: "カタカナ", color: "#3b82f6", icon: "ア" },
  kanji:    { label: "Kanji",    jp: "かんじ",   color: "#f97316", icon: "字" },
};

export default function WritingPage() {
  const [allPool,  setAllPool]  = useState<WordItem[]>(STATIC_WORDS);
  const [category, setCategory] = useState<Category>("all");
  const [word,     setWord]     = useState<WordItem>(() => pickRandom(STATIC_WORDS));
  const [showCongrats, setShowCongrats] = useState(false);
  const [loading, setLoading]   = useState(true);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const isDrawing  = useRef(false);
  const lastPos    = useRef<{ x: number; y: number } | null>(null);
  const { speak }  = useSpeech();

  // Filtered pool based on category
  const pool = (() => {
    if (category === "hiragana") return allPool.filter(w => isHiragana(w.japanese) && !isKanji(w.japanese));
    if (category === "katakana") return allPool.filter(w => isKatakana(w.japanese));
    if (category === "kanji")    return allPool.filter(w => isKanji(w.japanese));
    return allPool;
  })();

  // Fetch all dictionary words and merge into pool
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dictionary?limit=500");
        if (!res.ok) return;
        const data = await res.json();
        const dictWords: WordItem[] = (data.words as IDictionaryWord[])
          .filter((w) => w.japanese_word)
          .map(dictToWordItem);
        setAllPool([...STATIC_WORDS, ...dictWords]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // When category changes, pick a new word from the new filtered pool
  useEffect(() => {
    if (pool.length > 0) {
      setWord(pickRandom(pool));
      handleClear();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = CANVAS_RES;

    ctx.fillStyle = "#fff9f0";
    ctx.fillRect(0, 0, s, s);

    ctx.save();
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = "rgba(249,115,22,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s / 2, 0); ctx.lineTo(s / 2, s);
    ctx.moveTo(0, s / 2); ctx.lineTo(s, s / 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(249,115,22,0.12)";
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(s, s);
    ctx.moveTo(s, 0); ctx.lineTo(0, s);
    ctx.stroke();
    ctx.restore();

    const maxWidth = s * 0.9;
    let fontSize = s * 0.6;
    ctx.save();
    ctx.font = `bold ${fontSize}px serif`;
    while (ctx.measureText(word.japanese).width > maxWidth && fontSize > s * 0.08) {
      fontSize -= s * 0.02;
      ctx.font = `bold ${fontSize}px serif`;
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillText(word.japanese, s / 2, s / 2);
    ctx.restore();
  }, [word]);

  useEffect(() => { drawGuide(); }, [drawGuide]);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_RES / rect.width;
    const scaleY = CANVAS_RES / rect.height;
    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    if (!pos || !lastPos.current) { lastPos.current = pos; return; }

    let lineWidth = 6;
    if ("pressure" in (e.nativeEvent as PointerEvent)) {
      const p = (e.nativeEvent as PointerEvent).pressure;
      if (p > 0) lineWidth = Math.max(3, p * 14);
    }

    ctx.save();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.restore();
    lastPos.current = pos;
  };

  const endDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isDrawing.current = false;
    lastPos.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_RES, CANVAS_RES);
    drawGuide();
  };

  const handleNext = () => {
    setShowCongrats(false);
    if (pool.length > 0) setWord(pickRandom(pool, word));
  };

  const cfg = CATEGORY_CONFIG[category];
  const kanjiCount = allPool.filter(w => isKanji(w.japanese)).length;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">

      {/* ── Category tabs ── */}
      <div className="flex-shrink-0 flex gap-2 px-4 pt-3 pb-2 bg-white border-b border-gray-100 overflow-x-auto scrollbar-none">
        {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => {
          const c = CATEGORY_CONFIG[cat];
          const isActive = category === cat;
          const count = (() => {
            if (cat === "hiragana") return allPool.filter(w => isHiragana(w.japanese) && !isKanji(w.japanese)).length;
            if (cat === "katakana") return allPool.filter(w => isKatakana(w.japanese)).length;
            if (cat === "kanji")    return kanjiCount;
            return allPool.length;
          })();
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm transition-all active:scale-95"
              style={isActive
                ? { backgroundColor: c.color, color: "#fff", boxShadow: `0 4px 10px ${c.color}44` }
                : { backgroundColor: "#f3f4f6", color: "#6b7280" }
              }
            >
              <span className="text-base">{c.icon}</span>
              <span>{c.jp}</span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "#e5e7eb", color: isActive ? "#fff" : "#9ca3af" }}
              >
                {loading ? "…" : count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0">

        {/* LEFT: Word details */}
        <div className="md:w-2/5 w-full flex flex-col items-center justify-center gap-5 px-8 py-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 border-b md:border-b-0 md:border-r border-orange-100">

          {/* Category badge */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black"
            style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}
          >
            <span>{cfg.icon}</span>
            <span>{cfg.jp} · {cfg.label}</span>
          </div>

          {/* Image or emoji */}
          {word.imageUrl ? (
            <img
              src={word.imageUrl}
              alt={word.english}
              className="w-40 h-40 md:w-52 md:h-52 object-cover rounded-3xl shadow-lg border-4 border-white"
            />
          ) : (
            <div className="text-[7rem] md:text-[9rem] leading-none select-none drop-shadow-sm">
              {word.emoji}
            </div>
          )}

          {/* Word info */}
          <div className="text-center flex flex-col gap-2">
            <p
              className="text-5xl md:text-6xl font-black text-gray-800 leading-none tracking-tight"
              style={{ fontFamily: "var(--font-noto-serif-jp, serif)" }}
            >
              {word.japanese}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-orange-500">{word.romaji}</p>
            <p className="text-lg md:text-xl text-gray-500 font-medium">{word.english}</p>

            {/* Character type badges */}
            <div className="flex gap-1.5 justify-center mt-1">
              {isHiragana(word.japanese)  && <span className="px-2 py-0.5 rounded-lg bg-pink-100 text-pink-600 text-xs font-black">ひらがな</span>}
              {isKatakana(word.japanese)  && <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-600 text-xs font-black">カタカナ</span>}
              {isKanji(word.japanese)     && <span className="px-2 py-0.5 rounded-lg bg-orange-100 text-orange-600 text-xs font-black">漢字</span>}
            </div>
          </div>

          {/* Speaker + Next */}
          <div className="flex gap-3">
            <button
              onClick={() => speak(word.japanese)}
              className="w-14 h-14 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center text-2xl shadow-sm hover:bg-orange-50 transition-colors active:scale-95"
            >
              🔊
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border-2 border-orange-200 text-orange-500 font-bold text-base hover:bg-orange-50 transition-colors shadow-sm active:scale-95"
            >
              🔀 Next
            </button>
          </div>

          <p className="text-xs text-gray-300 font-medium">
            {loading ? "Loading…" : `${pool.length} words in this category`}
          </p>
        </div>

        {/* RIGHT: Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-white">
          <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">
            ✏️ Trace the word
          </p>

          <canvas
            ref={canvasRef}
            width={CANVAS_RES}
            height={CANVAS_RES}
            className="w-full max-w-[min(100%,calc(100vh-20rem))] aspect-square rounded-3xl border-2 border-orange-200 touch-none cursor-crosshair shadow-inner"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />

          <div className="flex gap-3">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm transition-colors active:scale-95"
            >
              🗑️ Clear
            </button>
            <button
              onClick={() => setShowCongrats(true)}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors shadow-md active:scale-95"
            >
              ✓ Done
            </button>
          </div>
        </div>
      </div>

      {/* ── Congrats overlay ── */}
      {showCongrats && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm animate-fade-in">
          {word.imageUrl ? (
            <img src={word.imageUrl} alt={word.english}
              className="w-36 h-36 object-cover rounded-3xl shadow-lg border-4 border-white mb-4 animate-bounce" />
          ) : (
            <div className="text-[8rem] leading-none mb-2 animate-bounce">{word.emoji}</div>
          )}
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-4xl font-black text-green-500 mb-1">よくできました！</p>
          <p className="text-xl font-bold text-gray-400 mb-6">Great job writing!</p>
          <div className="text-5xl font-black text-gray-800 mb-1">{word.japanese}</div>
          <div className="text-2xl text-orange-500 font-bold mb-1">{word.romaji}</div>
          <div className="text-lg text-gray-400 font-medium mb-10">{word.english}</div>
          <div className="flex gap-4">
            <button onClick={() => { setShowCongrats(false); handleClear(); }}
              className="px-8 py-4 rounded-2xl bg-orange-400 hover:bg-orange-500 text-white font-bold text-base transition-colors shadow-md active:scale-95">
              ✏️ Try Again
            </button>
            <button onClick={handleNext}
              className="px-8 py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-base transition-colors shadow-md active:scale-95">
              Next Word →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
