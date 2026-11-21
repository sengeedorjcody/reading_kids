"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSpeech } from "@/hooks/useSpeech";
import { ITEMS, QUESTIONS, itemLabel, type DrivingQuestion } from "@/data/drivingTest";
import { HAZARD } from "@/data/driving/hazard";

const MOCK_SIZE = 50;
const PASS_RATE = 0.9;
const WRONG_KEY = "drivingTestWrongIds.v2"; // v2: item ids changed (stage 2 → 100+n)

type Mode = "mock" | "item" | "wrong";
type Screen = "menu" | "quiz" | "result";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadWrong(): string[] {
  try {
    const raw = localStorage.getItem(WRONG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveWrong(ids: string[]) {
  try {
    localStorage.setItem(WRONG_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable — progress just isn't remembered */
  }
}

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function DrivingTestPage() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [mode, setMode] = useState<Mode>("mock");
  const [questions, setQuestions] = useState<DrivingQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [showJa, setShowJa] = useState(true);
  const [showMn, setShowMn] = useState(true);
  const [showEn, setShowEn] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);
  const { speak, stop } = useSpeech();

  useEffect(() => {
    setWrongIds(loadWrong());
  }, []);

  useEffect(() => {
    if (screen !== "quiz") return;
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [screen]);

  const itemCounts = useMemo(() => {
    const m = new Map<number, number>();
    for (const q of QUESTIONS) m.set(q.item, (m.get(q.item) ?? 0) + 1);
    return m;
  }, []);

  function start(m: Mode, qs: DrivingQuestion[]) {
    if (qs.length === 0) return;
    setMode(m);
    setQuestions(qs);
    setIdx(0);
    setAnswers({});
    setElapsed(0);
    startedAt.current = Date.now();
    setScreen("quiz");
  }

  function startMock() {
    start("mock", shuffle(QUESTIONS).slice(0, MOCK_SIZE));
  }
  function startItem(item: number) {
    start("item", QUESTIONS.filter((q) => q.item === item));
  }
  function startWrong() {
    const set = new Set(wrongIds);
    start("wrong", shuffle(QUESTIONS.filter((q) => set.has(q.id))));
  }

  function finish(finalAnswers: Record<string, boolean>) {
    stop();
    const set = new Set(wrongIds);
    for (const q of questions) {
      if (!(q.id in finalAnswers)) continue;
      if (finalAnswers[q.id] === q.answer) set.delete(q.id);
      else set.add(q.id);
    }
    const next = Array.from(set);
    setWrongIds(next);
    saveWrong(next);
    setScreen("result");
  }

  const q = questions[idx];
  const answered = q ? q.id in answers : false;
  const instant = mode !== "mock";
  const showFeedback = answered && instant;

  function choose(value: boolean) {
    if (!q || answered) return;
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (!instant) goNext(next);
  }

  function goNext(current = answers) {
    stop();
    if (idx + 1 >= questions.length) finish(current);
    else setIdx(idx + 1);
  }

  // ── Menu ────────────────────────────────────────────────────────────
  if (screen === "menu") {
    return (
      <div className="min-h-screen px-4 py-6 max-w-xl mx-auto text-white">
        <Link href="/" className="text-white/60 text-sm font-bold">← Буцах</Link>
        <h1 className="text-2xl font-black mt-3">🚗 運転免許 学科試験</h1>
        <p className="text-white/60 text-sm font-bold mb-5">
          外免切替 (гадаад үнэмлэх солих) шалгалтын бэлтгэл · ○× асуулт
        </p>

        <button
          onClick={startMock}
          className="w-full text-left rounded-3xl p-5 mb-3 bg-gradient-to-r from-orange-500 to-rose-500 active:scale-[0.98] transition-transform"
        >
          <div className="font-black text-lg">📝 Mock test</div>
          <div className="text-white/90 text-sm font-bold">
            {Math.min(MOCK_SIZE, QUESTIONS.length)} санамсаргүй асуулт · {Math.round(PASS_RATE * 100)}% зөв бол тэнцнэ
          </div>
        </button>

        <Link
          href="/driving-test/hazard"
          className="block w-full text-left rounded-3xl p-5 mb-3 bg-gradient-to-r from-amber-500 to-orange-600 active:scale-[0.98] transition-transform"
        >
          <div className="font-black text-lg">⚠️ 危険予測</div>
          <div className="text-white/90 text-sm font-bold">Зурагтай аюул таамаглах асуулт · {HAZARD.length} асуулт</div>
        </Link>

        <button
          onClick={startWrong}
          disabled={wrongIds.length === 0}
          className="w-full text-left rounded-3xl p-5 mb-5 bg-white/10 disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          <div className="font-black text-lg">🔁 Алдсан асуултууд</div>
          <div className="text-white/70 text-sm font-bold">
            {wrongIds.length > 0 ? `${wrongIds.length} асуулт давтах` : "Одоогоор алдсан асуулт алга"}
          </div>
        </button>

        <h2 className="font-black text-white/80 mb-2">Сэдвээр бодох</h2>
        {([1, 2] as const).map((stage) => {
          const items = ITEMS.filter((it) => it.stage === stage && itemCounts.has(it.id));
          if (items.length === 0) return null;
          return (
            <div key={stage} className="mb-4">
              <h3 className="text-white/50 text-xs font-black mb-1.5">第{stage}段階</h3>
              <div className="grid gap-2">
                {items.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => startItem(it.id)}
                    className="flex items-center gap-3 text-left rounded-2xl p-4 bg-white/10 active:scale-[0.98] transition-transform"
                  >
                    <span className="w-9 h-9 rounded-full bg-white text-slate-800 font-black flex items-center justify-center shrink-0">
                      {it.num}
                    </span>
                    <span className="flex-1">
                      <span className="block font-black">{it.ja}</span>
                      <span className="block text-white/60 text-xs font-bold">{it.mn}</span>
                      <span className="block text-white/40 text-xs font-bold">{it.en}</span>
                    </span>
                    <span className="text-white/60 text-sm font-bold">{itemCounts.get(it.id)} асуулт</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        <p className="text-white/40 text-xs font-bold mt-5">
          Нийт {QUESTIONS.length} асуулт нэмэгдсэн. Дараагийн хуудсуудыг нэмсээр байна.
        </p>
      </div>
    );
  }

  // ── Result ──────────────────────────────────────────────────────────
  if (screen === "result") {
    const total = questions.length;
    const correct = questions.filter((x) => answers[x.id] === x.answer).length;
    const pct = total ? correct / total : 0;
    const passed = pct >= PASS_RATE;
    const wrong = questions.filter((x) => answers[x.id] !== x.answer);
    return (
      <div className="min-h-screen px-4 py-6 max-w-xl mx-auto text-white">
        <div className="text-center mb-5">
          <div className="text-5xl mb-2">{passed ? "🎉" : "💪"}</div>
          <div className="text-4xl font-black">{correct} / {total}</div>
          <div className="text-white/70 font-bold">
            {Math.round(pct * 100)}% · {passed ? "Тэнцлээ!" : `Тэнцэхийн тулд ${Math.round(PASS_RATE * 100)}% хэрэгтэй`}
          </div>
          <div className="text-white/40 text-xs font-bold mt-1">⏱ {fmtTime(elapsed)}</div>
        </div>

        {wrong.length > 0 && (
          <>
            <h2 className="font-black mb-2">Алдсан асуултууд ({wrong.length})</h2>
            <div className="grid gap-3 mb-5">
              {wrong.map((w) => (
                <div key={w.id} className="rounded-2xl bg-white text-slate-800 p-4">
                  <div className="text-xs font-black text-slate-400 mb-1">
                    {itemLabel(w.item)} · {w.no}問
                  </div>
                  <p className="font-bold leading-relaxed">{w.ja}</p>
                  <p className="text-sm text-slate-500 mt-1">{w.mn}</p>
                  <p className="text-sm text-slate-400 mt-1">{w.en}</p>
                  <p className="mt-2 text-sm font-black">
                    Зөв хариулт: <span className={w.answer ? "text-green-600" : "text-red-600"}>{w.answer ? "○" : "×"}</span>
                    {w.id in answers && (
                      <span className="text-slate-400 font-bold"> · Таны хариулт: {answers[w.id] ? "○" : "×"}</span>
                    )}
                  </p>
                  {w.explainJa && (
                    <p className="mt-2 text-sm bg-amber-50 rounded-xl p-3">
                      {w.explainJa}
                      {w.explainMn && <span className="block text-slate-500 mt-1">{w.explainMn}</span>}
                      {w.explainEn && <span className="block text-slate-400 mt-1">{w.explainEn}</span>}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setScreen("menu")}
            className="flex-1 rounded-2xl py-3 font-black bg-white/10 active:scale-95 transition-transform"
          >
            Цэс
          </button>
          <button
            onClick={() => (mode === "mock" ? startMock() : mode === "wrong" ? startWrong() : start(mode, shuffle(questions)))}
            className="flex-1 rounded-2xl py-3 font-black bg-gradient-to-r from-orange-500 to-rose-500 active:scale-95 transition-transform"
          >
            Дахин бодох
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz ────────────────────────────────────────────────────────────
  const isCorrect = answered && answers[q.id] === q.answer;
  return (
    <div className="min-h-screen flex flex-col px-4 py-4 max-w-xl mx-auto text-white">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => {
            stop();
            setScreen("menu");
          }}
          className="text-white/60 text-sm font-bold"
        >
          ✕ Гарах
        </button>
        <span className="text-white/60 text-sm font-black">
          {idx + 1} / {questions.length} · ⏱ {fmtTime(elapsed)}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setShowJa((v) => !v)}
            className={`text-xs font-black px-3 py-1 rounded-full ${showJa ? "bg-white text-slate-800" : "bg-white/10 text-white/70"}`}
          >
            JP
          </button>
          <button
            onClick={() => setShowMn((v) => !v)}
            className={`text-xs font-black px-3 py-1 rounded-full ${showMn ? "bg-white text-slate-800" : "bg-white/10 text-white/70"}`}
          >
            MN
          </button>
          <button
            onClick={() => setShowEn((v) => !v)}
            className={`text-xs font-black px-3 py-1 rounded-full ${showEn ? "bg-white text-slate-800" : "bg-white/10 text-white/70"}`}
          >
            EN
          </button>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-400 to-rose-500 transition-all"
          style={{ width: `${((idx + (answered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <div className="rounded-3xl bg-white text-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-slate-400">{itemLabel(q.item)} · {q.no}問</span>
          <button
            onClick={() => speak(q.ja)}
            aria-label="Унших"
            className="w-9 h-9 rounded-full bg-slate-100 active:scale-90 transition-transform"
          >
            🔊
          </button>
        </div>
        {q.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={q.image}
            alt=""
            className="w-full rounded-2xl mb-3 bg-slate-100"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
        {showJa && <p className="text-lg font-bold leading-relaxed">{q.ja}</p>}
        {showMn && <p className="text-sm text-slate-500 mt-3 leading-relaxed">{q.mn}</p>}
        {showEn && <p className="text-sm text-slate-400 mt-2 leading-relaxed">{q.en}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        {([true, false] as const).map((v) => {
          const picked = answered && answers[q.id] === v;
          let cls = "bg-white text-slate-800";
          if (showFeedback) {
            if (v === q.answer) cls = "bg-green-500 text-white";
            else if (picked) cls = "bg-red-500 text-white";
            else cls = "bg-white/20 text-white/50";
          } else if (picked) {
            cls = "bg-sky-500 text-white";
          }
          return (
            <button
              key={String(v)}
              onClick={() => choose(v)}
              disabled={answered}
              className={`rounded-3xl py-6 text-5xl font-black shadow-lg active:scale-95 transition-all ${cls}`}
            >
              {v ? "○" : "×"}
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div className="mt-4 rounded-2xl bg-white/10 p-4">
          <div className={`font-black mb-1 ${isCorrect ? "text-green-300" : "text-red-300"}`}>
            {isCorrect ? "✅ Зөв!" : `❌ Буруу — зөв хариулт ${q.answer ? "○" : "×"}`}
          </div>
          {q.explainJa ? (
            <p className="text-sm leading-relaxed">
              {showJa && q.explainJa}
              {showMn && q.explainMn && <span className="block text-white/60 mt-1">{q.explainMn}</span>}
              {showEn && q.explainEn && <span className="block text-white/50 mt-1">{q.explainEn}</span>}
            </p>
          ) : (
            <p className="text-sm text-white/50">Энэ асуултад тусгай тайлбар байхгүй.</p>
          )}
        </div>
      )}

      {showFeedback && (
        <button
          onClick={() => goNext()}
          className="mt-4 rounded-2xl py-3.5 font-black bg-gradient-to-r from-orange-500 to-rose-500 active:scale-95 transition-transform"
        >
          {idx + 1 >= questions.length ? "Дүн харах" : "Дараагийн →"}
        </button>
      )}
    </div>
  );
}
