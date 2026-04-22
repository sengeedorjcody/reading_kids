"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface StrokeOrderModalProps {
  char: string;
  romaji: string;
  onClose: () => void;
}

const CS = 300; // canvas resolution

// ── Single practice canvas ─────────────────────────────────────────────────
function PracticeCanvas({ char, index }: { char: string; index: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos    = useRef<{ x: number; y: number } | null>(null);

  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff9f0";
    ctx.fillRect(0, 0, CS, CS);
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "rgba(249,115,22,0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(CS / 2, 0);   ctx.lineTo(CS / 2, CS);
    ctx.moveTo(0, CS / 2);   ctx.lineTo(CS, CS / 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(249,115,22,0.15)";
    ctx.beginPath();
    ctx.moveTo(0, 0);  ctx.lineTo(CS, CS);
    ctx.moveTo(CS, 0); ctx.lineTo(0, CS);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.font = `bold ${CS * 0.7}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(0,0,0,0.07)";
    ctx.fillText(char, CS / 2, CS / 2);
    ctx.restore();
  }, [char]);

  useEffect(() => { drawGuide(); }, [drawGuide]);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const sx = CS / rect.width;
    const sy = CS / rect.height;
    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * sx, y: (t.clientY - rect.top) * sy };
    }
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    if (!pos || !lastPos.current) { lastPos.current = pos; return; }
    let lw = 4;
    if ("pressure" in (e.nativeEvent as PointerEvent)) {
      const p = (e.nativeEvent as PointerEvent).pressure;
      if (p > 0) lw = Math.max(2, p * 10);
    }
    ctx.save();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = lw;
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

  const clear = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, CS, CS);
    drawGuide();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-black text-orange-400 uppercase tracking-wide">
        練習 {index + 1}
      </span>
      <canvas
        ref={canvasRef}
        width={CS}
        height={CS}
        className="w-full rounded-2xl border-2 border-orange-200 touch-none cursor-crosshair shadow-inner"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      <button
        onClick={clear}
        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold text-xs transition-colors active:scale-95"
      >
        🗑️ Clear
      </button>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
export default function StrokeOrderModal({ char, romaji, onClose }: StrokeOrderModalProps) {
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel — sm: narrow, md+: wide 3-column */}
      <div className="relative z-10 w-full max-w-sm md:max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-orange-100 bg-gradient-to-r from-yellow-50 to-orange-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white border-2 border-orange-200 flex items-center justify-center shadow-sm">
              <span className="text-3xl font-black text-gray-800">{char}</span>
            </div>
            <div>
              <p className="text-2xl font-black text-orange-500">{romaji}</p>
              <p className="text-sm text-gray-400">Draw to practice ✏️</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <a
              href={`https://jisho.org/search/${encodeURIComponent(char)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-2xl bg-orange-400 hover:bg-orange-500 text-white font-bold text-xs transition-colors shadow-md active:scale-95"
            >
              📖 Stroke Guide
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors text-lg font-black shadow-sm border border-gray-100"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Canvas area */}
        <div className="px-6 py-6">
          {/* Mobile: 1 canvas */}
          <div className="md:hidden flex flex-col gap-4">
            <PracticeCanvas char={char} index={0} />
            <p className="text-xs text-center text-gray-400">
              Trace the faint character using your pencil or finger
            </p>
          </div>

          {/* Tablet / Desktop: 3 canvases side-by-side */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <PracticeCanvas key={i} char={char} index={i} />
            ))}
          </div>

          {/* Done button */}
          <div className="flex justify-center mt-5">
            <button
              onClick={() => setShowCongrats(true)}
              className="flex items-center justify-center gap-2 py-3 px-10 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors shadow-md active:scale-95"
            >
              ✓ Done
            </button>
          </div>
        </div>

        {/* Congrats overlay */}
        {showCongrats && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 rounded-3xl animate-fade-in">
            <div className="text-7xl mb-4 animate-bounce">🎉</div>
            <p className="text-3xl font-black text-green-500 mb-2">よくできました！</p>
            <p className="text-lg font-bold text-gray-500 mb-6">Great job!</p>
            <div className="text-5xl font-black text-gray-800 mb-1">{char}</div>
            <div className="text-xl text-orange-500 font-bold mb-8">{romaji}</div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCongrats(false)}
                className="px-6 py-3 rounded-2xl bg-orange-400 hover:bg-orange-500 text-white font-bold transition-colors shadow-md active:scale-95"
              >
                ✏️ Try Again
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold transition-colors shadow-md active:scale-95"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
