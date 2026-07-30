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
type Level = 1 | 2 | 3 | 4;
type Slot  = "a" | "b" | "answer";

interface Problem {
  a: number;
  b: number;
  op: Op;
  answer: number;
  missingSlot: Slot;
  correctValue: number;
  choices: number[];
}

// ── Level config ──────────────────────────────────────────────────────────
const LEVEL_CONFIG = {
  1: { label: "たし算 1〜5",  english: "Add up to 5",      color: "#22c55e", icon: "🌱" },
  2: { label: "たし算 1〜10", english: "Add up to 20",     color: "#3b82f6", icon: "⭐" },
  3: { label: "ひき算",       english: "Subtraction 1〜10", color: "#f97316", icon: "🔥" },
  4: { label: "ぜろの計算",   english: "With zero",         color: "#8b5cf6", icon: "0️⃣" },
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
  } else if (level === 3) {
    a  = Math.floor(Math.random() * 9) + 2;           // 2-10
    b  = Math.floor(Math.random() * (a - 1)) + 1;     // 1 to a-1
    op = "−";
  } else {
    // Level 4: zero operations — n+0, 0+n, n−0, n−n
    const kind = Math.floor(Math.random() * 4);
    const n = Math.floor(Math.random() * 10) + 1; // 1-10
    if (kind === 0)      { a = n; b = 0; op = "+"; }   // n + 0 = n
    else if (kind === 1) { a = 0; b = n; op = "+"; }   // 0 + n = n
    else if (kind === 2) { a = n; b = 0; op = "−"; }   // n − 0 = n
    else                 { a = n; b = n; op = "−"; }   // n − n = 0
  }

  const answer = op === "+" ? a + b : a - b;

  // Randomly hide one of the three slots — the child solves for the missing part
  const missingSlot: Slot = (["a", "b", "answer"] as Slot[])[Math.floor(Math.random() * 3)];
  const correctValue = missingSlot === "a" ? a : missingSlot === "b" ? b : answer;

  // 4 unique choices around the correct value
  const set = new Set<number>([correctValue]);
  let tries = 0;
  while (set.size < 4 && tries < 100) {
    const delta = Math.floor(Math.random() * 5) - 2;
    const w = correctValue + delta;
    if (w !== correctValue && w >= 0 && w <= 20) set.add(w);
    tries++;
  }
  let fill = 0;
  while (set.size < 4) { if (!set.has(fill)) set.add(fill); fill++; }

  return {
    a, b, op, answer, missingSlot, correctValue,
    choices: Array.from(set).sort(() => Math.random() - 0.5),
  };
}

// ── Numberblocks-style character visualizer ────────────────────────────────
// Each number has its own signature color, just like the Numberblocks show.
const NUMBER_COLORS = [
  "#94a3b8", "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#64748b", "#d946ef", "#f59e0b",
];

function BlockChar({ n, crossed }: { n: number; crossed?: boolean }) {
  if (n === 0) {
    return (
      <div className="w-9 h-9 rounded-lg border-2 border-dashed flex items-center justify-center flex-shrink-0"
        style={{ borderColor: "#cbd5e1" }}>
        <span className="text-gray-300 font-black text-sm">0</span>
      </div>
    );
  }

  const color = NUMBER_COLORS[Math.min(n, NUMBER_COLORS.length - 1)];

  return (
    <div className="flex flex-wrap justify-center gap-1" style={{ maxWidth: 168 }}>
      {Array.from({ length: n }).map((_, i) => {
        const isFace = i === n - 1; // face + number on the last block, like a Numberblock's head
        return (
          <div
            key={i}
            className="rounded-md flex items-center justify-center transition-all"
            style={{
              width: 26, height: 26,
              backgroundColor: crossed ? "#e2e8f0" : color,
              opacity: crossed ? 0.35 : 1,
              boxShadow: crossed ? "none" : `0 2px 5px ${color}55`,
            }}
          >
            {isFace && !crossed && (
              <div className="flex flex-col items-center">
                <div className="flex gap-1 mb-0.5">
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff" }} />
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff" }} />
                </div>
                <span className="text-white font-black" style={{ fontSize: 11, lineHeight: 1 }}>{n}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// A "?" placeholder shown in place of whichever number is missing, until revealed
function MysteryBlock() {
  return (
    <div
      className="w-9 h-9 rounded-lg border-2 border-dashed flex items-center justify-center flex-shrink-0 animate-pulse"
      style={{ borderColor: "#c4b5fd", background: "#f5f3ff" }}
    >
      <span className="text-purple-300 font-black text-lg">?</span>
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

  const speakProblem = useCallback((p: Problem) => {
    const opWord = p.op === "+" ? "たす" : "ひく";
    if (p.missingSlot === "a") {
      speak(`なに ${opWord} ${JP[p.b]} は ${JP[p.answer]} ですか？`);
    } else if (p.missingSlot === "b") {
      speak(`${JP[p.a]} ${opWord} なに は ${JP[p.answer]} ですか？`);
    } else {
      speak(`${JP[p.a]} ${opWord} ${JP[p.b]} は？`);
    }
  }, [speak]);

  // Speak the question when it changes
  useEffect(() => {
    speakProblem(problem);
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
    const correct = choice === problem.correctValue;
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      speak(`せいかい！ ${JP[problem.correctValue]}`);
    } else {
      setStreak(0);
      speak(`ざんねん… こたえは ${JP[problem.correctValue]} です`);
    }
  };

  const { a, b, op, answer, missingSlot, choices } = problem;
  const opLabel = op === "+" ? "たす" : "ひく";
  const revealed = selected !== null;

  const displayA      = missingSlot === "a" && !revealed ? "?" : a;
  const displayB      = missingSlot === "b" && !revealed ? "?" : b;
  const displayAnswer = missingSlot === "answer" && !revealed ? "?" : answer;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-28">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800">🧮 Math · けいさん</h1>
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
      <div className="grid grid-cols-2 gap-2 mb-5">
        {([1, 2, 3, 4] as Level[]).map((l) => {
          const c = LEVEL_CONFIG[l];
          return (
            <button
              key={l}
              onClick={() => switchLevel(l)}
              className="py-3 rounded-2xl font-black text-xs transition-all active:scale-95 flex flex-col items-center gap-0.5"
              style={level === l
                ? { backgroundColor: c.color, color: "#fff", boxShadow: `0 4px 12px ${c.color}55` }
                : { backgroundColor: "#f3f4f6", color: "#6b7280" }}
            >
              <span className="text-lg">{c.icon}</span>
              <span>{c.label}</span>
              <span className="text-[10px] font-bold opacity-70">{c.english}</span>
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
          {missingSlot === "a" ? "なに" : JP[a]} {opLabel} {missingSlot === "b" ? "なに" : JP[b]} は
          {missingSlot === "answer" ? "？" : ` ${JP[answer]}`}
        </p>

        {/* Big equation — traditional a op b = answer format */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-6xl font-black" style={{ color: missingSlot === "a" && !revealed ? "#c4b5fd" : "#1e293b" }}>
            {displayA}
          </span>
          <span className="text-5xl font-black" style={{ color: cfg.color }}>{op}</span>
          <span className="text-6xl font-black" style={{ color: missingSlot === "b" && !revealed ? "#c4b5fd" : "#1e293b" }}>
            {displayB}
          </span>
          <span className="text-5xl font-black text-gray-400">=</span>
          <span className="text-6xl font-black" style={{ color: missingSlot === "answer" && !revealed ? "#c4b5fd" : cfg.color }}>
            {displayAnswer}
          </span>
        </div>

        {/* Numberblocks-style visualizer — every slot gets its own character */}
        {showDots && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {missingSlot === "a" && !revealed ? <MysteryBlock /> : <BlockChar n={a} />}
            <span className="text-xl font-black flex-shrink-0" style={{ color: cfg.color }}>{op}</span>
            {missingSlot === "b" && !revealed ? <MysteryBlock /> : <BlockChar n={b} crossed={op === "−"} />}
            <span className="text-xl font-black flex-shrink-0 text-gray-300">=</span>
            {missingSlot === "answer" && !revealed ? <MysteryBlock /> : <BlockChar n={answer} />}
          </div>
        )}

        {/* Toggle visualizer */}
        <button
          onClick={() => setShowDots(d => !d)}
          className="mt-3 text-xs font-bold text-gray-300 active:text-gray-500"
        >
          {showDots ? "ずをかくす" : "ずをみる"}
        </button>
      </div>

      {/* Answer choices */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {choices.map((c) => {
          const isCorrect = c === problem.correctValue;
          const isSelected = c === selected;

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
      {revealed ? (
        <button
          onClick={() => next()}
          className="w-full py-4 rounded-3xl font-black text-lg text-white transition-all active:scale-95 flex items-center justify-center gap-3"
          style={{ backgroundColor: cfg.color, boxShadow: `0 6px 20px ${cfg.color}44` }}
        >
          つぎの もんだい ▶
        </button>
      ) : (
        <button
          onClick={() => speakProblem(problem)}
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
