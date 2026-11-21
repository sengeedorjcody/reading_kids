"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSpeech } from "@/hooks/useSpeech";
import { hazardImageUrl } from "@/data/drivingTest";
import { HAZARD, type HazardQuestion } from "@/data/driving/hazard";

type Screen = "intro" | "quiz" | "result";
// A question's three picks: undefined = not answered yet.
type Picks = (boolean | undefined)[];

const MARKS = ["①", "②", "③"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function allRight(q: HazardQuestion, picks: Picks | undefined) {
  return !!picks && q.statements.every((s, i) => picks[i] === s.answer);
}

export default function HazardPage() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [questions, setQuestions] = useState<HazardQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<Picks>([undefined, undefined, undefined]);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<Record<number, Picks>>({});
  const [showJa, setShowJa] = useState(true);
  const [showMn, setShowMn] = useState(true);
  const [showEn, setShowEn] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const { speak, stop } = useSpeech();
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImgFailed(false);
    topRef.current?.scrollIntoView({ block: "start" });
  }, [idx, screen]);

  function start(list: HazardQuestion[]) {
    if (list.length === 0) return;
    setQuestions(list);
    setIdx(0);
    setPicks([undefined, undefined, undefined]);
    setChecked(false);
    setResults({});
    setScreen("quiz");
  }

  function pick(i: number, value: boolean) {
    if (checked) return;
    setPicks((p) => p.map((x, k) => (k === i ? value : x)));
  }

  function check() {
    if (picks.some((p) => p === undefined)) return;
    const q = questions[idx];
    setResults((r) => ({ ...r, [q.no]: picks }));
    setChecked(true);
  }

  function next() {
    stop();
    if (idx + 1 >= questions.length) {
      setScreen("result");
      return;
    }
    setIdx(idx + 1);
    setPicks([undefined, undefined, undefined]);
    setChecked(false);
  }

  // ── Intro ───────────────────────────────────────────────────────────
  if (screen === "intro") {
    return (
      <div className="min-h-screen px-4 py-6 max-w-xl mx-auto text-white">
        <Link href="/driving-test" className="text-white/60 text-sm font-bold">← Буцах</Link>
        <h1 className="text-2xl font-black mt-3">⚠️ 危険予測問題</h1>
        <p className="text-white/60 text-sm font-bold mb-5">Аюул таамаглах асуулт · Hazard prediction</p>

        <div className="rounded-3xl bg-white/10 p-5 mb-4 text-sm leading-relaxed font-bold">
          <p>Зургийг хараад жолоодлогын нөхцөлийг төсөөлнө. Асуулт бүрт ①②③ гэсэн 3 дүгнэлт байна.</p>
          <p className="mt-2 text-white/70">
            Дүгнэлт бүрийг 正 (○ зөв) эсвэл 誤 (× буруу) гэж тэмдэглэнэ. 3 дүгнэлтийн <span className="text-amber-300">бүгдийг</span> зөв
            тэмдэглэсэн үед л асуулт зөв гэж тооцогдоно.
          </p>
          <p className="mt-2 text-white/50 text-xs">The question counts only when all three judgments are correct.</p>
        </div>

        <button
          onClick={() => start(HAZARD)}
          className="w-full text-left rounded-3xl p-5 mb-3 bg-gradient-to-r from-orange-500 to-rose-500 active:scale-[0.98] transition-transform"
        >
          <div className="font-black text-lg">▶ Дарааллаар нь</div>
          <div className="text-white/90 text-sm font-bold">{HAZARD.length} асуулт</div>
        </button>
        <button
          onClick={() => start(shuffle(HAZARD))}
          className="w-full text-left rounded-3xl p-5 bg-white/10 active:scale-[0.98] transition-transform"
        >
          <div className="font-black text-lg">🔀 Санамсаргүй дараалал</div>
          <div className="text-white/70 text-sm font-bold">{HAZARD.length} асуулт</div>
        </button>
      </div>
    );
  }

  // ── Result ──────────────────────────────────────────────────────────
  if (screen === "result") {
    const total = questions.length;
    const correct = questions.filter((x) => allRight(x, results[x.no])).length;
    const wrong = questions.filter((x) => !allRight(x, results[x.no]));
    return (
      <div className="min-h-screen px-4 py-6 max-w-xl mx-auto text-white">
        <div className="text-center mb-5">
          <div className="text-5xl mb-2">{correct === total ? "🎉" : "💪"}</div>
          <div className="text-4xl font-black">{correct} / {total}</div>
          <div className="text-white/70 font-bold">3 дүгнэлт бүгд зөв байсан асуултын тоо</div>
        </div>

        {wrong.length > 0 && (
          <>
            <h2 className="font-black mb-2">Алдсан асуултууд ({wrong.length})</h2>
            <div className="grid gap-2 mb-5">
              {wrong.map((w) => (
                <div key={w.no} className="rounded-2xl bg-white text-slate-800 p-4">
                  <div className="text-xs font-black text-slate-400 mb-1">{w.no}問</div>
                  <p className="font-bold leading-relaxed">{w.ja}</p>
                  <p className="font-mn text-sm text-slate-500 mt-1">{w.mn}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Link
            href="/driving-test"
            className="flex-1 text-center rounded-2xl py-3 font-black bg-white/10 active:scale-95 transition-transform"
          >
            Цэс
          </Link>
          <button
            onClick={() => start(wrong.length > 0 ? wrong : shuffle(HAZARD))}
            className="flex-1 rounded-2xl py-3 font-black bg-gradient-to-r from-orange-500 to-rose-500 active:scale-95 transition-transform"
          >
            {wrong.length > 0 ? "Алдсанаа давтах" : "Дахин бодох"}
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz ────────────────────────────────────────────────────────────
  const q = questions[idx];
  const img = hazardImageUrl(q.no);
  const ok = checked && allRight(q, picks);
  const ready = picks.every((p) => p !== undefined);

  return (
    <div className="min-h-screen flex flex-col px-4 py-4 max-w-xl mx-auto text-white">
      <div ref={topRef} />
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => {
            stop();
            setScreen("intro");
          }}
          className="text-white/60 text-sm font-bold"
        >
          ✕ Гарах
        </button>
        <span className="text-white/60 text-sm font-black">{idx + 1} / {questions.length}</span>
        <div className="flex gap-1">
          {([["JP", showJa, setShowJa], ["MN", showMn, setShowMn], ["EN", showEn, setShowEn]] as const).map(([label, on, set]) => (
            <button
              key={label}
              onClick={() => set((v) => !v)}
              className={`text-xs font-black px-3 py-1 rounded-full ${on ? "bg-white text-slate-800" : "bg-white/10 text-white/70"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-400 to-rose-500 transition-all"
          style={{ width: `${((idx + (checked ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <div className="rounded-3xl bg-white text-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-slate-400">危険予測 · {q.no}問</span>
          <button
            onClick={() => speak(q.ja)}
            aria-label="Унших"
            className="w-9 h-9 rounded-full bg-slate-100 active:scale-90 transition-transform"
          >
            🔊
          </button>
        </div>
        {img && !imgFailed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            className="w-full rounded-2xl mb-3 bg-slate-100"
            onError={() => setImgFailed(true)}
          />
        )}
        {showJa && <p className="text-lg font-bold leading-relaxed">{q.ja}</p>}
        {showMn && <p className="font-mn text-sm text-slate-500 mt-2 leading-relaxed">{q.mn}</p>}
        {showEn && <p className="text-sm text-slate-400 mt-1 leading-relaxed">{q.en}</p>}
      </div>

      <div className="grid gap-3 mt-4">
        {q.statements.map((s, i) => {
          const p = picks[i];
          const right = checked && p === s.answer;
          const wrong = checked && p !== s.answer;
          return (
            <div
              key={i}
              className={`rounded-2xl p-4 ${right ? "bg-green-500/20 ring-2 ring-green-400" : wrong ? "bg-red-500/20 ring-2 ring-red-400" : "bg-white/10"}`}
            >
              <div className="flex gap-2">
                <span className="font-black text-lg leading-snug">{MARKS[i]}</span>
                <div className="flex-1 text-sm leading-relaxed">
                  {showJa && <p className="font-bold">{s.ja}</p>}
                  {showMn && <p className="font-mn text-white/70 mt-1">{s.mn}</p>}
                  {showEn && <p className="text-white/50 mt-1">{s.en}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {([true, false] as const).map((v) => {
                  const picked = p === v;
                  let cls = picked ? "bg-sky-500 text-white" : "bg-white text-slate-800";
                  if (checked) {
                    if (v === s.answer) cls = "bg-green-500 text-white";
                    else if (picked) cls = "bg-red-500 text-white";
                    else cls = "bg-white/20 text-white/40";
                  }
                  return (
                    <button
                      key={String(v)}
                      onClick={() => pick(i, v)}
                      disabled={checked}
                      className={`rounded-xl py-2.5 font-black text-lg active:scale-95 transition-all ${cls}`}
                    >
                      {v ? "正 ○" : "誤 ×"}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {checked && (
        <div className="mt-4 rounded-2xl bg-white/10 p-4">
          <div className={`font-black mb-1 ${ok ? "text-green-300" : "text-red-300"}`}>
            {ok ? "✅ Бүгд зөв!" : "❌ Алдаа байна — ногоон нь зөв хариулт"}
          </div>
          {q.explainJa ? (
            <p className="text-sm leading-relaxed">
              {showJa && q.explainJa}
              {showMn && q.explainMn && <span className="font-mn block text-white/60 mt-1">{q.explainMn}</span>}
              {showEn && q.explainEn && <span className="block text-white/50 mt-1">{q.explainEn}</span>}
            </p>
          ) : (
            <p className="text-sm text-white/50">Энэ асуултад тусгай тайлбар байхгүй.</p>
          )}
        </div>
      )}

      {!checked ? (
        <button
          onClick={check}
          disabled={!ready}
          className="mt-4 rounded-2xl py-3.5 font-black bg-gradient-to-r from-orange-500 to-rose-500 disabled:opacity-40 active:scale-95 transition-transform"
        >
          {ready ? "Шалгах" : "3 дүгнэлтийг бүгдийг сонгоно уу"}
        </button>
      ) : (
        <button
          onClick={next}
          className="mt-4 rounded-2xl py-3.5 font-black bg-gradient-to-r from-orange-500 to-rose-500 active:scale-95 transition-transform"
        >
          {idx + 1 >= questions.length ? "Дүн харах" : "Дараагийн →"}
        </button>
      )}
    </div>
  );
}
