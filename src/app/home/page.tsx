"use client";

import { useState, useRef, useCallback } from "react";
import { HOME_ITEMS, VocabItem } from "@/constants/homeitems";
import { useSpeech } from "@/hooks/useSpeech";

interface PlacedItem {
  id: number;
  item: VocabItem;
  x: number;
  y: number;
  size: number;
  rotate: number;
  tapped: boolean;
}

function buildLayout(items: VocabItem[]): PlacedItem[] {
  const COLS = 5, ROWS = 5;
  const cellW = 88 / COLS;
  const cellH = 76 / ROWS;

  const cells: { x: number; y: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      cells.push({
        x: 6 + c * cellW + cellW * 0.1 + Math.random() * cellW * 0.8,
        y: 6 + r * cellH + cellH * 0.1 + Math.random() * cellH * 0.8,
      });
    }
  }
  cells.sort(() => Math.random() - 0.5);

  const shuffled = [...items].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, cells.length).map((item, i) => ({
    id: i,
    item,
    x: cells[i].x,
    y: cells[i].y,
    size: 38 + Math.floor(Math.random() * 26),
    rotate: (Math.random() - 0.5) * 18,
    tapped: false,
  }));
}

export default function HomePage() {
  const [placed, setPlaced] = useState<PlacedItem[]>(() => buildLayout(HOME_ITEMS));
  const [active, setActive] = useState<VocabItem | null>(null);
  const { speak } = useSpeech();
  const labelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const handleTap = useCallback((p: PlacedItem) => {
    speak(p.item.japanese);

    setActive(p.item);
    if (labelTimer.current) clearTimeout(labelTimer.current);
    labelTimer.current = setTimeout(() => setActive(null), 2200);

    setPlaced((prev) =>
      prev.map((i) => (i.id === p.id ? { ...i, tapped: true } : i))
    );
    if (tapTimers.current.has(p.id)) clearTimeout(tapTimers.current.get(p.id));
    const t = setTimeout(() => {
      setPlaced((prev) =>
        prev.map((i) => (i.id === p.id ? { ...i, tapped: false } : i))
      );
      tapTimers.current.delete(p.id);
    }, 400);
    tapTimers.current.set(p.id, t);
  }, [speak]);

  const shuffle = () => {
    setPlaced(buildLayout(HOME_ITEMS));
    setActive(null);
    if (labelTimer.current) clearTimeout(labelTimer.current);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-amber-50 via-yellow-50 to-lime-50 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex-shrink-0 z-20 bg-white/90 backdrop-blur border-b border-amber-100 shadow-sm px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">🏠 Home Items</h1>
          <p className="text-xs text-gray-400">Tap anything to hear its Japanese name</p>
        </div>
        <button
          onClick={shuffle}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-600 font-black text-xs active:scale-95 transition-all"
        >
          <span className="text-lg">🔀</span>
          Shuffle
        </button>
      </div>

      {/* ── Items area ── */}
      <div className="flex-1 relative overflow-hidden">
        {placed.map((p) => (
          <button
            key={p.id}
            onClick={() => handleTap(p)}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: `${p.size}px`,
              transform: `translate(-50%, -50%) rotate(${p.rotate}deg) scale(${p.tapped ? 1.4 : 1})`,
              lineHeight: 1,
              transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
              userSelect: "none",
              WebkitUserSelect: "none",
              touchAction: "manipulation",
              zIndex: p.tapped ? 20 : 1,
            }}
            className="focus:outline-none"
            aria-label={p.item.english}
          >
            {p.item.emoji}
          </button>
        ))}
      </div>

      {/* ── Floating label card ── */}
      {active && (
        <div
          key={active.japanese}
          className="fixed bottom-28 left-1/2 z-50 animate-fade-in"
          style={{ transform: "translateX(-50%)" }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-amber-100 px-6 py-4 flex items-center gap-4 min-w-[220px]">
            <span className="text-5xl">{active.emoji}</span>
            <div>
              <p className="text-3xl font-black text-gray-800 leading-tight">{active.japanese}</p>
              <p className="text-base font-bold text-blue-500">{active.romaji}</p>
              <p className="text-sm text-gray-400">{active.english}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
