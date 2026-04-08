"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ANIMALS } from "@/constants/animals";
import { HOME_ITEMS } from "@/constants/homeitems";
import { BODY_PARTS } from "@/constants/bodyparts";
import { useSpeech } from "@/hooks/useSpeech";
import { IDictionaryWord } from "@/types";

interface WordItem {
  emoji: string;
  imageUrl?: string;
  japanese: string;
  romaji: string;
  english: string;
}

const STATIC_WORDS: WordItem[] = [...ANIMALS, ...HOME_ITEMS, ...BODY_PARTS];

const CANVAS_RES = 600;

function pickRandom(pool: WordItem[], exclude?: WordItem): WordItem {
  const filtered = exclude ? pool.filter((w) => w.japanese !== exclude.japanese) : pool;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function dictToWordItem(w: IDictionaryWord): WordItem {
  return {
    emoji: "📖",
    imageUrl: w.example_image_url || undefined,
    japanese: w.hiragana || w.japanese_word,
    romaji: w.romaji || "",
    english: w.english_meaning || "",
  };
}

export default function WritingPage() {
  const [pool, setPool] = useState<WordItem[]>(STATIC_WORDS);
  const [word, setWord] = useState<WordItem>(() => pickRandom(STATIC_WORDS));
  const [showCongrats, setShowCongrats] = useState(false);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const { speak } = useSpeech();

  // Fetch all dictionary words and merge into pool
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dictionary?limit=500");
        if (!res.ok) return;
        const data = await res.json();
        const dictWords: WordItem[] = (data.words as IDictionaryWord[])
          .filter((w) => w.hiragana || w.japanese_word)
          .map(dictToWordItem);
        setPool([...STATIC_WORDS, ...dictWords]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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

  const getPos = (e: React.TouchEvent | React.MouseEvent): { x: number; y: number } | null => {
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
    setWord(pickRandom(pool, word));
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-6rem)]">

      {/* ── LEFT: Word Details ── */}
      <div className="md:w-2/5 w-full flex flex-col items-center justify-center gap-6 px-8 py-8 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 border-b md:border-b-0 md:border-r border-orange-100">

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
          <p className="text-5xl md:text-6xl font-black text-gray-800 leading-none tracking-tight">
            {word.japanese}
          </p>
          <p className="text-2xl md:text-3xl font-bold text-orange-500">
            {word.romaji}
          </p>
          <p className="text-lg md:text-xl text-gray-500 font-medium">
            {word.english}
          </p>
        </div>

        {/* Speaker button */}
        <button
          onClick={() => speak(word.japanese)}
          className="w-16 h-16 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center text-3xl shadow-sm hover:bg-orange-50 transition-colors active:scale-95"
          aria-label="Speak"
        >
          🔊
        </button>

        {/* Next word button */}
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-white border-2 border-orange-200 text-orange-500 font-bold text-base hover:bg-orange-50 transition-colors shadow-sm active:scale-95"
        >
          🔀 Next Word
        </button>

        <p className="text-xs text-gray-300 font-medium">
          {loading ? "Loading…" : `${pool.length} words`}
        </p>
      </div>

      {/* ── RIGHT: Canvas ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-white">
        <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">
          ✏️ Trace the word
        </p>

        <canvas
          ref={canvasRef}
          width={CANVAS_RES}
          height={CANVAS_RES}
          className="w-full max-w-[min(100%,calc(100vh-16rem))] aspect-square rounded-3xl border-2 border-orange-200 touch-none cursor-crosshair shadow-inner"
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

      {/* ── Congrats overlay ── */}
      {showCongrats && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm animate-fade-in">
          {word.imageUrl ? (
            <img
              src={word.imageUrl}
              alt={word.english}
              className="w-36 h-36 object-cover rounded-3xl shadow-lg border-4 border-white mb-4 animate-bounce"
            />
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
            <button
              onClick={() => { setShowCongrats(false); handleClear(); }}
              className="px-8 py-4 rounded-2xl bg-orange-400 hover:bg-orange-500 text-white font-bold text-base transition-colors shadow-md active:scale-95"
            >
              ✏️ Try Again
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-base transition-colors shadow-md active:scale-95"
            >
              Next Word →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
