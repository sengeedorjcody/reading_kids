"use client";

import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

type Tool = "pen" | "eraser" | "fill" | "line" | "rect" | "circle" | "pan";
type View = "draw" | "gallery";

interface SavedDrawing {
  id: string;
  dataUrl: string;
  date: string;
}

// ── Color & size constants ────────────────────────────────────────────────────
const COLORS = [
  "#1e293b",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#94a3b8",
  "#713f12",
  "#fbbf24",
  "#a3e635",
  "#34d399",
  "#38bdf8",
  "#f0abfc",
];
const SIZES = [3, 7, 14, 28];
const TOOLS: { id: Tool; icon: string; label: string }[] = [
  { id: "pan", icon: "✋", label: "Pan" },
  { id: "pen", icon: "✏️", label: "Pen" },
  { id: "eraser", icon: "🧽", label: "Eraser" },
  { id: "fill", icon: "🪣", label: "Fill" },
  { id: "line", icon: "╱", label: "Line" },
  { id: "rect", icon: "▭", label: "Rect" },
  { id: "circle", icon: "○", label: "Circle" },
];

const W = 1080,
  H = 1440;
const LS_COLOR = "draw_color";
const LS_DRAWINGS = "draw_saved";

// ── Coloring templates ────────────────────────────────────────────────────────
// Image-based Kuromi templates (files go in /public/templates/)
const KUROMI_TEMPLATES = [
  {
    id: "kuromi1",
    name: "クルミ1",
    emoji: "🍰",
    src: "/templates/kuromi1.jpeg",
  },
  {
    id: "kuromi2",
    name: "クルミ2",
    emoji: "🏖️",
    src: "/templates/kuromi2.jpeg",
  },
  {
    id: "kuromi3",
    name: "クルミ3",
    emoji: "💜",
    src: "/templates/kuromi3.jpeg",
  },
  {
    id: "kuromi4",
    name: "クルミ4",
    emoji: "⭐",
    src: "/templates/kuromi4.jpeg",
  },
  {
    id: "kuromi5",
    name: "クルミ5",
    emoji: "🎃",
    src: "/templates/kuromi5.jpeg",
  },
];

const TEMPLATES = [
  {
    id: "cat",
    name: "ねこ",
    emoji: "🐱",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480">
<rect width="360" height="480" fill="white"/>
<path d="M75 175 L95 100 L140 155" fill="white" stroke="#111" stroke-width="3" stroke-linejoin="round"/>
<path d="M220 155 L265 100 L285 175" fill="white" stroke="#111" stroke-width="3" stroke-linejoin="round"/>
<path d="M85 168 L100 112 L130 158" fill="white" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M230 158 L260 112 L275 168" fill="white" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/>
<circle cx="180" cy="215" r="120" fill="white" stroke="#111" stroke-width="3"/>
<circle cx="143" cy="200" r="20" fill="white" stroke="#111" stroke-width="2.5"/>
<circle cx="148" cy="204" r="9" fill="#111"/>
<circle cx="143" cy="198" r="3.5" fill="white"/>
<circle cx="217" cy="200" r="20" fill="white" stroke="#111" stroke-width="2.5"/>
<circle cx="222" cy="204" r="9" fill="#111"/>
<circle cx="217" cy="198" r="3.5" fill="white"/>
<path d="M171 226 L180 218 L189 226 L180 232 Z" fill="#111"/>
<path d="M166 238 Q180 252 194 238" fill="none" stroke="#111" stroke-width="2"/>
<ellipse cx="113" cy="238" rx="16" ry="9" fill="white" stroke="#111" stroke-width="1.5"/>
<ellipse cx="247" cy="238" rx="16" ry="9" fill="white" stroke="#111" stroke-width="1.5"/>
<line x1="35" y1="226" x2="148" y2="230" stroke="#111" stroke-width="1.5"/>
<line x1="35" y1="240" x2="148" y2="238" stroke="#111" stroke-width="1.5"/>
<line x1="212" y1="230" x2="325" y2="226" stroke="#111" stroke-width="1.5"/>
<line x1="212" y1="238" x2="325" y2="240" stroke="#111" stroke-width="1.5"/>
<path d="M148 92 Q180 112 212 92 Q180 128 148 92" fill="white" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/>
<circle cx="180" cy="104" r="8" fill="white" stroke="#111" stroke-width="2"/>
<path d="M78 315 Q50 380 78 440 L282 440 Q310 380 282 315 Q232 305 180 307 Q128 305 78 315" fill="white" stroke="#111" stroke-width="3"/>
<path d="M128 326 Q180 342 232 326" fill="none" stroke="#111" stroke-width="1.5"/>
<path d="M78 345 Q42 360 48 400 Q56 422 88 402 Q98 382 96 346" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M282 345 Q318 360 312 400 Q304 422 272 402 Q262 382 264 346" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="55" cy="407" rx="18" ry="13" fill="white" stroke="#111" stroke-width="2"/>
<ellipse cx="305" cy="407" rx="18" ry="13" fill="white" stroke="#111" stroke-width="2"/>
<path d="M122 440 L120 462 Q131 476 155 470 Q162 460 150 440" fill="white" stroke="#111" stroke-width="2"/>
<path d="M238 440 L240 462 Q229 476 205 470 Q198 460 210 440" fill="white" stroke="#111" stroke-width="2"/>
</svg>`,
  },
  {
    id: "bunny",
    name: "うさぎ",
    emoji: "🐰",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480">
<rect width="360" height="480" fill="white"/>
<ellipse cx="140" cy="88" rx="22" ry="62" fill="white" stroke="#111" stroke-width="3"/>
<ellipse cx="220" cy="88" rx="22" ry="62" fill="white" stroke="#111" stroke-width="3"/>
<ellipse cx="140" cy="90" rx="12" ry="50" fill="white" stroke="#111" stroke-width="1.5"/>
<ellipse cx="220" cy="90" rx="12" ry="50" fill="white" stroke="#111" stroke-width="1.5"/>
<circle cx="180" cy="210" r="105" fill="white" stroke="#111" stroke-width="3"/>
<circle cx="148" cy="198" r="18" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="153" cy="202" r="8" fill="#111"/>
<circle cx="148" cy="196" r="3" fill="white"/>
<circle cx="212" cy="198" r="18" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="217" cy="202" r="8" fill="#111"/>
<circle cx="212" cy="196" r="3" fill="white"/>
<ellipse cx="180" cy="228" rx="9" ry="7" fill="white" stroke="#111" stroke-width="2"/>
<path d="M166 238 Q180 250 194 238" fill="none" stroke="#111" stroke-width="2"/>
<ellipse cx="120" cy="240" rx="15" ry="9" fill="white" stroke="#111" stroke-width="1.5"/>
<ellipse cx="240" cy="240" rx="15" ry="9" fill="white" stroke="#111" stroke-width="1.5"/>
<path d="M85 300 Q60 340 65 400 L295 400 Q300 340 275 300 Q230 292 180 293 Q130 292 85 300" fill="white" stroke="#111" stroke-width="3"/>
<line x1="180" y1="300" x2="180" y2="400" stroke="#111" stroke-width="2"/>
<line x1="130" y1="300" x2="115" y2="400" stroke="#111" stroke-width="2"/>
<line x1="230" y1="300" x2="245" y2="400" stroke="#111" stroke-width="2"/>
<path d="M110 310 Q110 350 90 370 Q80 385 95 400 Q110 410 125 390 Q135 370 130 320" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M250 310 Q250 350 270 370 Q280 385 265 400 Q250 410 235 390 Q225 370 230 320" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="92" cy="407" rx="16" ry="11" fill="white" stroke="#111" stroke-width="2"/>
<ellipse cx="268" cy="407" rx="16" ry="11" fill="white" stroke="#111" stroke-width="2"/>
<path d="M140 400 L130 430 Q140 450 165 445 Q172 432 162 400" fill="white" stroke="#111" stroke-width="2"/>
<path d="M220 400 L230 430 Q220 450 195 445 Q188 432 198 400" fill="white" stroke="#111" stroke-width="2"/>
</svg>`,
  },
  {
    id: "star",
    name: "ほし",
    emoji: "⭐",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480">
<rect width="360" height="480" fill="white"/>
<polygon points="180,30 210,120 305,120 230,178 258,268 180,215 102,268 130,178 55,120 150,120"
  fill="white" stroke="#111" stroke-width="4" stroke-linejoin="round"/>
<circle cx="180" cy="175" r="55" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="163" cy="165" r="12" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="167" cy="169" r="5.5" fill="#111"/>
<circle cx="163" cy="164" r="2" fill="white"/>
<circle cx="197" cy="165" r="12" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="201" cy="169" r="5.5" fill="#111"/>
<circle cx="197" cy="164" r="2" fill="white"/>
<ellipse cx="180" cy="190" rx="7" ry="5" fill="#111"/>
<path d="M168 200 Q180 212 192 200" fill="none" stroke="#111" stroke-width="2"/>
<ellipse cx="148" cy="200" rx="12" ry="7" fill="white" stroke="#111" stroke-width="1.5"/>
<ellipse cx="212" cy="200" rx="12" ry="7" fill="white" stroke="#111" stroke-width="1.5"/>
<path d="M90 290 Q75 330 80 380 Q90 420 130 430 L230 430 Q270 420 280 380 Q285 330 270 290 Q230 278 180 279 Q130 278 90 290" fill="white" stroke="#111" stroke-width="3"/>
<path d="M85 320 Q50 335 55 375 Q62 405 90 395 Q103 375 100 328" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M275 320 Q310 335 305 375 Q298 405 270 395 Q257 375 260 328" fill="white" stroke="#111" stroke-width="2.5"/>
<circle cx="180" cy="350" r="8" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="180" cy="378" r="8" fill="white" stroke="#111" stroke-width="2"/>
<path d="M130 430 L125 458 Q136 472 158 466 Q164 456 155 430" fill="white" stroke="#111" stroke-width="2"/>
<path d="M230 430 L235 458 Q224 472 202 466 Q196 456 205 430" fill="white" stroke="#111" stroke-width="2"/>
<path d="M 40 50 L 50 40 M 50 50 L 40 40" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 310 80 L 320 70 M 320 80 L 310 70" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="30" cy="90" r="5" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="330" cy="50" r="4" fill="white" stroke="#111" stroke-width="2"/>
</svg>`,
  },
  {
    id: "flower",
    name: "はな",
    emoji: "🌸",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480">
<rect width="360" height="480" fill="white"/>
<ellipse cx="180" cy="100" rx="35" ry="55" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="270" cy="130" rx="35" ry="55" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(60,270,130)"/>
<ellipse cx="270" cy="240" rx="35" ry="55" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(120,270,240)"/>
<ellipse cx="180" cy="270" rx="35" ry="55" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(180,180,270)"/>
<ellipse cx="90" cy="240" rx="35" ry="55" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(240,90,240)"/>
<ellipse cx="90" cy="130" rx="35" ry="55" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(300,90,130)"/>
<circle cx="180" cy="185" r="50" fill="white" stroke="#111" stroke-width="3"/>
<circle cx="164" cy="175" r="14" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="168" cy="179" r="6.5" fill="#111"/>
<circle cx="164" cy="174" r="2.5" fill="white"/>
<circle cx="196" cy="175" r="14" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="200" cy="179" r="6.5" fill="#111"/>
<circle cx="196" cy="174" r="2.5" fill="white"/>
<path d="M 168 198 Q 180 210 192 198" fill="none" stroke="#111" stroke-width="2"/>
<ellipse cx="180" cy="188" rx="6" ry="5" fill="#111"/>
<ellipse cx="150" cy="196" rx="12" ry="7" fill="white" stroke="#111" stroke-width="1.5"/>
<ellipse cx="210" cy="196" rx="12" ry="7" fill="white" stroke="#111" stroke-width="1.5"/>
<line x1="180" y1="235" x2="180" y2="380" stroke="#111" stroke-width="4"/>
<path d="M 180 300 Q 230 280 245 250 Q 220 270 180 300" fill="white" stroke="#111" stroke-width="2"/>
<path d="M 180 340 Q 130 320 115 290 Q 140 310 180 340" fill="white" stroke="#111" stroke-width="2"/>
<path d="M 60 400 Q 120 390 180 380 Q 240 390 300 400" fill="none" stroke="#111" stroke-width="2.5"/>
<path d="M 80 400 Q 100 420 130 410 Q 150 400 160 380" fill="white" stroke="#111" stroke-width="2"/>
<path d="M 200 380 Q 210 400 240 410 Q 270 420 290 400" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="80" cy="50" r="18" fill="white" stroke="#111" stroke-width="2"/>
<line x1="80" y1="20" x2="80" y2="30" stroke="#111" stroke-width="2.5"/>
<line x1="80" y1="70" x2="80" y2="80" stroke="#111" stroke-width="2.5"/>
<line x1="50" y1="50" x2="60" y2="50" stroke="#111" stroke-width="2.5"/>
<line x1="100" y1="50" x2="110" y2="50" stroke="#111" stroke-width="2.5"/>
<line x1="59" y1="29" x2="66" y2="36" stroke="#111" stroke-width="2"/>
<line x1="94" y1="64" x2="101" y2="71" stroke="#111" stroke-width="2"/>
<line x1="101" y1="29" x2="94" y2="36" stroke="#111" stroke-width="2"/>
<line x1="66" y1="64" x2="59" y2="71" stroke="#111" stroke-width="2"/>
</svg>`,
  },
  {
    id: "bear",
    name: "くま",
    emoji: "🐻",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480">
<rect width="360" height="480" fill="white"/>
<circle cx="108" cy="148" r="38" fill="white" stroke="#111" stroke-width="3"/>
<circle cx="252" cy="148" r="38" fill="white" stroke="#111" stroke-width="3"/>
<circle cx="108" cy="148" r="24" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="252" cy="148" r="24" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="180" cy="215" r="118" fill="white" stroke="#111" stroke-width="3"/>
<circle cx="148" cy="200" r="20" fill="white" stroke="#111" stroke-width="2.5"/>
<circle cx="153" cy="205" r="9" fill="#111"/>
<circle cx="148" cy="199" r="3.5" fill="white"/>
<circle cx="212" cy="200" r="20" fill="white" stroke="#111" stroke-width="2.5"/>
<circle cx="217" cy="205" r="9" fill="#111"/>
<circle cx="212" cy="199" r="3.5" fill="white"/>
<ellipse cx="180" cy="238" rx="28" ry="22" fill="white" stroke="#111" stroke-width="2"/>
<ellipse cx="180" cy="236" rx="11" ry="7" fill="#111"/>
<path d="M 165 246 Q 180 258 195 246" fill="none" stroke="#111" stroke-width="2.5"/>
<ellipse cx="138" cy="242" rx="14" ry="9" fill="white" stroke="#111" stroke-width="1.5"/>
<ellipse cx="222" cy="242" rx="14" ry="9" fill="white" stroke="#111" stroke-width="1.5"/>
<path d="M 82 315 Q 52 355 58 415 L 302 415 Q 308 355 278 315 Q 232 303 180 305 Q 128 303 82 315" fill="white" stroke="#111" stroke-width="3"/>
<path d="M 80 330 Q 175 310 280 330" fill="none" stroke="#111" stroke-width="2"/>
<path d="M 80 350 Q 45 365 50 410 Q 58 432 88 415 Q 100 392 97 355" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M 280 350 Q 315 365 310 410 Q 302 432 272 415 Q 260 392 263 355" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="57" cy="418" rx="17" ry="12" fill="white" stroke="#111" stroke-width="2"/>
<ellipse cx="303" cy="418" rx="17" ry="12" fill="white" stroke="#111" stroke-width="2"/>
<path d="M 128 415 L 122 445 Q 133 460 158 454 Q 166 443 154 415" fill="white" stroke="#111" stroke-width="2"/>
<path d="M 232 415 L 238 445 Q 227 460 202 454 Q 194 443 206 415" fill="white" stroke="#111" stroke-width="2"/>
<path d="M 120 330 Q 128 355 180 360 Q 232 355 240 330" fill="none" stroke="#111" stroke-width="1.5"/>
<circle cx="172" cy="348" r="5" fill="white" stroke="#111" stroke-width="1.5"/>
<circle cx="188" cy="348" r="5" fill="white" stroke="#111" stroke-width="1.5"/>
</svg>`,
  },
];

// ── LocalStorage helpers ──────────────────────────────────────────────────────
function loadDrawings(): SavedDrawing[] {
  try {
    return JSON.parse(localStorage.getItem(LS_DRAWINGS) ?? "[]");
  } catch {
    return [];
  }
}
function saveDrawings(list: SavedDrawing[]) {
  localStorage.setItem(LS_DRAWINGS, JSON.stringify(list));
}

// ── Flood fill ────────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function floodFill(
  canvas: HTMLCanvasElement,
  startX: number,
  startY: number,
  fillHex: string,
  tolerance = 45,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width: W, height: H } = canvas;
  const imageData = ctx.getImageData(0, 0, W, H);
  const data = imageData.data;

  const si = (Math.round(startY) * W + Math.round(startX)) * 4;
  const tr = data[si],
    tg = data[si + 1],
    tb = data[si + 2];
  const [fr, fg, fb] = hexToRgb(fillHex);

  // Already same color
  if (
    Math.abs(tr - fr) <= 3 &&
    Math.abs(tg - fg) <= 3 &&
    Math.abs(tb - fb) <= 3
  )
    return;

  const matches = (i: number) =>
    Math.abs(data[i] - tr) <= tolerance &&
    Math.abs(data[i + 1] - tg) <= tolerance &&
    Math.abs(data[i + 2] - tb) <= tolerance;

  const paint = (i: number) => {
    data[i] = fr;
    data[i + 1] = fg;
    data[i + 2] = fb;
    data[i + 3] = 255;
  };

  const visited = new Uint8Array(W * H);
  const stack: number[] = [Math.round(startX) + Math.round(startY) * W];

  let iters = 0;
  while (stack.length && iters < 3_000_000) {
    iters++;
    const pos = stack.pop()!;
    if (visited[pos]) continue;
    const y = Math.floor(pos / W),
      x = pos % W;
    const i = pos * 4;
    if (!matches(i)) continue;

    // Scan left & right
    let left = x,
      right = x;
    while (
      left > 0 &&
      !visited[y * W + left - 1] &&
      matches((y * W + left - 1) * 4)
    )
      left--;
    while (
      right < W - 1 &&
      !visited[y * W + right + 1] &&
      matches((y * W + right + 1) * 4)
    )
      right++;

    for (let cx = left; cx <= right; cx++) {
      const cp = y * W + cx;
      if (!visited[cp]) {
        visited[cp] = 1;
        paint(cp * 4);
      }
    }
    for (let cx = left; cx <= right; cx++) {
      if (
        y > 0 &&
        !visited[(y - 1) * W + cx] &&
        matches(((y - 1) * W + cx) * 4)
      )
        stack.push((y - 1) * W + cx);
      if (
        y < H - 1 &&
        !visited[(y + 1) * W + cx] &&
        matches(((y + 1) * W + cx) * 4)
      )
        stack.push((y + 1) * W + cx);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

// ── Coordinate helper ─────────────────────────────────────────────────────────
function getPos(e: TouchEvent | MouseEvent, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const sx = W / rect.width,
    sy = H / rect.height;
  if ("touches" in e) {
    const t =
      (e as TouchEvent).touches[0] ?? (e as TouchEvent).changedTouches[0];
    return { x: (t.clientX - rect.left) * sx, y: (t.clientY - rect.top) * sy };
  }
  const m = e as MouseEvent;
  return { x: (m.clientX - rect.left) * sx, y: (m.clientY - rect.top) * sy };
}

// ── Gallery ───────────────────────────────────────────────────────────────────
function Gallery({ onClose }: { onClose: () => void }) {
  const [drawings, setDrawings] = useState<SavedDrawing[]>([]);
  const [preview, setPreview] = useState<SavedDrawing | null>(null);

  useEffect(() => {
    setDrawings(loadDrawings());
  }, []);

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
      <div
        className="flex-shrink-0 flex items-center gap-3 px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white font-black active:scale-90"
        >
          ←
        </button>
        <h2 className="text-white font-black text-lg flex-1">
          🖼️ Saved Drawings
        </h2>
        <span className="text-white/40 text-sm">{drawings.length}</span>
      </div>
      {drawings.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="text-6xl">🎨</div>
          <p className="text-white/40 font-bold">No saved drawings yet</p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl font-black text-white active:scale-95"
            style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}
          >
            Start Drawing
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {drawings.map((d) => (
              <div
                key={d.id}
                className="relative rounded-2xl overflow-hidden"
                style={{
                  border: "2px solid rgba(255,255,255,0.1)",
                  aspectRatio: "3/4",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.dataUrl}
                  alt="drawing"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setPreview(d)}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 p-2 flex justify-between items-center"
                  style={{
                    background: "linear-gradient(transparent,rgba(0,0,0,0.6))",
                  }}
                >
                  <span className="text-white/70 text-[10px] font-bold">
                    {d.date}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => download(d)}
                      className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-sm active:scale-90"
                    >
                      💾
                    </button>
                    <button
                      onClick={() => del(d.id)}
                      className="w-7 h-7 rounded-lg bg-red-500/40 flex items-center justify-center text-sm active:scale-90"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80"
          onClick={() => setPreview(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.dataUrl}
            alt="preview"
            className="max-w-full max-h-[80dvh] rounded-2xl shadow-2xl object-contain"
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                download(preview);
              }}
              className="px-5 py-2.5 rounded-2xl font-black text-white active:scale-95"
              style={{
                background: "rgba(34,197,94,0.4)",
                border: "1px solid rgba(34,197,94,0.6)",
              }}
            >
              💾 Download
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                del(preview.id);
              }}
              className="px-5 py-2.5 rounded-2xl font-black text-white active:scale-95"
              style={{
                background: "rgba(239,68,68,0.4)",
                border: "1px solid rgba(239,68,68,0.6)",
              }}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Template picker ───────────────────────────────────────────────────────────
function TemplatePicker({
  onSelect,
  onClose,
}: {
  onSelect: (src: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-lg rounded-t-3xl px-4 pt-4 pb-8 overflow-y-auto max-h-[70dvh]"
        style={{
          background: "linear-gradient(160deg,#1a1a2e,#16213e)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
        <h3 className="text-white font-black text-center text-lg mb-3">
          🎨 ぬりえ テンプレート
        </h3>

        {/* ── Kuromi image templates ── */}
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">
          クルミ
        </p>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {KUROMI_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.src)}
              className="flex flex-col items-center gap-1 rounded-xl overflow-hidden active:scale-90 transition-all"
              style={{ border: "2px solid rgba(255,255,255,0.15)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.src}
                alt={t.name}
                className="w-full aspect-[3/4] object-cover bg-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="text-white/70 text-[10px] font-bold pb-1">
                {t.name}
              </span>
            </button>
          ))}
        </div>

        {/* ── SVG kawaii templates ── */}
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">
          かわいい
        </p>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.svg)}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl active:scale-90 transition-all"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <span className="text-3xl">{t.emoji}</span>
              <span className="text-white/70 text-[10px] font-bold">
                {t.name}
              </span>
            </button>
          ))}
          {/* Upload option */}
          <label
            className="flex flex-col items-center gap-1 p-2 rounded-2xl cursor-pointer active:scale-90"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <span className="text-3xl">📁</span>
            <span className="text-white/70 text-[10px] font-bold">Upload</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  onSelect(ev.target?.result as string);
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

// ── Main Draw Page ─────────────────────────────────────────────────────────────
export default function DrawPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<View>("draw");
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState<string>(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem(LS_COLOR) ?? "#1e293b")
      : "#1e293b",
  );
  const [size, setSize] = useState(7);
  const [zoom, setZoom] = useState(1);
  const [showColors, setShowColors] = useState(false);
  const [showTpl, setShowTpl] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const snapshot = useRef<ImageData | null>(null);
  const panStart = useRef<{
    cx: number;
    cy: number;
    sl: number;
    st: number;
  } | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [bucketCursor, setBucketCursor] = useState<string>("crosshair");

  const pushHistory = useCallback(() => {
    const c = canvasRef.current?.getContext("2d");
    if (!c) return;
    const snap = c.getImageData(0, 0, W, H);
    historyRef.current.push(snap);
    if (historyRef.current.length > 20) historyRef.current.shift();
    setCanUndo(true);
  }, []);

  const undo = useCallback(() => {
    const c = canvasRef.current?.getContext("2d");
    if (!c || historyRef.current.length === 0) return;
    const prev = historyRef.current.pop()!;
    c.putImageData(prev, 0, 0);
    setCanUndo(historyRef.current.length > 0);
  }, []);

  const openPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setPreviewUrl(canvas.toDataURL("image/png"));
    setShowPreview(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_COLOR, color);
  }, [color]);

  // Build emoji bucket cursor after mount
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = 44;
    c.height = 44;
    const cx = c.getContext("2d");
    if (!cx) return;
    cx.font = "36px serif";
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText("🪣", 22, 22);
    setBucketCursor(`url(${c.toDataURL()}) 4 40, crosshair`);
  }, []);

  // Auto-fit canvas to screen on load
  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const cw = el.clientWidth,
      ch = el.clientHeight;
    const fit = Math.min(cw / W, ch / H);
    setZoom(parseFloat(Math.max(0.5, Math.min(4, fit)).toFixed(2)));
  }, []);

  const initCanvas = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff9f0";
    ctx.fillRect(0, 0, W, H);
  }, []);
  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const ctx = useCallback(
    () => canvasRef.current?.getContext("2d") ?? null,
    [],
  );

  // ── Client coords helper (for pan) ──────────────────────────────────────
  const clientXY = (e: TouchEvent | MouseEvent) => {
    if ("touches" in e) {
      const t =
        (e as TouchEvent).touches[0] ?? (e as TouchEvent).changedTouches[0];
      return { cx: t.clientX, cy: t.clientY };
    }
    return { cx: (e as MouseEvent).clientX, cy: (e as MouseEvent).clientY };
  };

  // ── Drawing handlers ─────────────────────────────────────────────────────
  const startDraw = useCallback(
    (e: TouchEvent | MouseEvent) => {
      e.preventDefault();
      if ("touches" in e && (e as TouchEvent).touches.length !== 1) return;

      // Pan tool — record scroll anchor
      if (tool === "pan") {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        const { cx, cy } = clientXY(e);
        panStart.current = {
          cx,
          cy,
          sl: wrapper.scrollLeft,
          st: wrapper.scrollTop,
        };
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const p = getPos(e, canvas);

      // Save history before any paint action
      pushHistory();

      if (tool === "fill") {
        floodFill(canvas, p.x, p.y, color);
        return;
      }

      isDrawing.current = true;
      lastPos.current = p;
      startPos.current = p;
      if (["line", "rect", "circle"].includes(tool)) {
        snapshot.current = ctx()?.getImageData(0, 0, W, H) ?? null;
      }
    },
    [tool, color, ctx, pushHistory],
  );

  const moveDraw = useCallback(
    (e: TouchEvent | MouseEvent) => {
      e.preventDefault();

      // Pan tool — scroll wrapper
      if (tool === "pan") {
        if (!panStart.current) return;
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        const { cx, cy } = clientXY(e);
        wrapper.scrollLeft = panStart.current.sl - (cx - panStart.current.cx);
        wrapper.scrollTop = panStart.current.st - (cy - panStart.current.cy);
        return;
      }

      if (!isDrawing.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const c = ctx();
      if (!c) return;
      const p = getPos(e, canvas);

      if (tool === "pen" || tool === "eraser") {
        c.save();
        c.lineCap = "round";
        c.lineJoin = "round";
        c.lineWidth = tool === "eraser" ? size * 3 : size;
        c.strokeStyle = tool === "eraser" ? "#fff9f0" : color;
        c.beginPath();
        c.moveTo(lastPos.current!.x, lastPos.current!.y);
        c.lineTo(p.x, p.y);
        c.stroke();
        c.restore();
        lastPos.current = p;
      } else if (snapshot.current && startPos.current) {
        c.putImageData(snapshot.current, 0, 0);
        c.save();
        c.strokeStyle = color;
        c.lineWidth = size;
        c.lineCap = "round";
        if (tool === "line") {
          c.beginPath();
          c.moveTo(startPos.current.x, startPos.current.y);
          c.lineTo(p.x, p.y);
          c.stroke();
        } else if (tool === "rect") {
          c.strokeRect(
            startPos.current.x,
            startPos.current.y,
            p.x - startPos.current.x,
            p.y - startPos.current.y,
          );
        } else if (tool === "circle") {
          const rx = (p.x - startPos.current.x) / 2,
            ry = (p.y - startPos.current.y) / 2;
          c.beginPath();
          c.ellipse(
            startPos.current.x + rx,
            startPos.current.y + ry,
            Math.abs(rx),
            Math.abs(ry),
            0,
            0,
            Math.PI * 2,
          );
          c.stroke();
        }
        c.restore();
      }
    },
    [tool, color, size, ctx],
  );

  const endDraw = useCallback((e: TouchEvent | MouseEvent) => {
    e.preventDefault();
    panStart.current = null;
    isDrawing.current = false;
    lastPos.current = null;
    snapshot.current = null;
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("mousedown", startDraw);
    el.addEventListener("mousemove", moveDraw);
    el.addEventListener("mouseup", endDraw);
    el.addEventListener("mouseleave", endDraw);
    el.addEventListener("touchstart", startDraw, { passive: false });
    el.addEventListener("touchmove", moveDraw, { passive: false });
    el.addEventListener("touchend", endDraw, { passive: false });
    return () => {
      el.removeEventListener("mousedown", startDraw);
      el.removeEventListener("mousemove", moveDraw);
      el.removeEventListener("mouseup", endDraw);
      el.removeEventListener("mouseleave", endDraw);
      el.removeEventListener("touchstart", startDraw);
      el.removeEventListener("touchmove", moveDraw);
      el.removeEventListener("touchend", endDraw);
    };
  }, [startDraw, moveDraw, endDraw]);

  // ── Load template ────────────────────────────────────────────────────────
  const loadTemplate = (svgOrUrl: string) => {
    const canvas = canvasRef.current;
    const c = ctx();
    if (!canvas || !c) return;
    pushHistory();
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Fill white background first
      c.fillStyle = "#ffffff";
      c.fillRect(0, 0, W, H);
      // Contain: scale proportionally, center on canvas — no stretching
      const scale = Math.min(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth  * scale;
      const dh = img.naturalHeight * scale;
      const dx = (W - dw) / 2;
      const dy = (H - dh) / 2;
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = "high";
      c.drawImage(img, dx, dy, dw, dh);
    };
    if (
      svgOrUrl.startsWith("data:") ||
      svgOrUrl.startsWith("/") ||
      svgOrUrl.startsWith("http")
    ) {
      img.src = svgOrUrl; // image file path or data URL
    } else {
      img.src =
        "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgOrUrl); // raw SVG string
    }
    setShowTpl(false);
  };

  const clear = () => {
    pushHistory();
    initCanvas();
  };

  const saveToGallery = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    const now = new Date();
    const date = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    saveDrawings([
      { id: Date.now().toString(), dataUrl, date },
      ...loadDrawings(),
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const zoomIn = () =>
    setZoom((z) => Math.min(4, parseFloat((z + 0.5).toFixed(1))));
  const zoomOut = () =>
    setZoom((z) => Math.max(0.5, parseFloat((z - 0.5).toFixed(1))));

  if (view === "gallery") return <Gallery onClose={() => setView("draw")} />;

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
      {/* ── Controls: 2 compact left-aligned rows ── */}
      <div
        className="flex-shrink-0"
        style={{
          background: "rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Row 1: back | undo | divider | tools | divider | color */}
        <div className="flex items-center gap-1 px-2 pt-2 pb-1">
          {/* Nav */}
          <button
            onClick={() => router.back()}
            className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/10 text-white font-black text-sm flex items-center justify-center active:scale-90"
          >
            ←
          </button>
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`flex-shrink-0 w-8 h-8 rounded-xl text-lg flex items-center justify-center active:scale-90 transition-all ${canUndo ? "bg-white/10" : "opacity-20"}`}
            title="Undo"
          >
            ↩️
          </button>
          <div className="w-px h-6 bg-white/20 flex-shrink-0 mx-0.5" />
          {/* Tool buttons — left-aligned, compact */}
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                tool === t.id
                  ? "bg-white/25 ring-1 ring-white/40"
                  : "opacity-40"
              }`}
            >
              <span className="text-xl leading-none">{t.icon}</span>
            </button>
          ))}
          <div className="w-px h-6 bg-white/20 flex-shrink-0 mx-0.5" />
          {/* Color picker */}
          <button
            onClick={() => setShowColors((v) => !v)}
            className={`flex-shrink-0 w-9 h-9 rounded-full border-[3px] transition-all active:scale-90 ${showColors ? "border-white scale-110" : "border-white/30"}`}
            style={{ backgroundColor: color }}
          />
        </div>

        {/* Row 2: sizes | divider | zoom | divider | Template | Clear | Save | Gallery | Preview */}
        <div className="flex items-center gap-1 px-2 pb-2">
          {/* Brush sizes */}
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${size === s ? "bg-white/20 ring-2 ring-white/50" : ""}`}
            >
              <div
                className="rounded-full bg-white/80"
                style={{
                  width: Math.min(s * 1.4, 20),
                  height: Math.min(s * 1.4, 20),
                }}
              />
            </button>
          ))}
          <div className="w-px h-6 bg-white/20 flex-shrink-0 mx-0.5" />
          {/* Zoom */}
          <button
            onClick={zoomOut}
            className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/10 text-white font-black text-sm flex items-center justify-center active:scale-90"
          >
            −
          </button>
          <span className="flex-shrink-0 text-white/60 text-[11px] font-bold w-9 text-center">
            {zoom}×
          </span>
          <button
            onClick={zoomIn}
            className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/10 text-white font-black text-sm flex items-center justify-center active:scale-90"
          >
            +
          </button>
          <div className="w-px h-6 bg-white/20 flex-shrink-0 mx-0.5" />
          {/* Template — text label so it's easy to find */}
          <button
            onClick={() => setShowTpl(true)}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 h-9 rounded-xl text-xs font-black text-violet-300 active:scale-90"
            style={{
              background: "rgba(139,92,246,0.25)",
              border: "1px solid rgba(139,92,246,0.5)",
            }}
          >
            🖼️ <span>テンプレ</span>
          </button>
          <button
            onClick={clear}
            className="flex-shrink-0 w-9 h-9 rounded-xl text-xl flex items-center justify-center active:scale-90"
            style={{
              background: "rgba(239,68,68,0.2)",
              border: "1px solid rgba(239,68,68,0.4)",
            }}
            title="Clear"
          >
            🗑️
          </button>
          <button
            onClick={saveToGallery}
            className="flex-shrink-0 w-9 h-9 rounded-xl text-xl flex items-center justify-center active:scale-90"
            style={{
              background: saved
                ? "rgba(34,197,94,0.45)"
                : "rgba(34,197,94,0.2)",
              border: "1px solid rgba(34,197,94,0.4)",
            }}
            title="Save"
          >
            {saved ? "✅" : "💾"}
          </button>
          <button
            onClick={() => setView("gallery")}
            className="flex-shrink-0 w-9 h-9 rounded-xl text-xl flex items-center justify-center active:scale-90"
            style={{
              background: "rgba(14,165,233,0.2)",
              border: "1px solid rgba(14,165,233,0.4)",
            }}
            title="Gallery"
          >
            🖼️
          </button>
          <button
            onClick={openPreview}
            className="flex-shrink-0 w-9 h-9 rounded-xl text-xl flex items-center justify-center active:scale-90"
            style={{
              background: "rgba(251,191,36,0.2)",
              border: "1px solid rgba(251,191,36,0.4)",
            }}
            title="Preview"
          >
            👁️
          </button>
        </div>
      </div>

      {/* ── Color palette ── */}
      {showColors && (
        <div
          className="flex-shrink-0 flex flex-wrap gap-2 px-3 py-2"
          style={{
            background: "rgba(255,255,255,0.05)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setShowColors(false);
              }}
              className={`w-8 h-8 rounded-full transition-all active:scale-90 ${color === c ? "ring-2 ring-white ring-offset-1 ring-offset-transparent scale-110" : ""}`}
              style={{
                backgroundColor: c,
                border: ["#ffffff", "#fff9f0"].includes(c)
                  ? "2px solid rgba(255,255,255,0.4)"
                  : "none",
              }}
            />
          ))}
        </div>
      )}

      {/* ── Zoomable canvas ── */}
      <div
        ref={wrapperRef}
        className="flex-1 overflow-auto flex justify-center"
        style={{ background: "#334155" }}
      >
        <div
          style={{
            width: W * zoom,
            height: H * zoom,
            position: "relative",
            flexShrink: 0,
            margin: "0 auto",
          }}
        >
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: W,
              height: H,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              touchAction: "none",
              cursor:
                tool === "fill"
                  ? bucketCursor
                  : tool === "pan"
                    ? "grab"
                    : tool === "eraser"
                      ? "cell"
                      : "crosshair",
            }}
          />
        </div>
      </div>

      {/* ── Template picker ── */}
      {showTpl && (
        <TemplatePicker
          onSelect={loadTemplate}
          onClose={() => setShowTpl(false)}
        />
      )}

      {/* ── Preview modal ── */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4 gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-[80dvh] rounded-2xl shadow-2xl object-contain"
              style={{ border: "3px solid rgba(255,255,255,0.2)" }}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-3 rounded-2xl font-black text-white text-sm active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                ✕ Close
              </button>
              <button
                onClick={() => {
                  saveToGallery();
                  setShowPreview(false);
                }}
                className="px-6 py-3 rounded-2xl font-black text-white text-sm active:scale-95"
                style={{
                  background: "rgba(34,197,94,0.4)",
                  border: "1px solid rgba(34,197,94,0.6)",
                }}
              >
                💾 Save
              </button>
              <button
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = previewUrl;
                  a.download = `drawing-${Date.now()}.png`;
                  a.click();
                }}
                className="px-6 py-3 rounded-2xl font-black text-white text-sm active:scale-95"
                style={{
                  background: "rgba(14,165,233,0.4)",
                  border: "1px solid rgba(14,165,233,0.6)",
                }}
              >
                ⬇️ Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
