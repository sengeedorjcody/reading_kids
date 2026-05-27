"use client";

import { useRef, useState, useEffect, useCallback } from "react";

type Tool = "pen" | "eraser" | "line" | "rect" | "circle";
type View = "draw" | "gallery";

interface SavedDrawing {
  id: string;
  dataUrl: string;
  date: string;
}

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
const LS_COLOR    = "draw_color";
const LS_DRAWINGS = "draw_saved";

function loadDrawings(): SavedDrawing[] {
  try { return JSON.parse(localStorage.getItem(LS_DRAWINGS) ?? "[]"); }
  catch { return []; }
}
function saveDrawings(list: SavedDrawing[]) {
  localStorage.setItem(LS_DRAWINGS, JSON.stringify(list));
}

function getPos(e: TouchEvent | MouseEvent, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const sx = W / rect.width, sy = H / rect.height;
  if ("touches" in e) {
    const t = (e as TouchEvent).touches[0] ?? (e as TouchEvent).changedTouches[0];
    return { x: (t.clientX - rect.left) * sx, y: (t.clientY - rect.top) * sy };
  }
  const me = e as MouseEvent;
  return { x: (me.clientX - rect.left) * sx, y: (me.clientY - rect.top) * sy };
}

// ── Gallery view ──────────────────────────────────────────────────────────────
function Gallery({ onClose }: { onClose: () => void }) {
  const [drawings, setDrawings] = useState<SavedDrawing[]>([]);
  const [preview, setPreview]   = useState<SavedDrawing | null>(null);

  useEffect(() => { setDrawings(loadDrawings()); }, []);

  const del = (id: string) => {
    const next = drawings.filter((d) => d.id !== id);
    setDrawings(next);
    saveDrawings(next);
    if (preview?.id === id) setPreview(null);
  };

  const download = (d: SavedDrawing) => {
    const a = document.createElement("a");
    a.download = `drawing-${d.id}.png`;
    a.href = d.dataUrl;
    a.click();
  };

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3"
        style={{ background: "rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <button onClick={onClose}
          className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white font-black active:scale-90">
          ←
        </button>
        <h2 className="text-white font-black text-lg flex-1">🖼️ Saved Drawings</h2>
        <span className="text-white/40 text-sm">{drawings.length} drawings</span>
      </div>

      {drawings.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="text-6xl">🎨</div>
          <p className="text-white/40 font-bold">No saved drawings yet</p>
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-2xl font-black text-white active:scale-95"
            style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}>
            Start Drawing
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {drawings.map((d) => (
              <div key={d.id} className="relative rounded-2xl overflow-hidden group"
                style={{ border: "2px solid rgba(255,255,255,0.1)", aspectRatio: "3/4" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.dataUrl} alt="drawing" className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setPreview(d)} />
                <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-between items-center"
                  style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.6))" }}>
                  <span className="text-white/70 text-[10px] font-bold">{d.date}</span>
                  <div className="flex gap-1">
                    <button onClick={() => download(d)}
                      className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-sm active:scale-90">
                      💾
                    </button>
                    <button onClick={() => del(d.id)}
                      className="w-7 h-7 rounded-lg bg-red-500/40 flex items-center justify-center text-sm active:scale-90">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full-screen preview */}
      {preview && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80"
          onClick={() => setPreview(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview.dataUrl} alt="preview"
            className="max-w-full max-h-[80dvh] rounded-2xl shadow-2xl object-contain" />
          <div className="flex gap-3 mt-4">
            <button onClick={(e) => { e.stopPropagation(); download(preview); }}
              className="px-5 py-2.5 rounded-2xl font-black text-white active:scale-95"
              style={{ background: "rgba(34,197,94,0.4)", border: "1px solid rgba(34,197,94,0.6)" }}>
              💾 Download
            </button>
            <button onClick={(e) => { e.stopPropagation(); del(preview.id); }}
              className="px-5 py-2.5 rounded-2xl font-black text-white active:scale-95"
              style={{ background: "rgba(239,68,68,0.4)", border: "1px solid rgba(239,68,68,0.6)" }}>
              🗑️ Delete
            </button>
          </div>
          <p className="text-white/40 text-xs mt-3">Tap anywhere to close</p>
        </div>
      )}
    </div>
  );
}

// ── Main draw page ─────────────────────────────────────────────────────────────
export default function DrawPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView]           = useState<View>("draw");
  const [tool, setTool]           = useState<Tool>("pen");
  const [color, setColor]         = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem(LS_COLOR) ?? "#1e293b";
    return "#1e293b";
  });
  const [size, setSize]     = useState(7);
  const [showColors, setShowColors] = useState(false);
  const [saved, setSaved]   = useState(false); // flash feedback

  const isDrawing = useRef(false);
  const lastPos   = useRef<{ x: number; y: number } | null>(null);
  const startPos  = useRef<{ x: number; y: number } | null>(null);
  const snapshot  = useRef<ImageData | null>(null);

  // Persist color whenever it changes
  useEffect(() => { localStorage.setItem(LS_COLOR, color); }, [color]);

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
    if (["line","rect","circle"].includes(tool as string)) {
      snapshot.current = ctx()?.getImageData(0, 0, W, H) ?? null;
    }
  }, [tool, ctx]);

  const moveDraw = useCallback((e: TouchEvent | MouseEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = ctx();
    if (!c) return;
    const pos = getPos(e, canvas);

    if (tool === "pen" || tool === "eraser") {
      c.save();
      c.lineCap     = "round";
      c.lineJoin    = "round";
      c.lineWidth   = tool === "eraser" ? size * 3 : size;
      c.strokeStyle = tool === "eraser" ? "#fff9f0" : color;
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
        c.strokeRect(startPos.current.x, startPos.current.y,
          pos.x - startPos.current.x, pos.y - startPos.current.y);
      } else if (tool === "circle") {
        const rx = (pos.x - startPos.current.x) / 2;
        const ry = (pos.y - startPos.current.y) / 2;
        c.beginPath();
        c.ellipse(startPos.current.x + rx, startPos.current.y + ry,
          Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
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

  // Save to gallery (localStorage)
  const saveToGallery = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    const now = new Date();
    const date = `${now.getMonth()+1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`;
    const newDrawing: SavedDrawing = { id: Date.now().toString(), dataUrl, date };
    const existing = loadDrawings();
    saveDrawings([newDrawing, ...existing]);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (view === "gallery") return <Gallery onClose={() => setView("draw")} />;

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100dvh" }}>

      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 overflow-x-auto scrollbar-none"
        style={{ background: "rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>

        {/* Tools */}
        {TOOLS.map((t) => (
          <button key={t.id} onClick={() => setTool(t.id)}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-90 ${
              tool === t.id ? "bg-white/25 text-white" : "text-white/40 hover:text-white/70"
            }`}>
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
            }`}>
            <div className="rounded-full bg-white/80"
              style={{ width: Math.min(s * 1.5, 24), height: Math.min(s * 1.5, 24) }} />
          </button>
        ))}

        <div className="w-px h-8 bg-white/20 flex-shrink-0 mx-1" />

        {/* Color swatch */}
        <button onClick={() => setShowColors((v) => !v)}
          className={`flex-shrink-0 w-10 h-10 rounded-full border-4 transition-all active:scale-90 ${showColors ? "border-white scale-110" : "border-white/30"}`}
          style={{ backgroundColor: color }} />

        <div className="w-px h-8 bg-white/20 flex-shrink-0 mx-1" />

        {/* Actions */}
        <button onClick={clear}
          className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black text-red-300 active:scale-90"
          style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}>
          🗑️ Clear
        </button>
        <button onClick={saveToGallery}
          className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black active:scale-90 transition-all ${
            saved ? "text-green-200" : "text-green-300"
          }`}
          style={{ background: saved ? "rgba(34,197,94,0.4)" : "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)" }}>
          {saved ? "✅ Saved!" : "💾 Save"}
        </button>
        <button onClick={() => setView("gallery")}
          className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black text-purple-300 active:scale-90"
          style={{ background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.4)" }}>
          🖼️ Gallery
        </button>
      </div>

      {/* ── Color palette ── */}
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
              }} />
          ))}
        </div>
      )}

      {/* ── Canvas ── */}
      <div className="flex-1 overflow-auto">
        <canvas ref={canvasRef} width={W} height={H}
          className="block touch-none"
          style={{ width: "100%", maxWidth: "100%", cursor: tool === "eraser" ? "cell" : "crosshair" }} />
      </div>
    </div>
  );
}
