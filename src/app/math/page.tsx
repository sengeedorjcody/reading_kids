"use client";

import { useState, useCallback, useEffect } from "react";
import { useSpeech } from "@/hooks/useSpeech";

// ── Japanese number words ─────────────────────────────────────────────────
const JP = [
  "ぜろ","いち","に","さん","よん","ご",
  "ろく","なな","はち","きゅう","じゅう",
  "じゅういち","じゅうに","じゅうさん","じゅうよん","じゅうご",
  "じゅうろく","じゅうなな","じゅうはち","じゅうきゅう","にじゅう",
];

type Op    = "+" | "−";
type Level = 1 | 2 | 3;

interface Problem {
  a: number;
  b: number;
  op: Op;
  answer: number;
  choices: number[];
}

// ── Level config ──────────────────────────────────────────────────────────
const LEVEL_CONFIG = {
  1: { label: "たし算 1〜5",  english: "Add up to 5",      color: "#22c55e", icon: "🌱" },
  2: { label: "たし算 1〜10", english: "Add up to 20",     color: "#3b82f6", icon: "⭐" },
  3: { label: "ひき算",       english: "Subtraction 1〜10", color: "#f97316", icon: "🔥" },
};

// ── Problem generator ─────────────────────────────────────────────────────
function makeProblem(level: Level): Problem {
  let a: number, b: number, op: Op;

  if (level === 1) {
    a  = Math.floor(Math.random() * 5) + 1;          // 1-5
    b  = Math.floor(Math.random() * (6 - a)) + 1;    // keeps sum ≤ 10
    op = "+";
  } else if (level === 2) {
    a  = Math.floor(Math.random() * 10) + 1;          // 1-10
    b  = Math.floor(Math.random() * 10) + 1;          // 1-10
    op = "+";
  } else {
    a  = Math.floor(Math.random() * 9) + 2;           // 2-10
    b  = Math.floor(Math.random() * (a - 1)) + 1;     // 1 to a-1
    op = "−";
  }

  const answer = op === "+" ? a + b : a - b;

  // 4 unique choices
  const set = new Set<number>([answer]);
  let tries = 0;
  while (set.size < 4 && tries < 100) {
    const delta = Math.floor(Math.random() * 5) - 2;
    const w = answer + delta;
    if (w !== answer && w >= 0 && w <= 20) set.add(w);
    tries++;
  }
  // fill remaining if needed
  let fill = 0;
  while (set.size < 4) { if (!set.has(fill)) set.add(fill); fill++; }

  return {
    a, b, op, answer,
    choices: Array.from(set).sort(() => Math.random() - 0.5),
  };
}

// ── Dot visualizer ─────────────────────────────────────────────────────────
function Dots({ count, color, crossed }: { count: number; color: string; crossed?: boolean }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5" style={{ maxWidth: 160 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-7 h-7 rounded-full transition-all"
          style={{
            backgroundColor: crossed ? "#e2e8f0" : color,
            opacity: crossed ? 0.35 : 1,
            boxShadow: crossed ? "none" : `0 2px 6px ${color}55`,
          }}
        />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function MathPage() {
  const [level, setLevel]     = useState<Level>(1);
  const [problem, setProblem] = useState<Problem>(() => makeProblem(1));
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore]     = useState(0);
  const [total, setTotal]     = useState(0);
  const [streak, setStreak]   = useState(0);
  const [showDots, setShowDots] = useState(true);
  const { speak } = useSpeech();

  const cfg = LEVEL_CONFIG[level];

  // Speak the question when it changes
  useEffect(() => {
    const op = problem.op === "+" ? "たす" : "ひく";
    speak(`${JP[problem.a]} ${op} ${JP[problem.b]} は？`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  const next = useCallback((lvl: Level = level) => {
    setSelected(null);
    setProblem(makeProblem(lvl));
  }, [level]);

  const switchLevel = (l: Level) => {
    setLevel(l);
    setScore(0);
    setTotal(0);
    setStreak(0);
    setSelected(null);
    setProblem(makeProblem(l));
  };

  const handleChoice = (choice: number) => {
    if (selected !== null) return;
    setSelected(choice);
    setTotal(t => t + 1);
    const correct = choice === problem.answer;
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      speak(`せいかい！ ${JP[problem.answer]}`);
    } else {
      setStreak(0);
      speak(`ざんねん… こたえは ${JP[problem.answer]} です`);
    }
  };

  const { a, b, op, answer, choices } = problem;
  const opLabel = op === "+" ? "たす" : "ひく";

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-28">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800">🧮 けいさん</h1>
          <p className="text-sm text-gray-400">Math for beginners</p>
        </div>
        {/* Score */}
        <div
          className="flex flex-col items-center px-4 py-2 rounded-2xl"
          style={{ backgroundColor: `${cfg.color}15`, border: `2px solid ${cfg.color}33` }}
        >
          <span className="text-2xl font-black" style={{ color: cfg.color }}>
            {score}/{total}
          </span>
          {streak >= 3 && (
            <span className="text-xs font-black text-orange-400">🔥 {streak} streak!</span>
          )}
        </div>
      </div>

      {/* Level selector */}
      <div className="flex gap-2 mb-5">
        {([1, 2, 3] as Level[]).map((l) => {
          const c = LEVEL_CONFIG[l];
          return (
            <button
              key={l}
              onClick={() => switchLevel(l)}
              className="flex-1 py-3 rounded-2xl font-black text-xs transition-all active:scale-95 flex flex-col items-center gap-0.5"
              style={level === l
                ? { backgroundColor: c.color, color: "#fff", boxShadow: `0 4px 12px ${c.color}55` }
                : { backgroundColor: "#f3f4f6", color: "#6b7280" }}
            >
              <span className="text-lg">{c.icon}</span>
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Problem display */}
      <div
        className="rounded-3xl px-6 py-6 mb-4 text-center"
        style={{ backgroundColor: "#fff", border: `3px solid ${cfg.color}33`, boxShadow: `0 4px 20px ${cfg.color}22` }}
      >
        {/* Japanese question */}
        <p className="text-sm font-black mb-3" style={{ color: cfg.color }}>
          {JP[a]} {opLabel} {JP[b]} は？
        </p>

        {/* Big equation */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-6xl font-black text-gray-800">{a}</span>
          <span className="text-5xl font-black" style={{ color: cfg.color }}>{op}</span>
          <span className="text-6xl font-black text-gray-800">{b}</span>
          <span className="text-5xl font-black text-gray-400">=</span>
          <span className="text-6xl font-black"
            style={{ color: selected !== null ? cfg.color : "#e2e8f0" }}>
            {selected !== null ? answer : "?"}
          </span>
        </div>

        {/* Dot visualizer */}
        {showDots && (
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Dots count={a} color={cfg.color} />
            {op === "+" && <span className="text-2xl font-black" style={{ color: cfg.color }}>+</span>}
            {op === "−"
              ? <Dots count={b} color={cfg.color} crossed />
              : <Dots count={b} color="#f97316" />
            }
          </div>
        )}

        {/* Toggle dots */}
        <button
          onClick={() => setShowDots(d => !d)}
          className="mt-3 text-xs font-bold text-gray-300 active:text-gray-500"
        >
          {showDots ? "ドットを隠す" : "ドットを見る"}
        </button>
      </div>

      {/* Answer choices */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {choices.map((c) => {
          const isCorrect = c === answer;
          const isSelected = c === selected;
          const revealed = selected !== null;

          let bg = "#f8fafc";
          let border = "#e2e8f0";
          let textColor = "#1e293b";

          if (revealed) {
            if (isCorrect) {
              bg = "#dcfce7"; border = "#22c55e"; textColor = "#15803d";
            } else if (isSelected) {
              bg = "#fee2e2"; border = "#ef4444"; textColor = "#dc2626";
            }
          }

          return (
            <button
              key={c}
              onClick={() => handleChoice(c)}
              disabled={revealed}
              className="flex flex-col items-center justify-center rounded-3xl py-5 font-black transition-all active:scale-95 disabled:cursor-default"
              style={{
                backgroundColor: bg,
                border: `3px solid ${border}`,
                boxShadow: isSelected && revealed
                  ? isCorrect ? "0 4px 16px #22c55e55" : "0 4px 16px #ef444455"
                  : "0 2px 8px rgba(0,0,0,0.06)",
                transform: isSelected && revealed && isCorrect ? "scale(1.04)" : undefined,
              }}
            >
              <span className="text-4xl" style={{ color: textColor }}>{c}</span>
              <span className="text-sm mt-1 font-bold" style={{ color: textColor, opacity: 0.7 }}>
                {JP[c] ?? ""}
              </span>
              {revealed && isCorrect && <span className="text-lg mt-1">✅</span>}
              {revealed && isSelected && !isCorrect && <span className="text-lg mt-1">❌</span>}
            </button>
          );
        })}
      </div>

      {/* Next / Speak buttons */}
      {selected !== null ? (
        <button
          onClick={() => next()}
          className="w-full py-4 rounded-3xl font-black text-lg text-white transition-all active:scale-95 flex items-center justify-center gap-3"
          style={{ backgroundColor: cfg.color, boxShadow: `0 6px 20px ${cfg.color}44` }}
        >
          つぎの もんだい ▶
        </button>
      ) : (
        <button
          onClick={() => speak(`${JP[a]} ${opLabel} ${JP[b]} は？`)}
          className="w-full py-4 rounded-3xl font-black text-base transition-all active:scale-95 flex items-center justify-center gap-3"
          style={{ backgroundColor: `${cfg.color}15`, color: cfg.color, border: `2px solid ${cfg.color}33` }}
        >
          <span className="text-xl">🔊</span>
          もういちど きく
        </button>
      )}
    </div>
  );
}
