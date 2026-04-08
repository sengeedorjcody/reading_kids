"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ANIMALS } from "@/constants/animals";
import { HOME_ITEMS } from "@/constants/homeitems";
import { BODY_PARTS } from "@/constants/bodyparts";

interface WordItem {
  emoji: string;
  japanese: string;
  romaji: string;
  english: string;
}

const ALL_WORDS: WordItem[] = [
  ...ANIMALS,
  ...HOME_ITEMS,
  ...BODY_PARTS,
];

const CANVAS_SIZE = 320;

function getRandomWord(exclude?: WordItem): WordItem {
  const pool = exclude ? ALL_WORDS.filter((w) => w.japanese !== exclude.japanese) : ALL_WORDS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function WritingPage() {
  const [word, setWord] = useState<WordItem>(() => getRandomWord());
  const [showCongrats, setShowCongrats] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = CANVAS_SIZE;

    ctx.fillStyle = "#fff9f0";
    ctx.fillRect(0, 0, s, s);

    // Grid guides
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "rgba(249,115,22,0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(s / 2, 0); ctx.lineTo(s / 2, s);
    ctx.moveTo(0, s / 2); ctx.lineTo(s, s / 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(249,115,22,0.15)";
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(s, s);
    ctx.moveTo(s, 0); ctx.lineTo(0, s);
    ctx.stroke();
    ctx.restore();

    // Ghost word
    const fontSize = word.japanese.length <= 2 ? s * 0.55 : word.japanese.length <= 4 ? s * 0.3 : s * 0.2;
    ctx.save();
    ctx.font = `bold ${fontSize}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(0,0,0,0.07)";
    ctx.fillText(word.japanese, s / 2, s / 2);
    ctx.restore();
  }, [word]);

  useEffect(() => {
    drawGuide();
  }, [drawGuide]);

  const getPos = (e: React.TouchEvent | React.MouseEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
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
    if (!pos || !lastPos.current) {
      lastPos.current = pos;
      return;
    }

    let lineWidth = 4;
    if ("pressure" in (e.nativeEvent as PointerEvent)) {
      const pressure = (e.nativeEvent as PointerEvent).pressure;
      if (pressure > 0) lineWidth = Math.max(2, pressure * 10);
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
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawGuide();
  };

  const handleNext = () => {
    setShowCongrats(false);
    setWord(getRandomWord(word));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-800 mb-1">かいてみよう！</h1>
        <p className="text-gray-400 font-medium">Word Writing Practice ✏️</p>
      </div>

      {/* Word Card */}
      <div className="relative bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden mb-6">
        {/* Emoji + word info */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-6 flex items-center gap-5 border-b border-orange-100">
          <div className="text-6xl">{word.emoji}</div>
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-black text-gray-800 leading-none">{word.japanese}</span>
            <span className="text-xl font-bold text-orange-500">{word.romaji}</span>
            <span className="text-base text-gray-500 font-medium">{word.english}</span>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex flex-col items-center gap-4 px-6 py-6">
          <p className="text-sm text-gray-400 font-medium">Trace the word below ✏️</p>
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="w-full rounded-2xl border-2 border-orange-200 touch-none cursor-crosshair shadow-inner"
            style={{ maxWidth: CANVAS_SIZE }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />

          {/* Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={handleClear}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm transition-colors active:scale-95"
            >
              🗑️ Clear
            </button>
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-blue-400 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-md active:scale-95"
            >
              🔀 Next Word
            </button>
            <button
              onClick={() => setShowCongrats(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors shadow-md active:scale-95"
            >
              ✓ Done
            </button>
          </div>
        </div>

        {/* Congrats overlay */}
        {showCongrats && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/97 rounded-3xl animate-fade-in">
            <div className="text-8xl mb-4 animate-bounce">{word.emoji}</div>
            <div className="text-7xl mb-2">🎉</div>
            <p className="text-3xl font-black text-green-500 mb-1">よくできました！</p>
            <p className="text-lg font-bold text-gray-500 mb-4">Great job writing!</p>
            <div className="text-4xl font-black text-gray-800 mb-1">{word.japanese}</div>
            <div className="text-xl text-orange-500 font-bold mb-1">{word.romaji}</div>
            <div className="text-base text-gray-500 font-medium mb-8">{word.english}</div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCongrats(false); handleClear(); }}
                className="px-6 py-3 rounded-2xl bg-orange-400 hover:bg-orange-500 text-white font-bold transition-colors shadow-md active:scale-95"
              >
                ✏️ Try Again
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold transition-colors shadow-md active:scale-95"
              >
                Next Word →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Word count hint */}
      <p className="text-center text-xs text-gray-400">
        {ALL_WORDS.length} words in the dictionary
      </p>
    </div>
  );
}
