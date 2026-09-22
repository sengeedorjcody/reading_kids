"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSpeech } from "@/hooks/useSpeech";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { ITopic, ITopicSentence } from "@/types";

type Phase = "exam" | "roundResult" | "done";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Quiz card ──────────────────────────────────────────────────────────────
function QuizScreen({
  deck,
  currentIndex,
  round,
  topicId,
  onSwipe,
}: {
  deck: ITopicSentence[];
  currentIndex: number;
  round: number;
  topicId: string;
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

  const rotation = flyDir ? (flyDir === "right" ? 25 : -25) : (dragX / 10);
  const translateX = flyDir ? (flyDir === "right" ? 600 : -600) : dragX;
  const cardOpacity = flyDir ? 0 : 1;

  const knowOpacity = Math.min(1, Math.max(0, dragX / 100));
  const dontOpacity = Math.min(1, Math.max(0, -dragX / 100));

  return (
    <div className="flex flex-col px-4 pt-6 pb-28 max-w-md mx-auto w-full select-none overflow-hidden" style={{ height: "100dvh" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/sentences/${topicId}`}
            className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl active:scale-90 flex-shrink-0"
          >
            ←
          </Link>
          <div className="flex flex-col">
            <span className="text-white font-black text-lg">
              {round === 1 ? "Round 1" : "Round 2 🔁"}
            </span>
            <span className="text-white/50 text-xs">{currentIndex + 1} / {deck.length}</span>
          </div>
        </div>
        <button
          onClick={() => speak(card.japanese)}
          className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl active:scale-90"
        >
          🔊
        </button>
      </div>

      <div className="h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress * 100}%`,
            background: round === 1 ? "linear-gradient(90deg, #f97316, #ec4899)" : "linear-gradient(90deg, #3b82f6, #8b5cf6)",
          }}
        />
      </div>

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
          <button
            type="button"
            onClick={() => speak(card.japanese)}
            className="w-full rounded-3xl flex flex-col items-center justify-center py-10 px-6 shadow-2xl text-center"
            style={{
              background: "linear-gradient(135deg, rgba(249,115,22,0.25), rgba(236,72,153,0.25))",
              border: "2px solid rgba(249,115,22,0.4)",
              backdropFilter: "blur(10px)",
            }}
          >
            {card.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.imageUrl} alt="" className="w-32 h-32 object-cover rounded-2xl mb-5 shadow-lg" />
            )}
            <span className="text-3xl leading-snug font-black text-white mb-4" style={{ textShadow: "0 4px 30px rgba(255,255,255,0.2)" }}>
              {card.japanese}
            </span>
            <span className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm"
              style={{ background: "rgba(249,115,22,0.25)", border: "1px solid rgba(249,115,22,0.5)", color: "#fb923c" }}>
              🔊 Tap to listen
            </span>
          </button>
        </div>
      </div>

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

// ── Round result screen ──────────────────────────────────────────────────
function RoundResultScreen({
  round,
  known,
  unknown,
  topicId,
  onNextRound,
  onFinish,
}: {
  round: number;
  known: ITopicSentence[];
  unknown: ITopicSentence[];
  topicId: string;
  onNextRound: () => void;
  onFinish: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 pt-12 pb-28 gap-6 max-w-md mx-auto w-full">
      <Link href={`/sentences/${topicId}`} className="self-start text-white/50 hover:text-white text-sm font-bold">
        ← Back to Sentences
      </Link>

      <div className="text-center">
        <div className="text-5xl mb-3">{round === 1 ? "🎯" : "🎊"}</div>
        <h2 className="text-3xl font-black text-white mb-1">Round {round} Done!</h2>
      </div>

      <div className="flex gap-4 w-full max-w-xs">
        <div className="flex-1 rounded-2xl py-5 text-center" style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.3)" }}>
          <div className="text-4xl font-black text-green-400">{known.length}</div>
          <div className="text-xs font-bold text-green-400/70 mt-1">Know it ✓</div>
        </div>
        <div className="flex-1 rounded-2xl py-5 text-center" style={{ background: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.3)" }}>
          <div className="text-4xl font-black text-red-400">{unknown.length}</div>
          <div className="text-xs font-bold text-red-400/70 mt-1">Not yet ✗</div>
        </div>
      </div>

      {unknown.length > 0 && (
        <div className="w-full max-w-xs">
          <p className="text-white/50 text-xs font-bold uppercase tracking-wide mb-3 text-center">Practice Again</p>
          <div className="flex flex-col gap-2">
            {unknown.map((s) => (
              <div key={s._id} className="rounded-xl px-3 py-2 text-white text-sm font-bold text-center"
                style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}>
                {s.japanese}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs mt-auto">
        {round === 1 && unknown.length > 0 && (
          <button
            onClick={onNextRound}
            className="w-full py-4 rounded-2xl font-black text-white text-lg active:scale-95 shadow-lg"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            🔁 Practice unknown sentences
          </button>
        )}
        <button
          onClick={onFinish}
          className="w-full py-4 rounded-2xl font-black text-white text-lg active:scale-95 shadow-lg"
          style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)" }}
        >
          📊 See Results
        </button>
      </div>
    </div>
  );
}

// ── Done / Results screen ────────────────────────────────────────────────
function DoneScreen({
  finalUnknown,
  totalCards,
  topicId,
  onRestart,
}: {
  finalUnknown: ITopicSentence[];
  totalCards: number;
  topicId: string;
  onRestart: () => void;
}) {
  const { speak } = useSpeech();
  const score = totalCards - finalUnknown.length;
  const pct = Math.round((score / totalCards) * 100);

  return (
    <div className="min-h-screen flex flex-col px-4 pt-10 pb-28 gap-6 max-w-md mx-auto w-full">
      <Link href={`/sentences/${topicId}`} className="self-start text-white/50 hover:text-white text-sm font-bold">
        ← Back to Sentences
      </Link>

      <div className="rounded-3xl p-6 text-center"
        style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(14,165,233,0.2))", border: "2px solid rgba(16,185,129,0.3)" }}>
        <div className="text-6xl mb-2">{pct >= 90 ? "🏆" : pct >= 70 ? "⭐" : pct >= 50 ? "💪" : "📚"}</div>
        <p className="text-5xl font-black text-white">{pct}%</p>
        <p className="text-white/60 text-sm mt-1">{score} / {totalCards} sentences</p>
        <p className="text-white/40 text-xs mt-1">
          {pct >= 90 ? "Amazing! Perfect!" : pct >= 70 ? "Well done!" : pct >= 50 ? "Keep going!" : "Let's practice more!"}
        </p>
      </div>

      {finalUnknown.length > 0 ? (
        <div>
          <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-3 text-center">
            Sentences you haven&apos;t learned yet
          </p>
          <div className="flex flex-col gap-3">
            {finalUnknown.map((s) => (
              <div key={s._id} className="rounded-2xl p-4 flex items-center gap-4"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <button
                  onClick={() => speak(s.japanese)}
                  className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl active:scale-90"
                  style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.3), rgba(236,72,153,0.3))" }}>
                  🔊
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black leading-snug">{s.japanese}</p>
                  {s.romaji && <p className="text-white/60 text-sm">{s.romaji}</p>}
                  {s.english_meaning && <p className="text-white/40 text-xs">{s.english_meaning}</p>}
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

      <div className="flex flex-col gap-3">
        <button
          onClick={onRestart}
          className="w-full py-4 rounded-2xl font-black text-white text-lg active:scale-95"
          style={{ background: "linear-gradient(135deg, #f97316, #ec4899)" }}
        >
          🔄 Try Again
        </button>
        <Link
          href={`/sentences/${topicId}`}
          className="w-full py-4 rounded-2xl font-black text-white text-lg active:scale-95 text-center"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          ← Back to Sentences
        </Link>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────
export default function SentenceQuizView({ topic, sentences }: { topic: ITopic; sentences: ITopicSentence[] }) {
  const [phase, setPhase] = useState<Phase>("exam");
  useLockBodyScroll(phase === "exam");
  const [round, setRound] = useState(1);
  const [deck, setDeck] = useState<ITopicSentence[]>(() => shuffle(sentences));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [known, setKnown] = useState<ITopicSentence[]>([]);
  const [unknown, setUnknown] = useState<ITopicSentence[]>([]);
  const [totalCards] = useState(sentences.length);

  if (sentences.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-4 text-center">
        <div className="text-6xl">🗣️</div>
        <p className="text-white/60 font-bold">This topic has no sentences yet.</p>
        <Link href={`/sentences/${topic._id}`} className="text-pink-400 font-bold">← Back to Sentences</Link>
      </div>
    );
  }

  const handleSwipe = (dir: "left" | "right") => {
    const card = deck[currentIndex];
    const newKnown = dir === "right" ? [...known, card] : known;
    const newUnknown = dir === "left" ? [...unknown, card] : unknown;
    setKnown(newKnown);
    setUnknown(newUnknown);

    if (currentIndex + 1 >= deck.length) {
      setPhase("roundResult");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const startRound2 = () => {
    setDeck(shuffle(unknown));
    setCurrentIndex(0);
    setKnown([]);
    setUnknown([]);
    setRound(2);
    setPhase("exam");
  };

  const goToResults = () => setPhase("done");

  const restart = () => {
    setDeck(shuffle(sentences));
    setCurrentIndex(0);
    setKnown([]);
    setUnknown([]);
    setRound(1);
    setPhase("exam");
  };

  if (phase === "exam") {
    return <QuizScreen deck={deck} currentIndex={currentIndex} round={round} topicId={topic._id} onSwipe={handleSwipe} />;
  }

  if (phase === "roundResult") {
    return (
      <RoundResultScreen round={round} known={known} unknown={unknown} topicId={topic._id} onNextRound={startRound2} onFinish={goToResults} />
    );
  }

  return (
    <DoneScreen finalUnknown={unknown} totalCards={totalCards} topicId={topic._id} onRestart={restart} />
  );
}
