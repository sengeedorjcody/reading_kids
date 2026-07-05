"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ANIMALS, Animal } from "@/constants/animals";
import { useSpeech } from "@/hooks/useSpeech";

const ROUND_SIZE = 6;

function pickRound(): Animal[] {
  return [...ANIMALS].sort(() => Math.random() - 0.5).slice(0, ROUND_SIZE);
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface Point { x: number; y: number }

export default function AnimalMatchGame() {
  const [round, setRound] = useState<Animal[]>(() => pickRound());
  const [wordOrder, setWordOrder] = useState<Animal[]>(() => shuffle(round));
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ animal: Animal; from: Point; pos: Point } | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const wordRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { speak } = useSpeech();

  const allMatched = matched.size === round.length && round.length > 0;

  const newRound = useCallback(() => {
    const r = pickRound();
    setRound(r);
    setWordOrder(shuffle(r));
    setMatched(new Set());
    setWrong(null);
    setDrag(null);
    setScore(0);
    setAttempts(0);
  }, []);

  const centerOf = (el: HTMLDivElement, container: DOMRect): Point => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 - container.left, y: r.top + r.height / 2 - container.top };
  };

  const startDrag = useCallback((animal: Animal, clientX: number, clientY: number) => {
    speak(animal.japanese);
    if (matched.has(animal.japanese)) return;
    const container = containerRef.current?.getBoundingClientRect();
    const cardEl = cardRefs.current.get(animal.japanese);
    if (!container || !cardEl) return;
    setDrag({ animal, from: centerOf(cardEl, container), pos: { x: clientX - container.left, y: clientY - container.top } });
  }, [matched, speak]);

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current?.getBoundingClientRect();
    if (!container) return;
    setDrag((d) => d ? { ...d, pos: { x: clientX - container.left, y: clientY - container.top } } : d);
  }, []);

  const endDrag = useCallback((clientX: number, clientY: number) => {
    setDrag((d) => {
      if (!d) return null;
      // find word target under release point
      let hitWord: Animal | null = null;
      for (const [key, el] of Array.from(wordRefs.current.entries())) {
        const r = el.getBoundingClientRect();
        if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
          hitWord = round.find((a) => a.japanese === key) ?? null;
          break;
        }
      }
      setAttempts((n) => n + 1);
      if (hitWord && hitWord.japanese === d.animal.japanese) {
        setMatched((m) => new Set(m).add(d.animal.japanese));
        setScore((s) => s + 1);
      } else if (hitWord) {
        setWrong(d.animal.japanese);
        setTimeout(() => setWrong(null), 500);
      }
      return null;
    });
  }, [round]);

  // Global pointer listeners while dragging
  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => moveDrag(e.clientX, e.clientY);
    const onUp = (e: PointerEvent) => endDrag(e.clientX, e.clientY);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, moveDrag, endDrag]);

  // Confirmed match lines (redrawn on layout — recompute each render via refs)
  const [lines, setLines] = useState<{ key: string; from: Point; to: Point }[]>([]);
  useEffect(() => {
    const container = containerRef.current?.getBoundingClientRect();
    if (!container) return;
    const next: { key: string; from: Point; to: Point }[] = [];
    matched.forEach((key) => {
      const cardEl = cardRefs.current.get(key);
      const wordEl = wordRefs.current.get(key);
      if (cardEl && wordEl) {
        next.push({ key, from: centerOf(cardEl, container), to: centerOf(wordEl, container) });
      }
    });
    setLines(next);
  }, [matched, round]);

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: "linear-gradient(160deg,#fef3f2,#fce7f3 50%,#ede9fe)" }}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h1 className="text-xl font-black text-gray-800">🐾 どうぶつマッチ</h1>
          <p className="text-xs text-gray-500 font-bold">Drag animal → matching word</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white shadow">
            <span className="text-sm font-black text-purple-600">{score}/{round.length}</span>
          </div>
          <button
            onClick={newRound}
            className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-white shadow font-black text-xs text-gray-600 active:scale-95 transition-all"
          >
            🔀 Next
          </button>
        </div>
      </div>

      {/* Game area */}
      <div ref={containerRef} className="flex-1 relative px-4 pb-6 select-none touch-none">
        {/* SVG lines for confirmed matches */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {lines.map((l) => (
            <line key={l.key} x1={l.from.x} y1={l.from.y} x2={l.to.x} y2={l.to.y}
              stroke="#22c55e" strokeWidth={4} strokeLinecap="round" strokeDasharray="2 8" />
          ))}
          {drag && (
            <line x1={drag.from.x} y1={drag.from.y} x2={drag.pos.x} y2={drag.pos.y}
              stroke="#8b5cf6" strokeWidth={4} strokeLinecap="round" strokeDasharray="2 8" />
          )}
        </svg>

        <div className="flex justify-between h-full gap-6 max-w-md mx-auto">
          {/* Left: animal cards */}
          <div className="flex-1 flex flex-col justify-around gap-2">
            {round.map((a) => {
              const isMatched = matched.has(a.japanese);
              const isWrong = wrong === a.japanese;
              const isDragging = drag?.animal.japanese === a.japanese;
              return (
                <div
                  key={a.japanese}
                  ref={(el) => { if (el) cardRefs.current.set(a.japanese, el); }}
                  onPointerDown={(e) => { e.preventDefault(); startDrag(a, e.clientX, e.clientY); }}
                  className={`relative z-20 flex items-center justify-center rounded-3xl transition-all ${
                    isMatched ? "opacity-40" : "cursor-grab active:cursor-grabbing"
                  } ${isWrong ? "animate-pulse" : ""}`}
                  style={{
                    width: 72, height: 72,
                    background: isMatched ? "#dcfce7" : isWrong ? "#fee2e2" : "#fff",
                    border: `3px solid ${isMatched ? "#22c55e" : isWrong ? "#ef4444" : "#e9d5ff"}`,
                    boxShadow: isDragging ? "0 8px 24px rgba(139,92,246,0.4)" : "0 4px 12px rgba(0,0,0,0.08)",
                    transform: isDragging ? "scale(1.15)" : "scale(1)",
                    opacity: isDragging ? 0.3 : undefined,
                  }}
                >
                  <span style={{ fontSize: 36 }}>{a.emoji}</span>
                  {isMatched && <span className="absolute -top-1 -right-1 text-lg">✅</span>}
                </div>
              );
            })}
          </div>

          {/* Right: hiragana words */}
          <div className="flex-1 flex flex-col justify-around gap-2">
            {wordOrder.map((a) => {
              const isMatched = matched.has(a.japanese);
              return (
                <div
                  key={a.japanese}
                  ref={(el) => { if (el) wordRefs.current.set(a.japanese, el); }}
                  className="flex items-center justify-center rounded-3xl px-3 transition-all"
                  style={{
                    height: 72,
                    background: isMatched ? "#dcfce7" : "#fff",
                    border: `3px solid ${isMatched ? "#22c55e" : "#bfdbfe"}`,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    opacity: isMatched ? 0.6 : 1,
                  }}
                >
                  <span className="font-black text-gray-700" style={{ fontSize: 20 }}>{a.japanese}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drag ghost */}
        {drag && (
          <div
            className="absolute z-30 pointer-events-none flex items-center justify-center rounded-3xl"
            style={{
              left: drag.pos.x - 36, top: drag.pos.y - 36,
              width: 72, height: 72,
              background: "#fff", border: "3px solid #8b5cf6",
              boxShadow: "0 8px 24px rgba(139,92,246,0.5)",
            }}
          >
            <span style={{ fontSize: 36 }}>{drag.animal.emoji}</span>
          </div>
        )}
      </div>

      {/* Win overlay */}
      {allMatched && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-3xl p-6 text-center shadow-2xl mx-6">
            <div className="text-5xl mb-2">🎉</div>
            <h2 className="text-xl font-black text-gray-800 mb-1">よくできました！</h2>
            <p className="text-sm text-gray-500 mb-4">
              {score}/{attempts} correct on first try
            </p>
            <button
              onClick={newRound}
              className="w-full py-3 rounded-2xl font-black text-white active:scale-95"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}
            >
              ▶ つぎのラウンド
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
