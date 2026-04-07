"use client";

import { useState, useRef, useCallback } from "react";
import { ANIMALS, Animal } from "@/constants/animals";
import { useSpeech } from "@/hooks/useSpeech";

interface PlacedAnimal {
  id: number;
  animal: Animal;
  x: number;   // % left
  y: number;   // % top
  size: number; // emoji font-size px
  rotate: number;
  tapped: boolean; // briefly true for scale animation
}

// Grid-based placement: 6 cols × 5 rows = 30 cells, use first 30 animals
function buildLayout(animals: Animal[]): PlacedAnimal[] {
  const COLS = 5, ROWS = 6;
  const cellW = 88 / COLS;
  const cellH = 76 / ROWS; // cap Y to stay above bottom nav

  // Build & shuffle cells
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

  // Shuffle animals
  const shuffled = [...animals].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, cells.length).map((animal, i) => ({
    id: i,
    animal,
    x: cells[i].x,
    y: cells[i].y,
    size: 36 + Math.floor(Math.random() * 28), // 36–64px emoji
    rotate: (Math.random() - 0.5) * 20,
    tapped: false,
  }));
}

export default function AnimalsPage() {
  const [items, setItems] = useState<PlacedAnimal[]>(() => buildLayout(ANIMALS));
  const [active, setActive] = useState<Animal | null>(null);
  const { speak } = useSpeech();
  const labelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const handleTap = useCallback((item: PlacedAnimal) => {
    // Speak the Japanese name
    speak(item.animal.japanese);

    // Show the label card
    setActive(item.animal);
    if (labelTimer.current) clearTimeout(labelTimer.current);
    labelTimer.current = setTimeout(() => setActive(null), 2200);

    // Bounce animation on the tapped emoji
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, tapped: true } : i))
    );
    if (tapTimers.current.has(item.id)) clearTimeout(tapTimers.current.get(item.id));
    const t = setTimeout(() => {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, tapped: false } : i))
      );
      tapTimers.current.delete(item.id);
    }, 400);
    tapTimers.current.set(item.id, t);
  }, [speak]);

  const shuffle = () => {
    setItems(buildLayout(ANIMALS));
    setActive(null);
    if (labelTimer.current) clearTimeout(labelTimer.current);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex-shrink-0 z-20 bg-white/90 backdrop-blur border-b border-green-100 shadow-sm px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">🐾 Animal Sounds</h1>
          <p className="text-xs text-gray-400">Tap any animal to hear its Japanese name</p>
        </div>
        <button
          onClick={shuffle}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl bg-orange-100 hover:bg-orange-200 text-orange-600 font-black text-xs active:scale-95 transition-all"
        >
          <span className="text-lg">🔀</span>
          Shuffle
        </button>
      </div>

      {/* ── Animal area ── */}
      <div className="flex-1 relative overflow-hidden">
        {items.map((item) => (
          <button
            key={item.id}
            onPointerDown={(e) => {
              e.preventDefault();
              handleTap(item);
            }}
            style={{
              position: "absolute",
              left: `${item.x}%`,
              top: `${item.y}%`,
              fontSize: `${item.size}px`,
              transform: `translate(-50%, -50%) rotate(${item.rotate}deg) scale(${item.tapped ? 1.4 : 1})`,
              lineHeight: 1,
              transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
              userSelect: "none",
              WebkitUserSelect: "none",
              touchAction: "none",
              zIndex: item.tapped ? 20 : 1,
            }}
            className="focus:outline-none"
            aria-label={item.animal.english}
          >
            {item.animal.emoji}
          </button>
        ))}
      </div>

      {/* ── Floating label card (fixed above bottom nav) ── */}
      {active && (
        <div
          key={active.japanese}
          className="fixed bottom-28 left-1/2 z-50 animate-fade-in"
          style={{ transform: "translateX(-50%)" }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 px-6 py-4 flex items-center gap-4 min-w-[220px]">
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
