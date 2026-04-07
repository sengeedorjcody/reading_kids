"use client";

import { useEffect, useRef, useCallback } from "react";

interface StrokeOrderModalProps {
  char: string;
  romaji: string;
  onClose: () => void;
}

const CANVAS_SIZE = 300;

export default function StrokeOrderModal({ char, romaji, onClose }: StrokeOrderModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Draw the guide grid and faint character on the canvas
  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = CANVAS_SIZE;

    // Background
    ctx.fillStyle = "#fff9f0";
    ctx.fillRect(0, 0, s, s);

    // Center cross guides (dashed orange)
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "rgba(249,115,22,0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(s / 2, 0); ctx.lineTo(s / 2, s);
    ctx.moveTo(0, s / 2); ctx.lineTo(s, s / 2);
    ctx.stroke();

    // Diagonal guides
    ctx.strokeStyle = "rgba(249,115,22,0.15)";
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(s, s);
    ctx.moveTo(s, 0); ctx.lineTo(0, s);
    ctx.stroke();
    ctx.restore();

    // Faint ghost character in the center
    ctx.save();
    ctx.font = `bold ${s * 0.7}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(0,0,0,0.07)";
    ctx.fillText(char, s / 2, s / 2);
    ctx.restore();
  }, [char]);

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

    // Detect Apple Pencil force if available (PointerEvent)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">

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
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-2xl bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors text-lg font-black shadow-sm border border-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Drawing canvas */}
        <div className="flex flex-col items-center gap-4 px-6 py-6">
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

          <p className="text-xs text-center text-gray-400">
            Trace the faint character using your pencil or finger
          </p>

          {/* Action buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={handleClear}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm transition-colors active:scale-95"
            >
              🗑️ Clear
            </button>
            <a
              href={`https://jisho.org/search/${encodeURIComponent(char)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-orange-400 hover:bg-orange-500 text-white font-bold text-sm transition-colors shadow-md active:scale-95"
            >
              📖 Stroke Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
