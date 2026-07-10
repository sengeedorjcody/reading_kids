"use client";

import { useRef, useState, useEffect, useCallback } from "react";
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
  { n: 0,  name: "Zero",  jp: "ぜろ",    color: "#f5b400", accent: "#ffe45e" },
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

function charFor(n: number) {
  return CHARACTERS.find((c) => c.n === n)!;
}

// Column layout like the show: 1-5 stand tall, 6+ stack into two columns
function columnsFor(n: number): number[] {
  if (n <= 5) return [n];
  const tall = Math.ceil(n / 2);
  return [tall, n - tall];
}

// ── Character visual (blocks + face + arms/legs) ─────────────────────────────
function FriendBody({
  char, block = 20, dragging = false,
}: {
  char: Character; block?: number; dragging?: boolean;
}) {
  // Zero: a yellow ring character like the reference picture
  if (char.n === 0) {
    const size = block * 2.6;
    return (
      <div className={dragging ? "nb-bounce" : "nb-idle"} style={{ position: "relative", width: size + 30, paddingInline: 15 }}>
        <div className="relative" style={{ width: size, height: size * 1.25 }}>
          {/* Arms */}
          <div className={`absolute rounded-full ${dragging ? "nb-arm-wave-l" : "nb-arm-idle-l"}`}
            style={{ width: 14, height: 4, background: char.color, left: -13, top: size * 0.45, transformOrigin: "right center" }} />
          <div className={`absolute rounded-full ${dragging ? "nb-arm-wave-r" : "nb-arm-idle-r"}`}
            style={{ width: 14, height: 4, background: char.color, right: -13, top: size * 0.45, transformOrigin: "left center" }} />

          {/* Ring body */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-start justify-center"
            style={{
              width: size, height: size * 1.25,
              borderRadius: "50%",
              border: `${Math.max(8, block * 0.55)}px solid ${char.color}`,
              boxSizing: "border-box",
              background: "transparent",
            }}
          >
            {/* Face sits on top of the ring */}
            <div className="flex flex-col items-center" style={{ marginTop: -4 }}>
              <div className="flex gap-[5px]">
                <span className="nb-eye nb-eye-dark" />
                <span className="nb-eye nb-eye-dark" />
              </div>
              <div style={{ width: 10, height: 5, borderBottom: "2px solid #7a5c00", borderRadius: "0 0 10px 10px", marginTop: 1 }} />
            </div>
          </div>

          {/* Legs */}
          <div className="absolute flex justify-center gap-2" style={{ bottom: -10, left: 0, right: 0 }}>
            <div className={`rounded-full ${dragging ? "nb-leg-kick-l" : ""}`}
              style={{ width: 4, height: 10, background: "#333", transformOrigin: "top center" }} />
            <div className={`rounded-full ${dragging ? "nb-leg-kick-r" : ""}`}
              style={{ width: 4, height: 10, background: "#333", transformOrigin: "top center" }} />
          </div>
        </div>
      </div>
    );
  }

  const cols = columnsFor(char.n);
  const maxRows = Math.max(...cols);
  const bodyW = cols.length * (block + 2);
  const bodyH = maxRows * (block + 2);

  return (
    <div className={dragging ? "nb-bounce" : "nb-idle"} style={{ width: bodyW + 28, paddingInline: 14 }}>
      <div className="relative" style={{ width: bodyW, height: bodyH }}>
        {/* Arms */}
        <div className={`absolute rounded-full ${dragging ? "nb-arm-wave-l" : "nb-arm-idle-l"}`}
          style={{ width: 14, height: 4, background: char.color, left: -13, top: 8, transformOrigin: "right center" }} />
        <div className={`absolute rounded-full ${dragging ? "nb-arm-wave-r" : "nb-arm-idle-r"}`}
          style={{ width: 14, height: 4, background: char.color, right: -13, top: 8, transformOrigin: "left center" }} />

        {/* Body blocks: columns bottom-aligned */}
        <div className="flex items-end justify-center gap-0.5" style={{ height: bodyH }}>
          {cols.map((rows, ci) => (
            <div key={ci} className="flex flex-col gap-0.5">
              {Array.from({ length: rows }).map((_, ri) => {
                const isHead = ci === 0 && ri === 0;
                const striped = char.n === 10 && ri % 2 === 1;
                return (
                  <div key={ri}
                    className="rounded-[5px] flex items-center justify-center"
                    style={{
                      width: block, height: block,
                      background: striped ? char.accent : char.color,
                      border: "1.5px solid rgba(0,0,0,0.15)",
                    }}
                  >
                    {isHead && (
                      <div className="flex flex-col items-center" style={{ marginTop: -2 }}>
                        <div className="flex gap-[4px]">
                          <span className="nb-eye" />
                          <span className="nb-eye" />
                        </div>
                        <div style={{ width: 9, height: 4, borderBottom: "2px solid #fff", borderRadius: "0 0 10px 10px", marginTop: 1 }} />
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
          <div className={`rounded-full ${dragging ? "nb-leg-kick-l" : ""}`}
            style={{ width: 4, height: 10, background: char.color, transformOrigin: "top center" }} />
          <div className={`rounded-full ${dragging ? "nb-leg-kick-r" : ""}`}
            style={{ width: 4, height: 10, background: char.color, transformOrigin: "top center" }} />
        </div>
      </div>
    </div>
  );
}

// ── Problem generation ───────────────────────────────────────────────────────
type Op = "+" | "−";
type Slot = "a" | "b" | "answer";

interface Problem {
  a: number;
  b: number;
  op: Op;
  answer: number;
  missing: Slot;
  correct: number;
}

const JP_NUM = ["ぜろ","いち","に","さん","よん","ご","ろく","なな","はち","きゅう","じゅう"];

const LEVEL_CONFIG: Record<number, { label: string; icon: string }> = {
  1: { label: "たし算",     icon: "➕" },
  2: { label: "ひき算",     icon: "➖" },
  3: { label: "0 + たす",   icon: "0️⃣➕" },
  4: { label: "0 ひく",     icon: "0️⃣➖" },
  5: { label: "たす ？",    icon: "➕❓" },
  6: { label: "ひく ？",    icon: "➖❓" },
  7: { label: "0 と ？",    icon: "0️⃣❓" },
};

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function build(a: number, b: number, op: Op, missing: Slot): Problem {
  const answer = op === "+" ? a + b : a - b;
  const correct = missing === "a" ? a : missing === "b" ? b : answer;
  return { a, b, op, answer, missing, correct };
}

function makeProblem(level: number): Problem {
  switch (level) {
    case 1: { // pure addition, answer missing: 3 + 4 = ?
      const a = rnd(1, 9);
      const b = rnd(1, 10 - a);
      return build(a, b, "+", "answer");
    }
    case 2: { // pure subtraction, answer missing: 6 - 4 = ?
      const a = rnd(2, 10);
      const b = rnd(1, a - 1);
      return build(a, b, "−", "answer");
    }
    case 3: { // zero addition, answer missing: 0 + 5 = ? / 5 + 0 = ?
      const n = rnd(1, 10);
      return Math.random() < 0.5 ? build(0, n, "+", "answer") : build(n, 0, "+", "answer");
    }
    case 4: { // zero subtraction, answer missing: 6 - 0 = ? / 6 - 6 = ?
      const n = rnd(1, 10);
      return Math.random() < 0.5 ? build(n, 0, "−", "answer") : build(n, n, "−", "answer");
    }
    case 5: { // missing addend, answer known: 4 + ? = 7
      const a = rnd(1, 9);
      const b = rnd(1, 10 - a);
      return build(a, b, "+", "b");
    }
    case 6: { // missing subtrahend, answer known: 4 - ? = 2
      const a = rnd(2, 10);
      const b = rnd(1, a - 1);
      return build(a, b, "−", "b");
    }
    case 7: { // zero involved, missing addend/subtrahend
      const n = rnd(1, 10);
      const kind = rnd(0, 3);
      if (kind === 0) return build(0, n, "+", "b");   // 0 + ? = n
      if (kind === 1) return build(n, 0, "+", "a");   // ? + 0 = n
      if (kind === 2) return build(n, 0, "−", "a");   // ? − 0 = n
      return build(n, n, "−", "b");                   // n − ? = 0
    }
    default:
      return makeProblem(1);
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────
interface DragState {
  char: Character;
  x: number;
  y: number;
}

export default function NumberblocksFriends() {
  const [level, setLevel] = useState(1);
  const [problem, setProblem] = useState<Problem>(() => makeProblem(1));
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [slotFlash, setSlotFlash] = useState<"good" | "bad" | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const { speak } = useSpeech();

  const speakProblem = useCallback((p: Problem) => {
    const opWord = p.op === "+" ? "たす" : "ひく";
    if (p.missing === "a")       speak(`なに ${opWord} ${JP_NUM[p.b]} は ${JP_NUM[p.answer]} ですか？`);
    else if (p.missing === "b")  speak(`${JP_NUM[p.a]} ${opWord} なに は ${JP_NUM[p.answer]} ですか？`);
    else                         speak(`${JP_NUM[p.a]} ${opWord} ${JP_NUM[p.b]} は？`);
  }, [speak]);

  useEffect(() => {
    speakProblem(problem);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const newProblem = useCallback((lvl: number = level) => {
    const p = makeProblem(lvl);
    setProblem(p);
    setSolved(false);
    setSlotFlash(null);
    speakProblem(p);
  }, [level, speakProblem]);

  const switchLevel = (l: number) => {
    setLevel(l);
    setScore(0);
    newProblem(l);
  };

  // ── Dragging from the palette ──
  const startDrag = (char: Character) => (e: React.PointerEvent) => {
    e.preventDefault();
    speak(char.jp); // speak Japanese name on grab
    if (solved) return;
    setDrag({ char, x: e.clientX, y: e.clientY });

    const onMove = (ev: PointerEvent) => setDrag({ char, x: ev.clientX, y: ev.clientY });
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setDrag(null);

      const slot = slotRef.current?.getBoundingClientRect();
      const inSlot = slot &&
        ev.clientX >= slot.left && ev.clientX <= slot.right &&
        ev.clientY >= slot.top && ev.clientY <= slot.bottom;
      if (!inSlot) return;

      if (char.n === problem.correct) {
        setSolved(true);
        setScore((s) => s + 1);
        setSlotFlash("good");
        speak(`せいかい！ ${JP_NUM[problem.correct]}`);
        setTimeout(newProblem, 1800);
      } else {
        setSlotFlash("bad");
        speak(`ざんねん…`);
        setTimeout(() => setSlotFlash(null), 600);
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const { a, b, op, answer, missing } = problem;

  // One equation slot: number on top, its character below (not draggable)
  const EqSlot = ({ value, isMissing }: { value: number; isMissing: boolean }) => {
    if (isMissing && !solved) {
      return (
        <div
          ref={slotRef}
          className="flex flex-col items-center justify-center rounded-2xl"
          style={{
            width: 96, height: 130,
            border: `3px dashed ${slotFlash === "bad" ? "#ef4444" : "#8b5cf6"}`,
            background: slotFlash === "bad" ? "rgba(239,68,68,0.1)" : "rgba(139,92,246,0.08)",
            animation: slotFlash === "bad" ? "nbShake 0.3s" : undefined,
          }}
        >
          <span className="font-black text-4xl text-purple-300 animate-pulse">?</span>
          <span className="text-[10px] font-bold text-purple-400 mt-1">ここに おいてね</span>
        </div>
      );
    }
    const c = charFor(value);
    return (
      <div
        className="flex flex-col items-center justify-end rounded-2xl"
        style={{
          width: 96, height: 130,
          background: isMissing && solved ? "rgba(34,197,94,0.12)" : "transparent",
          border: isMissing && solved ? "3px solid rgba(34,197,94,0.5)" : "3px solid transparent",
        }}
      >
        <span className="font-black text-3xl mb-1" style={{ color: c.color }}>{value}</span>
        <FriendBody char={c} block={13} />
        <span className="text-[10px] font-bold text-gray-500 mt-3">{c.jp}</span>
      </div>
    );
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
        .nb-eye-dark { background: #5b4300; border: 1.5px solid #fff; width: 7px; height: 7px; }
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
        @keyframes nbShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>

      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="font-black text-lg text-gray-700">🧱 ナンバーブロックス</h1>
          <p className="text-xs font-bold text-gray-500">Дутуу тоог доороос чирж оруулаарай! 👆</p>
        </div>
        <div className="px-3 py-1.5 rounded-2xl bg-white/70 shadow">
          <span className="text-sm font-black text-orange-600">⭐ {score}</span>
        </div>
      </div>

      {/* Level selector */}
      <div className="flex-shrink-0 flex items-center gap-1.5 overflow-x-auto px-3 pb-2 scrollbar-none">
        {Object.entries(LEVEL_CONFIG).map(([lvlStr, cfg]) => {
          const l = parseInt(lvlStr);
          const active = level === l;
          return (
            <button
              key={l}
              onClick={() => switchLevel(l)}
              className="flex-shrink-0 flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-2xl font-black transition-all active:scale-95"
              style={active
                ? { background: "#8b5cf6", color: "#fff", boxShadow: "0 4px 10px rgba(139,92,246,0.4)" }
                : { background: "rgba(255,255,255,0.6)", color: "#64748b" }
              }
            >
              <span className="text-base leading-none">{cfg.icon}</span>
              <span className="text-[10px] whitespace-nowrap">{l}. {cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Equation with characters */}
      <div className="flex-shrink-0 flex items-center justify-center gap-1 px-2 py-2">
        <EqSlot value={a} isMissing={missing === "a"} />
        <span className="font-black text-4xl text-gray-600 flex-shrink-0">{op}</span>
        <EqSlot value={b} isMissing={missing === "b"} />
        <span className="font-black text-4xl text-gray-400 flex-shrink-0">=</span>
        <EqSlot value={answer} isMissing={missing === "answer"} />
      </div>

      {solved && (
        <p className="flex-shrink-0 text-center font-black text-green-600 animate-bounce">🎉 せいかい！</p>
      )}

      {/* Character palette — drag these into the "?" slot */}
      <div
        className="flex-1 mx-3 mb-3 mt-1 rounded-3xl overflow-y-auto"
        style={{ border: "3px dashed rgba(100,120,200,0.4)", background: "rgba(255,255,255,0.4)" }}
      >
        <div className="flex flex-wrap items-end justify-center gap-x-2 gap-y-6 p-4 pt-8">
          {CHARACTERS.map((c) => (
            <div
              key={c.n}
              onPointerDown={startDrag(c)}
              className="flex flex-col items-center cursor-grab active:cursor-grabbing touch-none select-none"
              style={{ opacity: drag?.char.n === c.n ? 0.3 : 1 }}
            >
              <FriendBody char={c} block={15} />
              <span
                className="mt-3 px-2 py-0.5 rounded-full font-black text-[10px] text-white"
                style={{ background: c.color }}
              >
                {c.n} · {c.jp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Drag ghost following the pointer */}
      {drag && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: drag.x - 40, top: drag.y - 70 }}
        >
          <FriendBody char={drag.char} block={16} dragging />
        </div>
      )}
    </div>
  );
}
