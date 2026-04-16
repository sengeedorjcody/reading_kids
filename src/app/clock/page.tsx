"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSpeech } from "@/hooks/useSpeech";

// ── Clock geometry ────────────────────────────────────────────────────────
const SIZE  = 280;
const CX    = SIZE / 2;
const CY    = SIZE / 2;
const R     = CX - 14;

function degToXY(deg: number, r: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + Math.cos(rad) * r, y: CY + Math.sin(rad) * r };
}

function angleFromCenter(svgX: number, svgY: number) {
  let a = (Math.atan2(svgY - CY, svgX - CX) * 180) / Math.PI + 90;
  if (a < 0) a += 360;
  return a;
}

// ── Japanese time readings ────────────────────────────────────────────────
const HOURS_JP = [
  "じゅうにじ", "いちじ", "にじ", "さんじ", "よじ", "ごじ",
  "ろくじ", "しちじ", "はちじ", "くじ", "じゅうじ", "じゅういちじ",
];

const MINUTES_JP: Record<number, string> = {
  0: "ちょうど", 1: "いっぷん", 2: "にふん", 3: "さんぷん", 4: "よんふん",
  5: "ごふん", 6: "ろっぷん", 7: "ななふん", 8: "はっぷん", 9: "きゅうふん",
  10: "じゅっぷん", 11: "じゅういっぷん", 12: "じゅうにふん", 13: "じゅうさんぷん",
  14: "じゅうよんふん", 15: "じゅうごふん", 16: "じゅうろっぷん", 17: "じゅうななふん",
  18: "じゅうはっぷん", 19: "じゅうきゅうふん", 20: "にじゅっぷん",
  21: "にじゅういっぷん", 22: "にじゅうにふん", 23: "にじゅうさんぷん",
  24: "にじゅうよんふん", 25: "にじゅうごふん", 26: "にじゅうろっぷん",
  27: "にじゅうななふん", 28: "にじゅうはっぷん", 29: "にじゅうきゅうふん",
  30: "はん", 31: "さんじゅういっぷん", 32: "さんじゅうにふん",
  33: "さんじゅうさんぷん", 34: "さんじゅうよんふん", 35: "さんじゅうごふん",
  36: "さんじゅうろっぷん", 37: "さんじゅうななふん", 38: "さんじゅうはっぷん",
  39: "さんじゅうきゅうふん", 40: "よんじゅっぷん", 41: "よんじゅういっぷん",
  42: "よんじゅうにふん", 43: "よんじゅうさんぷん", 44: "よんじゅうよんふん",
  45: "よんじゅうごふん", 46: "よんじゅうろっぷん", 47: "よんじゅうななふん",
  48: "よんじゅうはっぷん", 49: "よんじゅうきゅうふん", 50: "ごじゅっぷん",
  51: "ごじゅういっぷん", 52: "ごじゅうにふん", 53: "ごじゅうさんぷん",
  54: "ごじゅうよんふん", 55: "ごじゅうごふん", 56: "ごじゅうろっぷん",
  57: "ごじゅうななふん", 58: "ごじゅうはっぷん", 59: "ごじゅうきゅうふん",
};

function toTimeJP(h: number, m: number) {
  const hourJP = HOURS_JP[h % 12];
  if (m === 0) return `${hourJP}ちょうど`;
  return `${hourJP}${MINUTES_JP[m] ?? `${m}ふん`}`;
}

// ── Hour markers ──────────────────────────────────────────────────────────
const HOUR_MARKERS = Array.from({ length: 60 }, (_, i) => {
  const isMajor   = i % 5 === 0;
  const isQuarter = i % 15 === 0;
  const len  = isQuarter ? 18 : isMajor ? 13 : 7;
  const outer = degToXY(i * 6, R);
  const inner = degToXY(i * 6, R - len);
  const label = degToXY(i * 6, R - 30);
  const num   = i === 0 ? 12 : i / 5;
  return { outer, inner, label, num: isMajor ? num : null, isMajor, isQuarter };
});

// ── Component ─────────────────────────────────────────────────────────────
export default function ClockPage() {
  const [isLive, setIsLive]     = useState(true);
  const [hour,   setHour]       = useState(() => new Date().getHours());
  const [minute, setMinute]     = useState(() => new Date().getMinutes());
  const [second, setSecond]     = useState(() => new Date().getSeconds());
  const dragging = useRef<"hour" | "minute" | null>(null);
  const svgRef   = useRef<SVGSVGElement>(null);
  const { speak } = useSpeech();

  // Live clock tick
  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => {
      const n = new Date();
      setHour(n.getHours());
      setMinute(n.getMinutes());
      setSecond(n.getSeconds());
    }, 1000);
    return () => clearInterval(id);
  }, [isLive]);

  // Switch to live: restore current time
  const goLive = () => {
    const n = new Date();
    setHour(n.getHours());
    setMinute(n.getMinutes());
    setSecond(n.getSeconds());
    setIsLive(true);
  };

  // Convert client pointer → SVG coordinates
  const toSVGPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: CX, y: CY };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width)  * SIZE,
      y: ((clientY - rect.top)  / rect.height) * SIZE,
    };
  }, []);

  // Detect which hand the pointer is nearest to
  const whichHand = useCallback((sx: number, sy: number): "hour" | "minute" | null => {
    const minAngle  = minute * 6;
    const hourAngle = ((hour % 12) + minute / 60) * 30;
    const mEnd = degToXY(minAngle,  R * 0.84);
    const hEnd = degToXY(hourAngle, R * 0.58);
    // Check along each hand (sample 8 points)
    const onHand = (end: {x:number;y:number}, threshold: number) => {
      for (let t = 0; t <= 1; t += 0.125) {
        const hx = CX + (end.x - CX) * t;
        const hy = CY + (end.y - CY) * t;
        if (Math.hypot(sx - hx, sy - hy) < threshold) return true;
      }
      return false;
    };
    if (onHand(mEnd, 18)) return "minute";
    if (onHand(hEnd, 22)) return "hour";
    return null;
  }, [hour, minute]);

  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (isLive) return;
    e.preventDefault();
    const { x, y } = toSVGPoint(e.clientX, e.clientY);
    const hand = whichHand(x, y);
    if (!hand) return;
    dragging.current = hand;
    svgRef.current?.setPointerCapture(e.pointerId);
  }, [isLive, toSVGPoint, whichHand]);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    e.preventDefault();
    const { x, y } = toSVGPoint(e.clientX, e.clientY);
    const angle = angleFromCenter(x, y);

    if (dragging.current === "minute") {
      const raw = Math.round(angle / 6) % 60;
      setMinute(raw < 0 ? raw + 60 : raw);
    } else {
      const raw = Math.round(angle / 30) % 12;
      // Preserve AM/PM
      const base = hour >= 12 ? 12 : 0;
      setHour((raw < 0 ? raw + 12 : raw) + base);
    }
  }, [toSVGPoint, hour]);

  const onPointerUp = useCallback(() => { dragging.current = null; }, []);

  // Hand angles
  const minAngle  = minute * 6;
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const secAngle  = second * 6;

  const minEnd  = degToXY(minAngle,  R * 0.84);
  const hourEnd = degToXY(hourAngle, R * 0.58);
  const secEnd  = degToXY(secAngle,  R * 0.90);

  const h12   = hour % 12 || 12;
  const ampm  = hour < 12 ? "午前" : "午後";
  const timeJP = toTimeJP(hour, minute);

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-28">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-black text-gray-800">🕐 とけい</h1>
        <p className="text-sm text-gray-400">Tap the clock to hear the time in Japanese</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={goLive}
          className="flex-1 py-3 rounded-2xl font-black text-sm transition-all active:scale-95"
          style={isLive
            ? { backgroundColor: "#8b5cf6", color: "#fff", boxShadow: "0 4px 12px #8b5cf655" }
            : { backgroundColor: "#f3f4f6", color: "#6b7280" }}
        >
          🕐 いまのじかん
        </button>
        <button
          onClick={() => setIsLive(false)}
          className="flex-1 py-3 rounded-2xl font-black text-sm transition-all active:scale-95"
          style={!isLive
            ? { backgroundColor: "#f97316", color: "#fff", boxShadow: "0 4px 12px #f9731655" }
            : { backgroundColor: "#f3f4f6", color: "#6b7280" }}
        >
          ✏️ れんしゅう
        </button>
      </div>

      {/* Clock face */}
      <div className="flex justify-center mb-4">
        <svg
          ref={svgRef}
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="touch-none"
          style={{
            maxWidth: "100%",
            userSelect: "none",
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.12))",
            cursor: isLive ? "default" : "crosshair",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onClick={() => speak(timeJP)}
        >
          {/* Outer bezel */}
          <circle cx={CX} cy={CY} r={CX - 2} fill="#fff" stroke="#e2e8f0" strokeWidth={3} />

          {/* Tick marks + hour numbers */}
          {HOUR_MARKERS.map((m, i) => (
            <g key={i}>
              <line
                x1={m.inner.x} y1={m.inner.y}
                x2={m.outer.x} y2={m.outer.y}
                stroke={m.isQuarter ? "#1e293b" : m.isMajor ? "#475569" : "#cbd5e1"}
                strokeWidth={m.isQuarter ? 3 : m.isMajor ? 2 : 1}
                strokeLinecap="round"
              />
              {m.num !== null && (
                <text
                  x={m.label.x}
                  y={m.label.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={m.isQuarter ? "18" : "13"}
                  fontWeight="900"
                  fill={m.isQuarter ? "#1e293b" : "#64748b"}
                >
                  {m.num}
                </text>
              )}
            </g>
          ))}

          {/* ── Hands ── */}

          {/* Minute hand */}
          <line
            x1={CX} y1={CY + 8}
            x2={minEnd.x} y2={minEnd.y}
            stroke="#6366f1"
            strokeWidth={5}
            strokeLinecap="round"
          />
          {/* Minute hand counter-weight */}
          <line
            x1={CX} y1={CY + 8}
            x2={degToXY(minAngle + 180, 18).x}
            y2={degToXY(minAngle + 180, 18).y}
            stroke="#6366f1"
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.4}
          />

          {/* Hour hand */}
          <line
            x1={CX} y1={CY + 6}
            x2={hourEnd.x} y2={hourEnd.y}
            stroke="#1e293b"
            strokeWidth={8}
            strokeLinecap="round"
          />
          {/* Hour hand counter-weight */}
          <line
            x1={CX} y1={CY + 6}
            x2={degToXY(hourAngle + 180, 14).x}
            y2={degToXY(hourAngle + 180, 14).y}
            stroke="#1e293b"
            strokeWidth={8}
            strokeLinecap="round"
            opacity={0.3}
          />

          {/* Second hand (live only) */}
          {isLive && (
            <>
              <line
                x1={CX} y1={CY}
                x2={secEnd.x} y2={secEnd.y}
                stroke="#ef4444"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <line
                x1={CX} y1={CY}
                x2={degToXY(secAngle + 180, 20).x}
                y2={degToXY(secAngle + 180, 20).y}
                stroke="#ef4444"
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.5}
              />
            </>
          )}

          {/* Center cap */}
          <circle cx={CX} cy={CY} r={9}  fill="#1e293b" />
          <circle cx={CX} cy={CY} r={4}  fill="#fff" />
          {isLive && <circle cx={CX} cy={CY} r={3} fill="#ef4444" />}

          {/* Practice hint overlay */}
          {!isLive && (
            <text
              x={CX} y={CY + R - 20}
              textAnchor="middle"
              fontSize="10"
              fill="#94a3b8"
              fontWeight="700"
            >
              針をドラッグ ✏️
            </text>
          )}
        </svg>
      </div>

      {/* Digital display + Japanese */}
      <div
        className="rounded-3xl px-6 py-5 mb-4 text-center border-2"
        style={{ backgroundColor: "#fff", borderColor: "#e2e8f0" }}
      >
        {/* AM/PM + digital */}
        <div className="flex items-start justify-center gap-2 mb-1">
          <span className="text-sm font-black text-gray-400 mt-2">{ampm}</span>
          <span className="text-5xl font-black text-gray-800 tabular-nums tracking-tight">
            {h12.toString().padStart(2, "0")}
            <span className="animate-pulse">:</span>
            {minute.toString().padStart(2, "0")}
          </span>
          {isLive && (
            <span className="text-xl font-black text-gray-400 mt-3 tabular-nums">
              :{second.toString().padStart(2, "0")}
            </span>
          )}
        </div>

        {/* Japanese reading */}
        <div className="text-2xl font-black mt-2" style={{ color: "#8b5cf6" }}>
          {timeJP}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {h12}時{minute === 0 ? "ちょうど" : minute === 30 ? "はん" : `${minute}分`}
        </div>
      </div>

      {/* Speak button */}
      <button
        onClick={() => speak(timeJP)}
        className="w-full py-4 rounded-3xl font-black text-lg text-white transition-all active:scale-95 flex items-center justify-center gap-3"
        style={{ backgroundColor: "#8b5cf6", boxShadow: "0 6px 20px #8b5cf644" }}
      >
        <span className="text-2xl">🔊</span>
        {timeJP}
      </button>

      {!isLive && (
        <p className="text-center text-xs text-gray-400 mt-3 font-bold">
          ⏰ タップで再生 · ドラッグで時刻を合わせよう！
        </p>
      )}
    </div>
  );
}
