"use client";

import { useRef, useState, useEffect, useCallback } from "react";

type Tool = "pen" | "eraser" | "line" | "rect" | "circle";

const COLORS = [
  "#1e293b","#ffffff","#ef4444","#f97316","#f59e0b",
  "#84cc16","#22c55e","#06b6d4","#3b82f6","#6366f1",
  "#8b5cf6","#ec4899","#f43f5e","#94a3b8","#713f12",
];

const SIZES = [3, 7, 14, 28];

const TOOLS: { id: Tool; icon: string; label: string }[] = [
  { id: "pen",    icon: "✏️", label: "Pen" },
  { id: "eraser", icon: "🧽", label: "Eraser" },
  { id: "line",   icon: "╱",  label: "Line" },
  { id: "rect",   icon: "▭",  label: "Rect" },
  { id: "circle", icon: "○",  label: "Circle" },
];

const W = 1080, H = 1440;

function getPos(e: TouchEvent | MouseEvent, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const sx = W / rect.width;
  const sy = H / rect.height;
  if ("touches" in e) {
    const t = (e as TouchEvent).touches[0] ?? (e as TouchEvent).changedTouches[0];
    return { x: (t.clientX - rect.left) * sx, y: (t.clientY - rect.top) * sy };
  }
  const me = e as MouseEvent;
  return { x: (me.clientX - rect.left) * sx, y: (me.clientY - rect.top) * sy };
}

export default function DrawPage() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const [tool, setTool]       = useState<Tool>("pen");
  const [color, setColor]     = useState("#1e293b");
  const [size, setSize]       = useState(7);
  const [showColors, setShowColors] = useState(false);

  const isDrawing  = useRef(false);
  const lastPos    = useRef<{ x: number; y: number } | null>(null);
  const startPos   = useRef<{ x: number; y: number } | null>(null);
  const snapshot   = useRef<ImageData | null>(null);

  // Init white canvas
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff9f0";
    ctx.fillRect(0, 0, W, H);
  }, []);

  const ctx = useCallback(() => canvasRef.current?.getContext("2d") ?? null, []);

  const startDraw = useCallback((e: TouchEvent | MouseEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas);
    isDrawing.current = true;
    lastPos.current   = pos;
    startPos.current  = pos;
    if (tool === "line" || tool === "rect" || tool === "circle") {
      snapshot.current = ctx()?.getImageData(0, 0, W, H) ?? null;
    }
  }, [tool, ctx]);

  const moveDraw = useCallback((e: TouchEvent | MouseEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c  = ctx();
    if (!c) return;
    const pos = getPos(e, canvas);

    if (tool === "pen" || tool === "eraser") {
      c.save();
      c.lineCap     = "round";
      c.lineJoin    = "round";
      c.lineWidth   = tool === "eraser" ? size * 3 : size;
      c.strokeStyle = tool === "eraser" ? "#fff9f0" : color;
      if (tool === "eraser") c.globalCompositeOperation = "source-over";
      c.beginPath();
      c.moveTo(lastPos.current!.x, lastPos.current!.y);
      c.lineTo(pos.x, pos.y);
      c.stroke();
      c.restore();
      lastPos.current = pos;

    } else if (snapshot.current && startPos.current) {
      c.putImageData(snapshot.current, 0, 0);
      c.save();
      c.strokeStyle = color;
      c.lineWidth   = size;
      c.lineCap     = "round";

      if (tool === "line") {
        c.beginPath();
        c.moveTo(startPos.current.x, startPos.current.y);
        c.lineTo(pos.x, pos.y);
        c.stroke();
      } else if (tool === "rect") {
        c.strokeRect(
          startPos.current.x, startPos.current.y,
          pos.x - startPos.current.x, pos.y - startPos.current.y,
        );
      } else if (tool === "circle") {
        const rx = (pos.x - startPos.current.x) / 2;
        const ry = (pos.y - startPos.current.y) / 2;
        c.beginPath();
        c.ellipse(
          startPos.current.x + rx, startPos.current.y + ry,
          Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2,
        );
        c.stroke();
      }
      c.restore();
    }
  }, [tool, color, size, ctx]);

  const endDraw = useCallback((e: TouchEvent | MouseEvent) => {
    e.preventDefault();
    isDrawing.current = false;
    lastPos.current   = null;
    snapshot.current  = null;
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("mousedown",  startDraw);
    el.addEventListener("mousemove",  moveDraw);
    el.addEventListener("mouseup",    endDraw);
    el.addEventListener("mouseleave", endDraw);
    el.addEventListener("touchstart", startDraw, { passive: false });
    el.addEventListener("touchmove",  moveDraw,  { passive: false });
    el.addEventListener("touchend",   endDraw,   { passive: false });
    return () => {
      el.removeEventListener("mousedown",  startDraw);
      el.removeEventListener("mousemove",  moveDraw);
      el.removeEventListener("mouseup",    endDraw);
      el.removeEventListener("mouseleave", endDraw);
      el.removeEventListener("touchstart", startDraw);
      el.removeEventListener("touchmove",  moveDraw);
      el.removeEventListener("touchend",   endDraw);
    };
  }, [startDraw, moveDraw, endDraw]);

  const clear = () => {
    const c = ctx();
    if (!c) return;
    c.fillStyle = "#fff9f0";
    c.fillRect(0, 0, W, H);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `drawing-${Date.now()}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100dvh" }}>

      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 overflow-x-auto scrollbar-none"
        style={{ background: "rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>

        {/* Tools */}
        {TOOLS.map((t) => (
          <button key={t.id} onClick={() => setTool(t.id)}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-90 ${
              tool === t.id
                ? "bg-white/25 text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <span className="text-xl leading-none">{t.icon}</span>
            {t.label}
          </button>
        ))}

        <div className="w-px h-8 bg-white/20 flex-shrink-0 mx-1" />

        {/* Brush sizes */}
        {SIZES.map((s) => (
          <button key={s} onClick={() => setSize(s)}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              size === s ? "bg-white/20 ring-2 ring-white/50" : ""
            }`}
          >
            <div className="rounded-full bg-white/80"
              style={{ width: Math.min(s * 1.5, 24), height: Math.min(s * 1.5, 24) }} />
          </button>
        ))}

        <div className="w-px h-8 bg-white/20 flex-shrink-0 mx-1" />

        {/* Color swatch + toggle */}
        <button onClick={() => setShowColors((v) => !v)}
          className={`flex-shrink-0 w-10 h-10 rounded-full border-4 transition-all active:scale-90 ${showColors ? "border-white scale-110" : "border-white/30"}`}
          style={{ backgroundColor: color }}
        />

        <div className="w-px h-8 bg-white/20 flex-shrink-0 mx-1" />

        {/* Actions */}
        <button onClick={clear}
          className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black text-red-300 active:scale-90 transition-all"
          style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}>
          🗑️ Clear
        </button>
        <button onClick={save}
          className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black text-green-300 active:scale-90 transition-all"
          style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)" }}>
          💾 Save
        </button>
      </div>

      {/* ── Color palette (expandable) ── */}
      {showColors && (
        <div className="flex-shrink-0 flex flex-wrap gap-2 px-3 py-2"
          style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {COLORS.map((c) => (
            <button key={c} onClick={() => { setColor(c); setShowColors(false); }}
              className={`w-9 h-9 rounded-full transition-all active:scale-90 ${
                color === c ? "ring-2 ring-white ring-offset-1 ring-offset-transparent scale-110" : ""
              }`}
              style={{
                backgroundColor: c,
                border: c === "#ffffff" || c === "#fff9f0" ? "2px solid rgba(255,255,255,0.4)" : "none",
              }}
            />
          ))}
        </div>
      )}

      {/* ── Canvas ── */}
      <div className="flex-1 overflow-auto">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block touch-none"
          style={{
            width: "100%",
            maxWidth: "100%",
            cursor: tool === "eraser" ? "cell" : "crosshair",
          }}
        />
      </div>
    </div>
  );
}
