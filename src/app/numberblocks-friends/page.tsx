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
  { n: 11, name: "Eleven",    jp: "じゅういち",  color: "#f43f5e", accent: "#ffffff" },
  { n: 12, name: "Twelve",    jp: "じゅうに",    color: "#3b82f6", accent: "#fbbf24" },
  { n: 13, name: "Thirteen",  jp: "じゅうさん",  color: "#0d9488", accent: "#5eead4" },
  { n: 14, name: "Fourteen",  jp: "じゅうよん",  color: "#2563eb", accent: "#84cc16" },
  { n: 15, name: "Fifteen",   jp: "じゅうご",    color: "#e11d48", accent: "#60a5fa" },
  { n: 16, name: "Sixteen",   jp: "じゅうろく",  color: "#65a30d", accent: "#bef264" },
  { n: 17, name: "Seventeen", jp: "じゅうなな",  color: "#7c3aed", accent: "#fb923c" },
  { n: 18, name: "Eighteen",  jp: "じゅうはち",  color: "#f59e0b", accent: "#fde047" },
  { n: 19, name: "Nineteen",  jp: "じゅうきゅう", color: "#64748b", accent: "#cbd5e1" },
  { n: 20, name: "Twenty",    jp: "にじゅう",    color: "#ec4899", accent: "#c084fc" },
];

// Levels 1-7 use 0-10 only; 10-20 levels open up the whole cast
const SMALL_CAST = CHARACTERS.filter((c) => c.n <= 10);

function charFor(n: number) {
  return CHARACTERS.find((c) => c.n === n)!;
}

// Column layout like the show: 1-5 stand tall, 6-10 stack into two columns,
// 11-20 are a Ten (two columns of 5) plus the remainder in extra columns of 5
function columnsFor(n: number): number[] {
  if (n <= 5) return [n];
  if (n <= 10) {
    const tall = Math.ceil(n / 2);
    return [tall, n - tall];
  }
  const cols: number[] = [];
  let left = n;
  while (left > 0) {
    cols.push(Math.min(5, left));
    left -= 5;
  }
  return cols;
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
                // Ten-part (first two columns) wears stripes, like Ten herself
                const striped = char.n >= 10 && ci < 2 && ri % 2 === 1;
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

const JP_NUM = [
  "ぜろ","いち","に","さん","よん","ご","ろく","なな","はち","きゅう","じゅう",
  "じゅういち","じゅうに","じゅうさん","じゅうよん","じゅうご","じゅうろく","じゅうなな","じゅうはち","じゅうきゅう","にじゅう",
];

const LEVEL_CONFIG: Record<number, { label: string; icon: string }> = {
  1: { label: "たし算",     icon: "➕" },
  2: { label: "ひき算",     icon: "➖" },
  3: { label: "0 + たす",   icon: "0️⃣➕" },
  4: { label: "0 ひく",     icon: "0️⃣➖" },
  5: { label: "たす ？",    icon: "➕❓" },
  6: { label: "ひく ？",    icon: "➖❓" },
  7: { label: "0 と ？",    icon: "0️⃣❓" },
  8: { label: "10〜20 たす", icon: "🔟➕" },
  9: { label: "10〜20 ひく", icon: "🔟➖" },
  10: { label: "Өөрөө зохио", icon: "✏️🔢" },
};

const BIG_LEVELS = new Set([8, 9]);
const CUSTOM_LEVEL = 10;

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
    case 8: { // addition landing between 11 and 20: 7 + 6 = ?
      const answer = rnd(11, 20);
      const a = rnd(1, answer - 1);
      return build(a, answer - a, "+", "answer");
    }
    case 9: { // subtraction starting from 11-20: 15 - 4 = ?
      const a = rnd(11, 20);
      const b = rnd(1, a - 1);
      return build(a, b, "−", "answer");
    }
    default:
      return makeProblem(1);
  }
}

// Bars use each number's character color where one exists (0-20); beyond
// that (level 10 lets a kid type bigger numbers) fall back to a neutral tone.
function barColor(n: number): string {
  return n >= 0 && n <= 20 ? charFor(n).color : "#6366f1";
}

// ── Number line, 20 segments by default — grows by another 10 whenever a
// bar or the answer would land past the current end, so level 10's custom
// numbers (which aren't capped at 20) always fit on screen. ─────────────────
// First number is a bar from 0 in its own color; the second number's bar sits
// above it in its color — going right for +, back to the left for −.
function NumberLine({
  a, b, op, answer, solved,
}: {
  a: number; b: number; op: Op; answer: number; solved: boolean;
}) {
  const bStart = op === "+" ? a : a - b;
  const highest = Math.max(20, a, b, bStart + b, answer);
  const max = Math.ceil(highest / 10) * 10;
  const pct = (n: number) => `${(n / max) * 100}%`;
  const barH = 18;

  return (
    <div className="w-full max-w-2xl px-3 overflow-x-auto">
      <div className="relative" style={{ height: barH * 2 + 44, minWidth: (max / 20) * 320 }}>
        {/* second number bar (top row) */}
        {b > 0 && (
          <div
            className="absolute rounded-md flex items-center justify-center text-white text-xs font-black"
            style={{
              left: pct(bStart), width: pct(b), top: 0, height: barH,
              background: barColor(b), border: "1.5px solid rgba(0,0,0,0.15)",
            }}
          >
            {op === "−" ? "←" : ""}{b}{op === "+" ? " →" : ""}
          </div>
        )}
        {/* first number bar (bottom row) */}
        {a > 0 && (
          <div
            className="absolute rounded-md flex items-center justify-center text-white text-xs font-black"
            style={{
              left: 0, width: pct(a), top: barH + 4, height: barH,
              background: barColor(a), border: "1.5px solid rgba(0,0,0,0.15)",
            }}
          >
            {a}
          </div>
        )}
        {/* the line, one segment per number up to `max` */}
        <div className="absolute left-0 right-0" style={{ top: barH * 2 + 12, height: 4, background: "#475569", borderRadius: 2 }} />
        {Array.from({ length: max + 1 }).map((_, i) => {
          const isAns = i === answer;
          return (
            <div key={i} className="absolute flex flex-col items-center" style={{ left: pct(i), top: barH * 2 + 6, transform: "translateX(-50%)" }}>
              <div style={{ width: i % 5 === 0 ? 3 : 2, height: i % 5 === 0 ? 16 : 10, background: "#475569" }} />
              <span
                className="font-black leading-none mt-1"
                style={{
                  fontSize: isAns ? 14 : 10,
                  color: isAns ? (solved ? "#16a34a" : "#8b5cf6") : "#64748b",
                }}
              >
                {isAns && !solved ? "?" : i}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
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
  const [typed, setTyped] = useState(""); // number-pad input on 10-20 levels
  const slotRef = useRef<HTMLDivElement>(null);
  const { speak } = useSpeech();

  // ── Level 10 "Өөрөө зохио": kid picks both numbers AND types their own
  // answer, which gets checked — not auto-computed like the other levels.
  const [customA, setCustomA] = useState("");
  const [customB, setCustomB] = useState("");
  const [customAnswerInput, setCustomAnswerInput] = useState("");
  const [customOp, setCustomOp] = useState<Op>("+");
  const [customFocus, setCustomFocus] = useState<"a" | "b" | "answer">("a");
  const [customSolved, setCustomSolved] = useState(false);
  const [customErrorSlot, setCustomErrorSlot] = useState<"a" | "b" | "answer" | null>(null);

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
    setTyped("");
    speakProblem(p);
  }, [level, speakProblem]);

  const resetCustom = useCallback((focus: "a" | "b" | "answer" = "a") => {
    setCustomA("");
    setCustomB("");
    setCustomAnswerInput("");
    setCustomSolved(false);
    setCustomErrorSlot(null);
    setCustomFocus(focus);
  }, []);

  const switchLevel = (l: number) => {
    setLevel(l);
    setScore(0);
    if (l === CUSTOM_LEVEL) resetCustom();
    else newProblem(l);
  };

  // Shared answer check for both drag-drop and number-pad input
  const submitAnswer = useCallback((n: number) => {
    if (n === problem.correct) {
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
  }, [problem.correct, speak, newProblem]);

  // ── Number pad (10-20 levels) ──
  const padPress = (key: string) => {
    if (solved) return;
    if (key === "⌫") { setTyped((t) => t.slice(0, -1)); return; }
    if (key === "OK") {
      if (typed === "") return;
      submitAnswer(parseInt(typed));
      return;
    }
    speak(JP_NUM[parseInt(key)]);
    setTyped((t) => (t.length >= 2 ? t : t + key));
  };

  // ── Level 10 custom equation builder ──
  // Kid fills in a, the operator, b, AND their own answer — "=" checks it
  // against a op b rather than computing it for them.
  const focusCustomSlot = (slot: "a" | "b" | "answer") => {
    if (customSolved) { resetCustom(slot); return; }
    setCustomFocus(slot);
    setCustomErrorSlot(null);
  };

  const toggleCustomOp = () => {
    if (customSolved) { resetCustom(); return; }
    setCustomOp((o) => (o === "+" ? "−" : "+"));
    setCustomErrorSlot(null);
  };

  const customPadPress = (key: string) => {
    // Any key after a correct check starts a brand-new equation.
    if (customSolved) {
      resetCustom("a");
      if (key !== "⌫" && key !== "OK") {
        setCustomA(key);
        speak(JP_NUM[parseInt(key)]);
      }
      return;
    }
    if (key === "⌫") {
      setCustomErrorSlot(null);
      if (customFocus === "a") setCustomA((v) => v.slice(0, -1));
      else if (customFocus === "b") setCustomB((v) => v.slice(0, -1));
      else setCustomAnswerInput((v) => v.slice(0, -1));
      return;
    }
    if (key === "OK") {
      if (customA === "" || customB === "" || customAnswerInput === "") return;
      const ai = parseInt(customA, 10);
      const bi = parseInt(customB, 10);
      const given = parseInt(customAnswerInput, 10);

      // Numbers aren't capped at 20 here — the number line just grows by
      // another 10 to fit them (see NumberLine). Only a negative result
      // (subtracting a bigger number) doesn't make sense to ask for.
      const expected = customOp === "+" ? ai + bi : ai - bi;
      if (expected < 0) {
        setCustomErrorSlot("b");
        speak("Их тооноос жижиг тоог хасаж болохгүй, өөр тоо сонгоорой");
        setTimeout(() => setCustomErrorSlot(null), 900);
        return;
      }

      const opWord = customOp === "+" ? "たす" : "ひく";
      if (given === expected) {
        setCustomSolved(true);
        setScore((s) => s + 1);
        speak(`${JP_NUM[ai]} ${opWord} ${JP_NUM[bi]} は ${JP_NUM[expected]}！ せいかい！`);
      } else {
        setCustomErrorSlot("answer");
        setCustomAnswerInput("");
        setCustomFocus("answer");
        speak(`ざんねん… ${JP_NUM[ai]} ${opWord} ${JP_NUM[bi]} は？`);
        setTimeout(() => setCustomErrorSlot(null), 900);
      }
      return;
    }
    // digit key
    setCustomErrorSlot(null);
    const field = customFocus === "a" ? customA : customFocus === "b" ? customB : customAnswerInput;
    if (field.length >= 2) return;
    speak(JP_NUM[parseInt(key)]);
    if (customFocus === "a") setCustomA(field + key);
    else if (customFocus === "b") setCustomB(field + key);
    else setCustomAnswerInput(field + key);
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

      submitAnswer(char.n);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const { a, b, op, answer, missing } = problem;
  const bigLevel = BIG_LEVELS.has(level);
  const isCustomLevel = level === CUSTOM_LEVEL;

  // One editable slot for level 10 — a, b, and the answer are all typed in
  // by the kid; tap to focus, type digits on the pad below.
  const CustomSlot = ({ value, slot }: { value: string; slot: "a" | "b" | "answer" }) => {
    const focused = customFocus === slot;
    const isError = customErrorSlot === slot;
    const num = value === "" ? null : parseInt(value, 10);
    const c = num !== null && num >= 0 && num <= 20 ? charFor(num) : null;
    return (
      <button
        onClick={() => focusCustomSlot(slot)}
        className="flex flex-col items-center justify-end rounded-2xl active:scale-95 transition-all"
        style={{
          width: 96, height: 130,
          border: `3px ${customSolved ? "solid" : "dashed"} ${
            isError ? "#ef4444" : customSolved ? "rgba(34,197,94,0.5)" : focused ? "#8b5cf6" : "rgba(100,120,200,0.35)"
          }`,
          background: isError
            ? "rgba(239,68,68,0.1)"
            : customSolved
            ? "rgba(34,197,94,0.12)"
            : focused
            ? "rgba(139,92,246,0.08)"
            : "rgba(255,255,255,0.3)",
          animation: isError ? "nbShake 0.3s" : undefined,
        }}
      >
        {value === "" ? (
          <span className={`font-black text-4xl mb-auto mt-auto ${focused ? "text-purple-400 animate-pulse" : "text-gray-300"}`}>?</span>
        ) : (
          <>
            <span className="font-black text-3xl mb-1" style={{ color: c?.color ?? "#8b5cf6" }}>{value}</span>
            {c && <FriendBody char={c} block={13} />}
          </>
        )}
      </button>
    );
  };

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
          {bigLevel && typed !== "" ? (
            <span className="font-black text-4xl text-purple-600">{typed}</span>
          ) : (
            <span className="font-black text-4xl text-purple-300 animate-pulse">?</span>
          )}
          <span className="text-[10px] font-bold text-purple-400 mt-1">{bigLevel ? "すうじを おしてね" : "ここに おいてね"}</span>
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
          <h1 className="font-black text-lg text-gray-700">🧱 Numberblocks · ナンバーブロックス</h1>
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

      {isCustomLevel ? (
        <>
          {/* Custom equation: kid picks both numbers, the operator, AND
              types their own answer — "✓" checks it instead of solving it. */}
          <div className="flex-shrink-0 flex items-center justify-center gap-1 px-2 py-2">
            <CustomSlot value={customA} slot="a" />
            <button
              onClick={toggleCustomOp}
              className="font-black text-4xl text-gray-600 flex-shrink-0 active:scale-90 transition-all w-10 h-10 rounded-full"
              style={{ background: "rgba(255,255,255,0.6)" }}
            >
              {customOp}
            </button>
            <CustomSlot value={customB} slot="b" />
            <span className="font-black text-4xl text-gray-400 flex-shrink-0">=</span>
            <CustomSlot value={customAnswerInput} slot="answer" />
            <button
              onClick={() => resetCustom("a")}
              title="Цэвэрлэх"
              className="ml-1 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg active:scale-90 transition-all"
              style={{ background: "rgba(239,68,68,0.15)" }}
            >
              🗑️
            </button>
          </div>

          {customSolved && (
            <p className="flex-shrink-0 text-center font-black text-green-600 animate-bounce">🎉 せいかい！</p>
          )}

          <div
            className="flex-1 mx-3 mb-3 mt-1 rounded-3xl overflow-y-auto flex flex-col items-center justify-center gap-4 p-4"
            style={{ border: "3px dashed rgba(100,120,200,0.4)", background: "rgba(255,255,255,0.4)" }}
          >
            <p className="text-xs font-bold text-gray-500 text-center">
              Тоо, тэмдгээ сонгоод хариугаа өөрөө бодож бичээд ✓ дараарай!
            </p>
            <NumberLine
              a={parseInt(customA || "0", 10) || 0}
              b={parseInt(customB || "0", 10) || 0}
              op={customOp}
              answer={Math.max(0,
                (parseInt(customA || "0", 10) || 0) + (customOp === "+" ? 1 : -1) * (parseInt(customB || "0", 10) || 0)
              )}
              solved={customSolved}
            />

            <div className="grid grid-cols-6 gap-2 w-full max-w-md">
              {["1","2","3","4","5","⌫","6","7","8","9","0","OK"].map((k) => {
                const isOk = k === "OK", isDel = k === "⌫";
                return (
                  <button
                    key={k}
                    onClick={() => customPadPress(k)}
                    className="h-14 rounded-2xl font-black text-2xl shadow active:scale-95 transition-all"
                    style={isOk
                      ? { background: "#22c55e", color: "#fff" }
                      : isDel
                      ? { background: "#f59e0b", color: "#fff" }
                      : { background: "#fff", color: "#334155" }}
                  >
                    {isOk ? "✓" : k}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
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

          {bigLevel ? (
            /* 10-20 levels: number line as a counting aid + number pad to type the answer */
            <div
              className="flex-1 mx-3 mb-3 mt-1 rounded-3xl overflow-y-auto flex flex-col items-center justify-center gap-4 p-4"
              style={{ border: "3px dashed rgba(100,120,200,0.4)", background: "rgba(255,255,255,0.4)" }}
            >
              <NumberLine a={a} b={b} op={op} answer={answer} solved={solved} />

              <div className="grid grid-cols-6 gap-2 w-full max-w-md">
                {["1","2","3","4","5","⌫","6","7","8","9","0","OK"].map((k) => {
                  const isOk = k === "OK", isDel = k === "⌫";
                  return (
                    <button
                      key={k}
                      onClick={() => padPress(k)}
                      disabled={solved}
                      className="h-14 rounded-2xl font-black text-2xl shadow active:scale-95 transition-all disabled:opacity-50"
                      style={isOk
                        ? { background: "#22c55e", color: "#fff" }
                        : isDel
                        ? { background: "#f59e0b", color: "#fff" }
                        : { background: "#fff", color: "#334155" }}
                    >
                      {k}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
          /* Character palette — drag these into the "?" slot */
          <div
            className="flex-1 mx-3 mb-3 mt-1 rounded-3xl overflow-y-auto"
            style={{ border: "3px dashed rgba(100,120,200,0.4)", background: "rgba(255,255,255,0.4)" }}
          >
            <div className="flex flex-wrap items-end justify-center gap-x-2 gap-y-6 p-4 pt-8">
              {(BIG_LEVELS.has(level) ? CHARACTERS : SMALL_CAST).map((c) => (
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
          )}
        </>
      )}

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
