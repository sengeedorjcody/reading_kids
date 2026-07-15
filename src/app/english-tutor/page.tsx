"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSpeech } from "@/hooks/useSpeech";
import { useSpeechRecognition, type SpeechResult } from "@/hooks/useSpeechRecognition";
import { LEVELS, CORRECT_TO_LEVEL_UP, type Phrase } from "@/lib/englishTutor/phrases";

interface Feedback {
  stars: number;
  heardCorrectly: boolean;
  misheardWords: string[];
  feedback: string;
  tip: string;
  encouragement: string;
}

type Status = "idle" | "listening" | "checking" | "result" | "error";

function pickPhrase(levelIndex: number, exclude?: string): Phrase {
  const list = LEVELS[levelIndex].phrases;
  let p = list[Math.floor(Math.random() * list.length)];
  let guard = 0;
  while (list.length > 1 && p.text === exclude && guard++ < 10) {
    p = list[Math.floor(Math.random() * list.length)];
  }
  return p;
}

function norm(w: string): string {
  return w.toLowerCase().replace(/[^a-z']/g, "");
}

export default function EnglishTutorPage() {
  const { speak } = useSpeech();
  const [levelIndex, setLevelIndex] = useState(0);
  const [phrase, setPhrase] = useState<Phrase>(() => pickPhrase(0));
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [heard, setHeard] = useState("");
  const [streak, setStreak] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [typed, setTyped] = useState("");
  const levelRef = useRef(levelIndex);
  levelRef.current = levelIndex;
  // Keep the latest phrase available inside the async check callback.
  const phraseRef = useRef(phrase);
  phraseRef.current = phrase;

  const check = useCallback(async (transcript: string, confidence: number) => {
    setHeard(transcript);
    setStatus("checking");
    try {
      const res = await fetch("/api/english-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: phraseRef.current.text,
          transcript,
          confidence,
          level: levelRef.current,
        }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const data: Feedback = await res.json();
      setFeedback(data);
      setStatus("result");
      setTotalStars((s) => s + data.stars);
      if (data.stars >= 2) {
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }
      // Speak the encouragement (works on Chrome/Android; iOS may stay silent).
      speak(`${data.encouragement} ${data.feedback}`, "en-US");
    } catch {
      setStatus("error");
    }
  }, [speak]);

  const onResult = useCallback(
    (r: SpeechResult) => check(r.transcript, r.confidence),
    [check],
  );
  const { supported, listening, start } = useSpeechRecognition(onResult);

  // Level up after a streak of good answers.
  useEffect(() => {
    if (streak >= CORRECT_TO_LEVEL_UP && levelIndex < LEVELS.length - 1) {
      setStreak(0);
      const next = levelIndex + 1;
      setLevelIndex(next);
      setPhrase(pickPhrase(next));
      setFeedback(null);
      setStatus("idle");
    }
  }, [streak, levelIndex]);

  const listenToPhrase = useCallback(() => {
    speak(phrase.text, "en-US");
  }, [phrase, speak]);

  const nextPhrase = useCallback(() => {
    const p = pickPhrase(levelIndex, phrase.text);
    setPhrase(p);
    setFeedback(null);
    setHeard("");
    setTyped("");
    setStatus("idle");
    speak(p.text, "en-US"); // within the tap gesture → OK on iOS
  }, [levelIndex, phrase.text, speak]);

  const misheard = new Set((feedback?.misheardWords ?? []).map(norm));

  return (
    <div className="min-h-screen flex flex-col items-center pb-28 px-5 text-white">
      {/* Header: level + score */}
      <div className="w-full max-w-md flex items-center justify-between pt-5 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎙️</span>
          <div>
            <div className="font-black text-lg leading-none">English Tutor</div>
            <div className="text-xs text-white/60">Level {levelIndex + 1}: {LEVELS[levelIndex].name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-yellow-300 font-black text-lg leading-none">⭐ {totalStars}</div>
          <div className="text-xs text-white/60">{streak}/{CORRECT_TO_LEVEL_UP} to level up</div>
        </div>
      </div>

      {/* Phrase card */}
      <div className="w-full max-w-md rounded-3xl bg-white/10 border border-white/15 p-6 flex flex-col items-center gap-4 shadow-2xl">
        <div className="text-6xl">{phrase.emoji}</div>
        <div className="text-3xl font-black text-center leading-tight">
          {phrase.text.split(/\s+/).map((word, i) => {
            const isBad = misheard.has(norm(word));
            return (
              <span key={i} className={isBad ? "text-rose-400 underline decoration-wavy" : ""}>
                {word}{" "}
              </span>
            );
          })}
        </div>
        <button
          onClick={listenToPhrase}
          className="px-5 py-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition font-bold text-sm"
        >
          🔊 Listen
        </button>
      </div>

      {/* Mic / say-it area */}
      <div className="w-full max-w-md flex flex-col items-center mt-6">
        {supported ? (
          <button
            onClick={start}
            disabled={listening || status === "checking"}
            className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl transition active:scale-95 border-4 ${
              listening
                ? "bg-rose-500/80 border-rose-300 animate-pulse"
                : "bg-indigo-500/80 border-indigo-300 hover:bg-indigo-500"
            } disabled:opacity-50`}
            aria-label="Say the phrase"
          >
            {listening ? "👂" : "🎤"}
          </button>
        ) : (
          // Fallback when the browser has no speech recognition (some iOS Safari).
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typed.trim()) check(typed.trim(), 1);
            }}
            className="w-full flex flex-col items-center gap-2"
          >
            <p className="text-xs text-white/60 text-center">
              Your browser can&apos;t hear the mic — type what you said:
            </p>
            <div className="flex gap-2 w-full">
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="Type here…"
                className="flex-1 rounded-full px-4 py-2 text-black text-center"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-indigo-500 font-bold active:scale-95"
              >
                Check
              </button>
            </div>
          </form>
        )}

        <div className="h-6 mt-3 text-sm text-white/70">
          {listening && "Say it now! 🎤"}
          {status === "checking" && "Checking… ⏳"}
        </div>

        {heard && status !== "checking" && (
          <div className="text-xs text-white/50">I heard: “{heard}”</div>
        )}
      </div>

      {/* Feedback */}
      {status === "result" && feedback && (
        <div className="w-full max-w-md mt-4 rounded-3xl bg-white/10 border border-white/15 p-5 flex flex-col items-center gap-2">
          <div className="text-3xl tracking-widest">
            {"⭐".repeat(feedback.stars)}
            <span className="opacity-30">{"☆".repeat(3 - feedback.stars)}</span>
          </div>
          <div className="font-black text-lg text-center">{feedback.encouragement}</div>
          <div className="text-center text-white/85">{feedback.feedback}</div>
          {feedback.tip && (
            <div className="text-sm text-amber-200 text-center">💡 {feedback.tip}</div>
          )}
          <div className="flex gap-3 mt-2">
            {supported && (
              <button
                onClick={start}
                className="px-5 py-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition font-bold"
              >
                🔁 Try again
              </button>
            )}
            <button
              onClick={nextPhrase}
              className="px-6 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition font-black"
            >
              Next ➜
            </button>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="w-full max-w-md mt-4 rounded-2xl bg-rose-500/20 border border-rose-400/40 p-4 text-center">
          <div className="font-bold">Oops — the tutor had a hiccup.</div>
          <button
            onClick={() => setStatus("idle")}
            className="mt-2 px-5 py-2 rounded-full bg-white/15 hover:bg-white/25 font-bold active:scale-95"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}
