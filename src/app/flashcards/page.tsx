"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { IDictionaryWord } from "@/types";
import { useSpeech } from "@/hooks/useSpeech";

const ROUND_SIZE = 20;
const MAX_WRONG = 5;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Exam-style flash card screen ──────────────────────────────────────────────
function FlashExamScreen({
  deck,
  currentIndex,
  wrongCount,
  onSwipe,
}: {
  deck: IDictionaryWord[];
  currentIndex: number;
  wrongCount: number;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const { speak } = useSpeech();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [dragX, setDragX] = useState(0);
  const [flyDir, setFlyDir] = useState<"left" | "right" | null>(null);
  const isDragging = useRef(false);
  const dragXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const onSwipeRef = useRef(onSwipe);
  useEffect(() => { onSwipeRef.current = onSwipe; }, [onSwipe]);

  const card = deck[currentIndex];
  const progress = currentIndex / deck.length;

  if (!card) return null;

  const triggerSwipe = (dir: "left" | "right") => {
    if (flyDir) return;
    setFlyDir(dir);
    setTimeout(() => {
      setFlyDir(null);
      setDragX(0);
      dragXRef.current = 0;
      onSwipeRef.current(dir);
    }, 280);
  };

  const triggerSwipeRef = useRef(triggerSwipe);
  triggerSwipeRef.current = triggerSwipe;

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      isDragging.current = true;
      dragXRef.current = 0;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;
      if (Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault();
        dragXRef.current = dx;
        setDragX(dx);
      }
    };
    const handleTouchEnd = () => {
      isDragging.current = false;
      if (Math.abs(dragXRef.current) > 70) {
        triggerSwipeRef.current(dragXRef.current > 0 ? "right" : "left");
      } else {
        setDragX(0);
        dragXRef.current = 0;
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rotation = flyDir ? (flyDir === "right" ? 25 : -25) : dragX / 10;
  const translateX = flyDir ? (flyDir === "right" ? 600 : -600) : dragX;
  const cardOpacity = flyDir ? 0 : 1;

  const knowOpacity = Math.min(1, Math.max(0, dragX / 100));
  const dontOpacity = Math.min(1, Math.max(0, -dragX / 100));

  return (
    <div className="flex flex-col px-4 pt-6 pb-28 select-none overflow-hidden" style={{ height: "100dvh" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-white font-black text-lg">🃏 Flashcards</span>
          <span className="text-white/50 text-xs">
            {currentIndex + 1} / {deck.length} · ✗ {wrongCount}/{MAX_WRONG}
          </span>
        </div>
        <button
          onClick={() => speak(card.japanese_word)}
          className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl active:scale-90"
        >
          🔊
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progress * 100}%`, background: "linear-gradient(90deg, #ec4899, #8b5cf6)" }}
        />
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center relative">
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 rounded-3xl"
          style={{ opacity: knowOpacity, background: "rgba(34,197,94,0.15)" }}
        >
          <span className="text-green-400 font-black text-3xl border-4 border-green-400 px-6 py-2 rounded-2xl rotate-[-20deg]">
            Know it ✓
          </span>
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 rounded-3xl"
          style={{ opacity: dontOpacity, background: "rgba(239,68,68,0.15)" }}
        >
          <span className="text-red-400 font-black text-3xl border-4 border-red-400 px-6 py-2 rounded-2xl rotate-[20deg]">
            Not yet ✗
          </span>
        </div>

        {/* The card */}
        <div
          ref={cardRef}
          className="w-full max-w-xs"
          style={{
            transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
            opacity: cardOpacity,
            transition: flyDir ? "transform 0.28s ease-out, opacity 0.28s ease-out" : "none",
            touchAction: "pan-y",
          }}
        >
          <div
            className="rounded-3xl flex flex-col items-center py-6 px-6 shadow-2xl gap-3"
            style={{
              background: "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(139,92,246,0.2))",
              border: "2px solid rgba(236,72,153,0.35)",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* English description on top */}
            <span className="text-lg font-black text-white text-center">
              🇬🇧 {card.english_meaning || "—"}
            </span>
            {card.mongolian_meaning && (
              <span className="text-sm font-bold text-white/50 text-center">
                🇲🇳 {card.mongolian_meaning}
              </span>
            )}

            {/* Image */}
            {card.example_image_url && (
              <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-white/90">
                <Image
                  src={card.example_image_url}
                  alt={card.japanese_word}
                  fill
                  className="object-contain"
                  sizes="320px"
                />
              </div>
            )}

            {/* Japanese word */}
            <span
              className="text-4xl font-black text-white text-center"
              style={{ fontFamily: "var(--font-noto-serif-jp), serif" }}
            >
              {card.japanese_word}
            </span>
            {card.romaji && <span className="text-sm text-white/50 italic">{card.romaji}</span>}

            <button
              onClick={(e) => { e.stopPropagation(); speak(card.japanese_word); }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs active:scale-90 transition-transform"
              style={{ background: "rgba(236,72,153,0.25)", border: "1px solid rgba(236,72,153,0.5)", color: "#f9a8d4" }}
            >
              🔊 Listen
            </button>
          </div>
        </div>
      </div>

      {/* Swipe hint + buttons */}
      <div className="mt-6 flex flex-col items-center gap-4">
        <p className="text-white/30 text-xs">← Not yet　｜　Know it →</p>
        <div className="flex gap-6">
          <button
            onClick={() => triggerSwipe("left")}
            className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400/50 text-red-400 text-2xl font-black flex items-center justify-center active:scale-90 transition-transform"
          >
            ✗
          </button>
          <button
            onClick={() => triggerSwipe("right")}
            className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400/50 text-green-400 text-2xl font-black flex items-center justify-center active:scale-90 transition-transform"
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Result screen ─────────────────────────────────────────────────────────────
function ResultScreen({
  known,
  unknown,
  attempted,
  stoppedEarly,
  onRestart,
}: {
  known: IDictionaryWord[];
  unknown: IDictionaryWord[];
  attempted: number;
  stoppedEarly: boolean;
  onRestart: () => void;
}) {
  const { speak } = useSpeech();

  return (
    <div className="min-h-screen flex flex-col px-4 pt-10 pb-28 gap-6">
      <div className="rounded-3xl p-6 text-center"
        style={{
          background: unknown.length === 0
            ? "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(14,165,233,0.2))"
            : "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(139,92,246,0.2))",
          border: unknown.length === 0 ? "2px solid rgba(16,185,129,0.3)" : "2px solid rgba(236,72,153,0.3)",
        }}
      >
        <div className="text-6xl mb-2">
          {stoppedEarly ? "😅" : unknown.length === 0 ? "🏆" : unknown.length <= 2 ? "⭐" : "💪"}
        </div>
        <p className="text-3xl font-black text-white">
          {stoppedEarly ? "Round stopped" : "Round done!"}
        </p>
        <p className="text-white/60 text-sm mt-1">
          ✓ {known.length}　✗ {unknown.length}　·　{attempted} cards
        </p>
        {stoppedEarly && (
          <p className="text-white/40 text-xs mt-2">
            5 misses reached — let&apos;s review these words!
          </p>
        )}
      </div>

      {unknown.length > 0 ? (
        <div>
          <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-3 text-center">
            Words to review
          </p>
          <div className="flex flex-col gap-3">
            {unknown.map((w) => (
              <div key={w._id}
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                {w.example_image_url ? (
                  <button
                    onClick={() => speak(w.japanese_word)}
                    className="relative w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden bg-white/90 active:scale-90"
                  >
                    <Image src={w.example_image_url} alt={w.japanese_word} fill className="object-contain" sizes="64px" />
                  </button>
                ) : (
                  <button
                    onClick={() => speak(w.japanese_word)}
                    className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl font-black text-white active:scale-90"
                    style={{
                      background: "linear-gradient(135deg, rgba(236,72,153,0.3), rgba(139,92,246,0.3))",
                      fontFamily: "var(--font-noto-serif-jp), serif",
                    }}
                  >
                    {w.japanese_word}
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-black text-lg" style={{ fontFamily: "var(--font-noto-serif-jp), serif" }}>
                    {w.japanese_word}
                  </div>
                  {w.english_meaning && <div className="text-white/60 text-sm">🇬🇧 {w.english_meaning}</div>}
                  {w.mongolian_meaning && <div className="text-white/40 text-xs">🇲🇳 {w.mongolian_meaning}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-3">🎉</div>
          <p className="text-2xl font-black text-green-400">You know them all!</p>
        </div>
      )}

      <button
        onClick={onRestart}
        className="w-full py-4 rounded-2xl font-black text-white text-lg active:scale-95 mt-2"
        style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}
      >
        🔄 New round
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FlashcardsPage() {
  const [phase, setPhase] = useState<"loading" | "exam" | "done">("loading");
  const [deck, setDeck] = useState<IDictionaryWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [known, setKnown] = useState<IDictionaryWord[]>([]);
  const [unknown, setUnknown] = useState<IDictionaryWord[]>([]);
  const [stoppedEarly, setStoppedEarly] = useState(false);

  const startRound = useCallback(async () => {
    setPhase("loading");
    try {
      const res = await fetch("/api/dictionary?limit=300");
      const data = await res.json();
      const all: IDictionaryWord[] = data.words ?? [];
      const cards = shuffle(all).slice(0, ROUND_SIZE);
      setDeck(cards);
      setCurrentIndex(0);
      setKnown([]);
      setUnknown([]);
      setStoppedEarly(false);
      setPhase(cards.length > 0 ? "exam" : "done");
    } catch {
      setDeck([]);
      setPhase("done");
    }
  }, []);

  useEffect(() => { startRound(); }, [startRound]);

  const handleSwipe = (dir: "left" | "right") => {
    const card = deck[currentIndex];
    const newKnown = dir === "right" ? [...known, card] : known;
    const newUnknown = dir === "left" ? [...unknown, card] : unknown;
    setKnown(newKnown);
    setUnknown(newUnknown);

    if (dir === "left" && newUnknown.length >= MAX_WRONG) {
      setStoppedEarly(true);
      setPhase("done");
      return;
    }

    if (currentIndex + 1 >= deck.length) {
      setPhase("done");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (phase === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-pink-200/30 border-t-pink-400 rounded-full animate-spin" />
        <p className="text-white/50 font-bold">Loading cards…</p>
      </div>
    );
  }

  if (phase === "exam" && deck.length > 0) {
    return (
      <FlashExamScreen
        deck={deck}
        currentIndex={currentIndex}
        wrongCount={unknown.length}
        onSwipe={handleSwipe}
      />
    );
  }

  if (deck.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="text-8xl">📭</div>
        <p className="text-2xl font-bold text-white/50">No words found</p>
        <p className="text-white/30 text-sm">Add words to the dictionary first</p>
      </div>
    );
  }

  return (
    <ResultScreen
      known={known}
      unknown={unknown}
      attempted={currentIndex + 1}
      stoppedEarly={stoppedEarly}
      onRestart={startRound}
    />
  );
}
