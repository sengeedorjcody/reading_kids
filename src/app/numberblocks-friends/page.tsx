"use client";

import { useRef, useState, useEffect } from "react";
import { useSpeech } from "@/hooks/useSpeech";

// ── Numberblocks characters (colors follow the show) ────────────────────────
interface Character {
  n: number;
  name: string;
  jp: string;
  color: string;
  accent: string;
}

const CHARACTERS: Character[] = [
  { n: 1,  name: "One",   jp: "いち",    color: "#d11a2a", accent: "#ff5a66" },
  { n: 2,  name: "Two",   jp: "に",      color: "#f37021", accent: "#ffa564" },
  { n: 3,  name: "Three", jp: "さん",    color: "#fbd000", accent: "#ffe45e" },
  { n: 4,  name: "Four",  jp: "よん",    color: "#00a850", accent: "#4ade80" },
  { n: 5,  name: "Five",  jp: "ご",      color: "#00aeef", accent: "#67d5ff" },
  { n: 6,  name: "Six",   jp: "ろく",    color: "#6c2dc7", accent: "#a78bfa" },
  { n: 7,  name: "Seven", jp: "なな",    color: "#8b5cf6", accent: "#f472b6" },
  { n: 8,  name: "Eight", jp: "はち",    color: "#d10074", accent: "#f472b6" },
  { n: 9,  name: "Nine",  jp: "きゅう",  color: "#808080", accent: "#cbd5e1" },
  { n: 10, name: "Ten",   jp: "じゅう",  color: "#d11a2a", accent: "#ffffff" },
];

const BLOCK = 24; // px per body block

// Column layout like the show: 1-5 stand tall, 6+ stack into two columns
function columnsFor(n: number): number[] {
  if (n <= 5) return [n];
  const tall = Math.ceil(n / 2);
  return [tall, n - tall];
}

// ── One animated character ───────────────────────────────────────────────────
function NumberFriend({
  char, x, y, z, dragging, onPointerDown,
}: {
  char: Character;
  x: number; y: number; z: number;
  dragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  const cols = columnsFor(char.n);
  const maxRows = Math.max(...cols);
  const bodyW = cols.length * (BLOCK + 2);
  const bodyH = maxRows * (BLOCK + 2);

  return (
    <div
      onPointerDown={onPointerDown}
      className="absolute cursor-grab active:cursor-grabbing touch-none select-none"
      style={{
        left: x, top: y, zIndex: z,
        transform: dragging ? "scale(1.12)" : "scale(1)",
        transition: dragging ? "none" : "transform 0.15s",
        filter: dragging ? "drop-shadow(0 10px 16px rgba(0,0,0,0.35))" : "drop-shadow(0 4px 6px rgba(0,0,0,0.2))",
      }}
    >
      <div className={dragging ? "nb-bounce" : "nb-idle"} style={{ width: bodyW + 28, paddingInline: 14 }}>
        {/* Arms */}
        <div className="relative" style={{ width: bodyW, height: bodyH }}>
          <div
            className={`absolute rounded-full ${dragging ? "nb-arm-wave-l" : "nb-arm-idle-l"}`}
            style={{ width: 16, height: 4, background: char.color, left: -15, top: 8, transformOrigin: "right center" }}
          />
          <div
            className={`absolute rounded-full ${dragging ? "nb-arm-wave-r" : "nb-arm-idle-r"}`}
            style={{ width: 16, height: 4, background: char.color, right: -15, top: 8, transformOrigin: "left center" }}
          />

          {/* Body blocks: columns bottom-aligned */}
          <div className="flex items-end justify-center gap-0.5" style={{ height: bodyH }}>
            {cols.map((rows, ci) => (
              <div key={ci} className="flex flex-col gap-0.5">
                {Array.from({ length: rows }).map((_, ri) => {
                  const isHead = ci === 0 && ri === 0;
                  const striped = char.n === 10 && ri % 2 === 1;
                  return (
                    <div
                      key={ri}
                      className="rounded-[5px] flex items-center justify-center"
                      style={{
                        width: BLOCK, height: BLOCK,
                        background: striped ? char.accent : char.color,
                        border: `1.5px solid rgba(0,0,0,0.15)`,
                      }}
                    >
                      {isHead && (
                        <div className="flex flex-col items-center" style={{ marginTop: -2 }}>
                          <div className="flex gap-[5px]">
                            <span className="nb-eye" />
                            <span className="nb-eye" />
                          </div>
                          <div
                            style={{
                              width: 10, height: 5,
                              borderBottom: "2px solid #fff",
                              borderRadius: "0 0 10px 10px",
                              marginTop: 1,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legs */}
          <div className="absolute flex justify-center gap-2" style={{ bottom: -10, left: 0, right: 0 }}>
            <div
              className={`rounded-full ${dragging ? "nb-leg-kick-l" : ""}`}
              style={{ width: 4, height: 10, background: char.color, transformOrigin: "top center" }}
            />
            <div
              className={`rounded-full ${dragging ? "nb-leg-kick-r" : ""}`}
              style={{ width: 4, height: 10, background: char.color, transformOrigin: "top center" }}
            />
          </div>
        </div>

        {/* Name tag */}
        <div className="text-center mt-4">
          <span
            className="px-2 py-0.5 rounded-full font-black text-[11px] text-white"
            style={{ background: char.color }}
          >
            {char.n} · {char.name}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
interface Pos { x: number; y: number; z: number }

export default function NumberblocksFriends() {
  const areaRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<number, Pos>>({});
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const zTop = useRef(10);
  const { speak } = useSpeech();

  // Scatter characters once the area has a size
  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const { clientWidth: w, clientHeight: h } = area;
    const init: Record<number, Pos> = {};
    CHARACTERS.forEach((c, i) => {
      const col = i % 5, row = Math.floor(i / 5);
      init[c.n] = {
        x: 16 + col * ((w - 120) / 4) + Math.random() * 24,
        y: 30 + row * (h / 2.4) + Math.random() * 30,
        z: i + 1,
      };
    });
    zTop.current = CHARACTERS.length + 1;
    setPositions(init);
  }, []);

  const startDrag = (char: Character) => (e: React.PointerEvent) => {
    e.preventDefault();
    const area = areaRef.current;
    if (!area) return;

    speak(char.name.toLowerCase(), "en-US");

    const areaRect = area.getBoundingClientRect();
    const pos = positions[char.n];
    if (!pos) return;
    const offsetX = e.clientX - areaRect.left - pos.x;
    const offsetY = e.clientY - areaRect.top - pos.y;
    const z = ++zTop.current;

    setDraggingId(char.n);
    setPositions((p) => ({ ...p, [char.n]: { ...p[char.n], z } }));

    const onMove = (ev: PointerEvent) => {
      const nx = Math.max(0, Math.min(area.clientWidth - 90, ev.clientX - areaRect.left - offsetX));
      const ny = Math.max(0, Math.min(area.clientHeight - 140, ev.clientY - areaRect.top - offsetY));
      setPositions((p) => ({ ...p, [char.n]: { x: nx, y: ny, z } }));
    };
    const onUp = () => {
      setDraggingId(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #d4f0ff, #e8f8c8)" }}
    >
      {/* Character animations */}
      <style>{`
        .nb-eye {
          width: 5px; height: 5px; border-radius: 50%; background: #fff;
          animation: nbBlink 3.2s infinite;
        }
        @keyframes nbBlink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        .nb-idle { animation: nbSway 2.6s ease-in-out infinite; transform-origin: bottom center; }
        @keyframes nbSway {
          0%, 100% { transform: rotate(-1.5deg); }
          50% { transform: rotate(1.5deg); }
        }
        .nb-bounce { animation: nbBounce 0.35s ease-in-out infinite; }
        @keyframes nbBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .nb-arm-idle-l { animation: nbArmIdleL 2.6s ease-in-out infinite; }
        .nb-arm-idle-r { animation: nbArmIdleR 2.6s ease-in-out infinite; }
        @keyframes nbArmIdleL { 0%,100% { transform: rotate(20deg); } 50% { transform: rotate(35deg); } }
        @keyframes nbArmIdleR { 0%,100% { transform: rotate(-20deg); } 50% { transform: rotate(-35deg); } }
        .nb-arm-wave-l { animation: nbWaveL 0.3s ease-in-out infinite; }
        .nb-arm-wave-r { animation: nbWaveR 0.3s ease-in-out infinite; }
        @keyframes nbWaveL { 0%,100% { transform: rotate(40deg); } 50% { transform: rotate(-50deg); } }
        @keyframes nbWaveR { 0%,100% { transform: rotate(-40deg); } 50% { transform: rotate(50deg); } }
        .nb-leg-kick-l { animation: nbKickL 0.25s ease-in-out infinite; }
        .nb-leg-kick-r { animation: nbKickR 0.25s ease-in-out infinite alternate; }
        @keyframes nbKickL { 0%,100% { transform: rotate(-25deg); } 50% { transform: rotate(25deg); } }
        @keyframes nbKickR { 0%,100% { transform: rotate(25deg); } 50% { transform: rotate(-25deg); } }
      `}</style>

      {/* Header */}
      <div className="flex-shrink-0 text-center py-3">
        <h1 className="font-black text-lg text-gray-700">🧱 ナンバーブロックスの ともだち</h1>
        <p className="text-xs font-bold text-gray-500">Дүр дээр дарж, чирж хөдөлгөөрэй! 👆🔊</p>
      </div>

      {/* Play area */}
      <div
        ref={areaRef}
        className="flex-1 relative mx-3 mb-3 rounded-3xl"
        style={{ border: "3px dashed rgba(100,120,200,0.4)", background: "rgba(255,255,255,0.4)" }}
      >
        {CHARACTERS.map((c) => {
          const pos = positions[c.n];
          if (!pos) return null;
          return (
            <NumberFriend
              key={c.n}
              char={c}
              x={pos.x} y={pos.y} z={pos.z}
              dragging={draggingId === c.n}
              onPointerDown={startDrag(c)}
            />
          );
        })}
      </div>
    </div>
  );
}
