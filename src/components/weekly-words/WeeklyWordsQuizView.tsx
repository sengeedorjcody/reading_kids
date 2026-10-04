"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSpeech } from "@/hooks/useSpeech";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { IWeeklyWords, IWeeklyWordItem } from "@/types";

type Phase = "exam" | "roundResult" | "done";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Quiz Card Screen ────────────────────────────────────────────────────────
function QuizScreen({
  week,
  deck,
  currentIndex,
  round,
  onSwipe,
}: {
  week: IWeeklyWords;
  deck: IWeeklyWordItem[];
  currentIndex: number;
  round: number;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const { speak } = useSpeech();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [dragX, setDragX] = useState(0);
  const [flyDir, setFlyDir] = useState<"left" | "right" | null>(null);
  const [flipped, setFlipped] = useState(false);
  const isDragging = useRef(false);
  const dragXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const onSwipeRef = useRef(onSwipe);
  useEffect(() => {
    onSwipeRef.current = onSwipe;
  }, [onSwipe]);

  // Reset flip state when card changes
  useEffect(() => {
    setFlipped(false);
  }, [currentIndex]);

  const card = deck[currentIndex];
  const progress = deck.length > 0 ? currentIndex / deck.length : 0;

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

    // Pointer events for desktop drag support
    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      touchStartX.current = e.clientX;
      touchStartY.current = e.clientY;
      isDragging.current = true;
      dragXRef.current = 0;
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current || e.pointerType === "touch") return;
      const dx = e.clientX - touchStartX.current;
      dragXRef.current = dx;
      setDragX(dx);
    };
    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging.current || e.pointerType === "touch") return;
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

    el.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);

      el.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  if (!card) return null;

  const rotation = flyDir ? (flyDir === "right" ? 25 : -25) : dragX / 10;
  const translateX = flyDir ? (flyDir === "right" ? 600 : -600) : dragX;
  const cardOpacity = flyDir ? 0 : 1;

  const knowOpacity = Math.min(1, Math.max(0, dragX / 100));
  const dontOpacity = Math.min(1, Math.max(0, -dragX / 100));

  // The front side shows ONLY the hiragana (or kana word)
  const hiraganaFront = card.hiragana || card.japanese_word;

  return (
    <div
      className="flex flex-col px-4 pt-6 pb-28 max-w-md mx-auto w-full select-none overflow-hidden"
      style={{ height: "100dvh" }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/weekly-words"
            className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl text-white active:scale-90 flex-shrink-0 hover:bg-white/20 transition-all"
          >
            ←
          </Link>
          <div className="flex flex-col">
            <span className="text-white font-black text-lg">
              {week.title} · {round === 1 ? "Round 1" : "Round 2 🔁"}
            </span>
            <span className="text-white/50 text-xs">
              {currentIndex + 1} / {deck.length} words
            </span>
          </div>
        </div>
        <button
          onClick={() =>
            speak(card.japanese_word, card.pronunciation_audio_url)
          }
          className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl active:scale-90 hover:bg-white/20 transition-all"
          title="Listen"
        >
          🔊
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress * 100}%`,
            background:
              round === 1
                ? "linear-gradient(90deg, #3b82f6, #8b5cf6)"
                : "linear-gradient(90deg, #10b981, #06b6d4)",
          }}
        />
      </div>

      {/* Swipe Overlay & Card */}
      <div className="flex-1 flex items-center justify-center relative">
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 rounded-3xl transition-opacity"
          style={{ opacity: knowOpacity, background: "rgba(34,197,94,0.18)" }}
        >
          <span className="text-green-400 font-black text-3xl border-4 border-green-400 px-6 py-2 rounded-2xl rotate-[-20deg] shadow-lg">
            Know it ✓
          </span>
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 rounded-3xl transition-opacity"
          style={{ opacity: dontOpacity, background: "rgba(239,68,68,0.18)" }}
        >
          <span className="text-red-400 font-black text-3xl border-4 border-red-400 px-6 py-2 rounded-2xl rotate-[20deg] shadow-lg">
            Not yet ✗
          </span>
        </div>

        <div
          ref={cardRef}
          className="w-full max-w-xs cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
            opacity: cardOpacity,
            transition: flyDir
              ? "transform 0.28s ease-out, opacity 0.28s ease-out"
              : "none",
            touchAction: "pan-y",
          }}
        >
          {/* 3D Flip Card Container */}
          <div
            className="flashcard-container w-full cursor-pointer select-none"
            style={{ height: "min(430px, 62dvh)" }}
            onClick={() => setFlipped((f) => !f)}
          >
            <div
              className={`flashcard-inner w-full h-full relative${
                flipped ? " flipped" : ""
              }`}
            >
              {/* ── FRONT SIDE: ONLY HIRAGANA ── */}
              <div
                className="flashcard-front absolute inset-0 rounded-3xl flex flex-col items-center justify-center p-6 shadow-2xl text-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))",
                  border: "2px solid rgba(59,130,246,0.45)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {/* Big Hiragana text in the center */}
                <div className="flex-1 flex items-center justify-center w-full px-2">
                  <span
                    className="text-5xl sm:text-6xl font-black text-white leading-snug tracking-wide"
                    style={{
                      fontFamily: "var(--font-noto-serif-jp), serif",
                      textShadow: "0 4px 30px rgba(255,255,255,0.3)",
                    }}
                  >
                    {hiraganaFront}
                  </span>
                </div>

                {/* Bottom actions on front */}
                <div className="flex flex-col items-center gap-2 mt-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(card.japanese_word, card.pronunciation_audio_url);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                    style={{
                      background: "rgba(59,130,246,0.35)",
                      border: "1px solid rgba(59,130,246,0.6)",
                      color: "#93c5fd",
                    }}
                  >
                    🔊 Tap to listen
                  </button>
                  <span className="text-white/40 text-xs font-bold">
                    🔄 Tap card to flip · Дэлгэрэнгүй харах
                  </span>
                </div>
              </div>

              {/* ── BACK SIDE: FULL DETAIL ── */}
              <div
                className="flashcard-back absolute inset-0 rounded-3xl flex flex-col items-center justify-center py-5 px-5 shadow-2xl text-center overflow-y-auto"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(59,130,246,0.35), rgba(139,92,246,0.35))",
                  border: "2px solid rgba(59,130,246,0.5)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {/* Image if available */}
                {card.example_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.example_image_url}
                    alt={card.japanese_word}
                    className="w-24 h-24 object-contain bg-white/10 rounded-2xl mb-2 shadow-md p-1"
                  />
                )}

                {/* Hiragana reading */}
                {card.hiragana && card.hiragana !== card.japanese_word && (
                  <span className="text-sm text-pink-300 font-bold mb-0.5">
                    {card.hiragana}
                  </span>
                )}

                {/* Kanji / Japanese word */}
                <span
                  className="text-3xl sm:text-4xl leading-tight font-black text-white mb-1"
                  style={{
                    fontFamily: "var(--font-noto-serif-jp), serif",
                    textShadow: "0 4px 25px rgba(255,255,255,0.25)",
                  }}
                >
                  {card.japanese_word}
                </span>

                {/* Romaji */}
                {card.romaji && (
                  <span className="text-xs text-white/50 italic mb-2">
                    {card.romaji}
                  </span>
                )}

                {/* Meanings */}
                <div className="w-full bg-white/10 rounded-2xl p-2.5 mb-2 space-y-1 text-left">
                  {card.mongolian_meaning && (
                    <div className="text-xs sm:text-sm font-bold text-white flex items-start gap-1.5">
                      <span className="flex-shrink-0">🇲🇳</span>
                      <span>{card.mongolian_meaning}</span>
                    </div>
                  )}
                  {card.english_meaning && (
                    <div className="text-[11px] sm:text-xs text-white/70 flex items-start gap-1.5">
                      <span className="flex-shrink-0">🇬🇧</span>
                      <span>{card.english_meaning}</span>
                    </div>
                  )}
                </div>

                {/* Example sentence if available */}
                {card.example_sentence && (
                  <div className="w-full text-xs text-white/60 mb-2.5 bg-white/5 rounded-xl p-2 text-left border border-white/10">
                    <p className="font-bold text-white/80">
                      {card.example_sentence}
                    </p>
                    {card.example_sentence_reading && (
                      <p className="text-[11px] text-white/40 mt-0.5">
                        {card.example_sentence_reading}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions on back */}
                <div className="flex items-center gap-3 mt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(card.japanese_word, card.pronunciation_audio_url);
                    }}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-2xl font-bold text-xs active:scale-95 transition-transform"
                    style={{
                      background: "rgba(59,130,246,0.35)",
                      border: "1px solid rgba(59,130,246,0.6)",
                      color: "#93c5fd",
                    }}
                  >
                    🔊 Сонсох
                  </button>
                  <span className="text-white/40 text-[11px]">Буцах ↺</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe hint & Action buttons */}
      <div className="mt-4 flex flex-col items-center gap-3">
        <p className="text-white/40 text-xs">← Not yet　｜　Know it →</p>
        <div className="flex gap-8">
          <button
            onClick={() => triggerSwipe("left")}
            className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400/50 text-red-400 text-2xl font-black flex items-center justify-center active:scale-90 transition-transform shadow-lg hover:bg-red-500/30"
            title="Not yet (Swipe Left)"
          >
            ✗
          </button>
          <button
            onClick={() => triggerSwipe("right")}
            className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400/50 text-green-400 text-2xl font-black flex items-center justify-center active:scale-90 transition-transform shadow-lg hover:bg-green-500/30"
            title="Know it (Swipe Right)"
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Round Result Screen ───────────────────────────────────────────────────
function RoundResultScreen({
  week,
  round,
  known,
  unknown,
  onNextRound,
  onFinish,
}: {
  week: IWeeklyWords;
  round: number;
  known: IWeeklyWordItem[];
  unknown: IWeeklyWordItem[];
  onNextRound: () => void;
  onFinish: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 pt-12 pb-28 gap-6 max-w-md mx-auto w-full">
      <Link
        href="/weekly-words"
        className="self-start text-white/50 hover:text-white text-sm font-bold flex items-center gap-1"
      >
        ← Back to Weekly Words
      </Link>

      <div className="text-center">
        <div className="text-5xl mb-3">{round === 1 ? "🎯" : "🎊"}</div>
        <h2 className="text-3xl font-black text-white mb-1">
          {week.title} · Round {round} Done!
        </h2>
        <p className="text-white/50 text-xs">
          {round === 1 ? "First round finished" : "Practice round finished"}
        </p>
      </div>

      <div className="flex gap-4 w-full max-w-xs">
        <div
          className="flex-1 rounded-2xl py-5 text-center"
          style={{
            background: "rgba(34,197,94,0.15)",
            border: "2px solid rgba(34,197,94,0.3)",
          }}
        >
          <div className="text-4xl font-black text-green-400">{known.length}</div>
          <div className="text-xs font-bold text-green-400/70 mt-1">
            Know it ✓
          </div>
        </div>
        <div
          className="flex-1 rounded-2xl py-5 text-center"
          style={{
            background: "rgba(239,68,68,0.15)",
            border: "2px solid rgba(239,68,68,0.3)",
          }}
        >
          <div className="text-4xl font-black text-red-400">
            {unknown.length}
          </div>
          <div className="text-xs font-bold text-red-400/70 mt-1">
            Not yet ✗
          </div>
        </div>
      </div>

      {unknown.length > 0 && (
        <div className="w-full max-w-xs">
          <p className="text-white/50 text-xs font-bold uppercase tracking-wide mb-3 text-center">
            Words to Practice Again
          </p>
          <div className="flex flex-col gap-2">
            {unknown.map((w, idx) => (
              <div
                key={w._id || idx}
                className="rounded-xl px-4 py-2.5 text-white text-sm font-bold flex items-center justify-between"
                style={{
                  background: "rgba(239,68,68,0.2)",
                  border: "1px solid rgba(239,68,68,0.4)",
                }}
              >
                <span>{w.hiragana || w.japanese_word}</span>
                <span className="text-white/60 text-xs font-normal">
                  {w.mongolian_meaning || w.english_meaning}
                </span>
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
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            }}
          >
            🔁 Practice unknown words ({unknown.length})
          </button>
        )}
        <button
          onClick={onFinish}
          className="w-full py-4 rounded-2xl font-black text-white text-lg active:scale-95 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #10b981, #0ea5e9)",
          }}
        >
          📊 See Results
        </button>
      </div>
    </div>
  );
}

// ── Done / Results Screen ─────────────────────────────────────────────────
function DoneScreen({
  week,
  finalUnknown,
  totalCards,
  onRestart,
}: {
  week: IWeeklyWords;
  finalUnknown: IWeeklyWordItem[];
  totalCards: number;
  onRestart: () => void;
}) {
  const { data: session } = useSession();
  const { speak } = useSpeech();
  const score = totalCards - finalUnknown.length;
  const pct = totalCards > 0 ? Math.round((score / totalCards) * 100) : 0;
  const is100Percent = pct === 100 && totalCards > 0;
  const [savedDone, setSavedDone] = useState(false);

  // If 100% done, automatically save to backend (if logged in) and localStorage
  useEffect(() => {
    if (!is100Percent) return;

    // Cache in localStorage
    try {
      const stored = JSON.parse(
        localStorage.getItem("reading_kids_completed_weeks") || "[]"
      );
      if (!stored.includes(week.weekNumber)) {
        stored.push(week.weekNumber);
        localStorage.setItem(
          "reading_kids_completed_weeks",
          JSON.stringify(stored)
        );
      }
    } catch {}

    // Save to user profile in backend if logged in
    if (session?.user?.email) {
      fetch("/api/weekly-words/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekNumber: week.weekNumber }),
      })
        .then((res) => {
          if (res.ok) setSavedDone(true);
        })
        .catch(() => {});
    } else {
      setSavedDone(true);
    }
  }, [is100Percent, week.weekNumber, session]);

  return (
    <div className="min-h-screen flex flex-col px-4 pt-10 pb-28 gap-6 max-w-md mx-auto w-full">
      <Link
        href="/weekly-words"
        className="self-start text-white/50 hover:text-white text-sm font-bold flex items-center gap-1"
      >
        ← Back to Weekly Words
      </Link>

      <div
        className="rounded-3xl p-6 text-center shadow-xl"
        style={{
          background:
            pct >= 80
              ? "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(14,165,233,0.25))"
              : "linear-gradient(135deg, rgba(236,72,153,0.25), rgba(139,92,246,0.25))",
          border:
            pct >= 80
              ? "2px solid rgba(16,185,129,0.35)"
              : "2px solid rgba(236,72,153,0.35)",
        }}
      >
        <div className="text-6xl mb-2">
          {pct >= 90 ? "🏆" : pct >= 70 ? "⭐" : pct >= 50 ? "💪" : "📚"}
        </div>
        <p className="text-5xl font-black text-white">{pct}%</p>
        <p className="text-white/60 text-sm mt-1">
          {score} / {totalCards} words mastered
        </p>

        {is100Percent && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-400/40">
            <span>✓</span>
            <span>{savedDone ? "Completed & Marked as Done!" : "Marking as Done…"}</span>
          </div>
        )}

        <p className="text-white/40 text-xs mt-2">
          {pct >= 90
            ? "Amazing! Perfect job!"
            : pct >= 70
            ? "Well done! Keep it up!"
            : pct >= 50
            ? "Good effort! Practice makes perfect!"
            : "Let's review once more!"}
        </p>
      </div>

      {finalUnknown.length > 0 ? (
        <div>
          <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-3 text-center">
            Words to review
          </p>
          <div className="flex flex-col gap-3">
            {finalUnknown.map((w, idx) => (
              <div
                key={w._id || idx}
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <button
                  onClick={() =>
                    speak(w.japanese_word, w.pronunciation_audio_url)
                  }
                  className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl active:scale-90 shadow-md"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(59,130,246,0.35), rgba(139,92,246,0.35))",
                  }}
                  title="Listen"
                >
                  🔊
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-white font-black text-lg leading-snug"
                    style={{ fontFamily: "var(--font-noto-serif-jp), serif" }}
                  >
                    {w.japanese_word}
                  </p>
                  {w.hiragana && w.hiragana !== w.japanese_word && (
                    <p className="text-pink-300 text-xs">{w.hiragana}</p>
                  )}
                  {w.romaji && (
                    <p className="text-white/60 text-xs italic">{w.romaji}</p>
                  )}
                  {w.mongolian_meaning && (
                    <p className="text-white/80 text-xs font-bold mt-0.5">
                      🇲🇳 {w.mongolian_meaning}
                    </p>
                  )}
                  {w.english_meaning && (
                    <p className="text-white/50 text-[11px]">
                      🇬🇧 {w.english_meaning}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="text-6xl mb-3">🎉</div>
          <p className="text-2xl font-black text-green-400">
            You know all 8 words!
          </p>
          <p className="text-white/50 text-sm mt-1">Super reader!</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={onRestart}
          className="w-full py-4 rounded-2xl font-black text-white text-lg active:scale-95 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          }}
        >
          🔄 Try Again
        </button>
        <Link
          href="/weekly-words"
          className="w-full py-4 rounded-2xl font-black text-white text-lg active:scale-95 text-center"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          ← Back to Weekly Words
        </Link>
      </div>
    </div>
  );
}

// ── Main Weekly Words Quiz View ───────────────────────────────────────────
export default function WeeklyWordsQuizView({ week }: { week: IWeeklyWords }) {
  const [phase, setPhase] = useState<Phase>("exam");
  useLockBodyScroll(phase === "exam");
  const [round, setRound] = useState(1);
  const [deck, setDeck] = useState<IWeeklyWordItem[]>(() =>
    shuffle(week.words || [])
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [known, setKnown] = useState<IWeeklyWordItem[]>([]);
  const [unknown, setUnknown] = useState<IWeeklyWordItem[]>([]);
  const totalCards = week.words?.length || 0;

  if (!week.words || week.words.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-4 text-center">
        <div className="text-6xl">🗓️</div>
        <p className="text-white/60 font-bold">This week has no words yet.</p>
        <Link href="/weekly-words" className="text-blue-400 font-bold">
          ← Back to Weekly Words
        </Link>
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
    setDeck(shuffle(week.words));
    setCurrentIndex(0);
    setKnown([]);
    setUnknown([]);
    setRound(1);
    setPhase("exam");
  };

  if (phase === "exam") {
    return (
      <QuizScreen
        week={week}
        deck={deck}
        currentIndex={currentIndex}
        round={round}
        onSwipe={handleSwipe}
      />
    );
  }

  if (phase === "roundResult") {
    return (
      <RoundResultScreen
        week={week}
        round={round}
        known={known}
        unknown={unknown}
        onNextRound={startRound2}
        onFinish={goToResults}
      />
    );
  }

  return (
    <DoneScreen
      week={week}
      finalUnknown={unknown}
      totalCards={totalCards}
      onRestart={restart}
    />
  );
}
