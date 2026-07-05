"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSpeech } from "@/hooks/useSpeech";

// ── Character grids ───────────────────────────────────────────────────────────
// Romaji label for the first character of each row
const ROW_ROMAJI = ["a","ka","sa","ta","na","ha","ma","ya","ra","wa","n","ga","za","da","ba","pa","(s)"];

const HIRAGANA_ROWS = [
  ["あ","い","う","え","お"],
  ["か","き","く","け","こ"],
  ["さ","し","す","せ","そ"],
  ["た","ち","つ","て","と"],
  ["な","に","ぬ","ね","の"],
  ["は","ひ","ふ","へ","ほ"],
  ["ま","み","む","め","も"],
  ["や","　","ゆ","　","よ"],
  ["ら","り","る","れ","ろ"],
  ["わ","　","　","　","を"],
  ["ん","　","　","　","　"],
  ["が","ぎ","ぐ","げ","ご"],
  ["ざ","じ","ず","ぜ","ぞ"],
  ["だ","ぢ","づ","で","ど"],
  ["ば","び","ぶ","べ","ぼ"],
  ["ぱ","ぴ","ぷ","ぺ","ぽ"],
  ["っ","ゃ","ゅ","ょ","ー"],
];

const KATAKANA_ROWS = [
  ["ア","イ","ウ","エ","オ"],
  ["カ","キ","ク","ケ","コ"],
  ["サ","シ","ス","セ","ソ"],
  ["タ","チ","ツ","テ","ト"],
  ["ナ","ニ","ヌ","ネ","ノ"],
  ["ハ","ヒ","フ","ヘ","ホ"],
  ["マ","ミ","ム","メ","モ"],
  ["ヤ","　","ユ","　","ヨ"],
  ["ラ","リ","ル","レ","ロ"],
  ["ワ","　","　","　","ヲ"],
  ["ン","　","　","　","　"],
  ["ガ","ギ","グ","ゲ","ゴ"],
  ["ザ","ジ","ズ","ゼ","ゾ"],
  ["ダ","ヂ","ヅ","デ","ド"],
  ["バ","ビ","ブ","ベ","ボ"],
  ["パ","ピ","プ","ペ","ポ"],
  ["ッ","ャ","ュ","ョ","ー"],
];

const SIMILAR: Record<string, string[]> = {
  "あ":["お","め"], "お":["あ","す"], "い":["り","こ"], "り":["い","け"],
  "う":["っ","ゆ"], "っ":["う","つ"], "え":["れ","ね"], "ね":["れ","え","ぬ"],
  "き":["さ"],      "さ":["き","ち"], "し":["つ","ン"], "つ":["し","っ"],
  "ぬ":["め","ね","の"], "め":["ぬ","ね"], "は":["ほ"], "ほ":["は"],
  "ふ":["ぬ"], "る":["ろ"], "ろ":["る"], "ん":["そ","こ"], "そ":["こ","ん"],
  "ア":["マ"], "マ":["ア"], "シ":["ツ","ン"], "ツ":["シ","ン"],
  "ン":["ソ","シ"], "ソ":["ン"], "ウ":["ワ"], "ワ":["ウ"],
};

const WORD_DICT: { word: string; meaning: string }[] = [
  {word:"あか",meaning:"red"}, {word:"あお",meaning:"blue"}, {word:"あめ",meaning:"rain"},
  {word:"あし",meaning:"leg"}, {word:"いぬ",meaning:"dog"}, {word:"いす",meaning:"chair"},
  {word:"うみ",meaning:"sea"}, {word:"うし",meaning:"cow"}, {word:"えき",meaning:"station"},
  {word:"おか",meaning:"hill"}, {word:"おに",meaning:"demon"}, {word:"かさ",meaning:"umbrella"},
  {word:"かに",meaning:"crab"}, {word:"きつね",meaning:"fox"}, {word:"くも",meaning:"cloud"},
  {word:"くつ",meaning:"shoes"}, {word:"こ",meaning:"child"}, {word:"さかな",meaning:"fish"},
  {word:"さる",meaning:"monkey"}, {word:"しか",meaning:"deer"}, {word:"すし",meaning:"sushi"},
  {word:"せかい",meaning:"world"}, {word:"そら",meaning:"sky"}, {word:"たこ",meaning:"octopus"},
  {word:"たまご",meaning:"egg"}, {word:"つき",meaning:"moon"}, {word:"て",meaning:"hand"},
  {word:"とり",meaning:"bird"}, {word:"なつ",meaning:"summer"}, {word:"にほん",meaning:"Japan"},
  {word:"ねこ",meaning:"cat"}, {word:"はな",meaning:"flower"}, {word:"はこ",meaning:"box"},
  {word:"ひこうき",meaning:"airplane"}, {word:"ふね",meaning:"boat"}, {word:"ほし",meaning:"star"},
  {word:"ほん",meaning:"book"}, {word:"まど",meaning:"window"}, {word:"みず",meaning:"water"},
  {word:"みち",meaning:"road"}, {word:"むし",meaning:"insect"}, {word:"め",meaning:"eye"},
  {word:"もも",meaning:"peach"}, {word:"もり",meaning:"forest"}, {word:"やま",meaning:"mountain"},
  {word:"ゆき",meaning:"snow"}, {word:"よる",meaning:"night"}, {word:"らいおん",meaning:"lion"},
  {word:"りんご",meaning:"apple"}, {word:"わに",meaning:"crocodile"}, {word:"わたし",meaning:"I/me"},
  {word:"ごはん",meaning:"rice/meal"}, {word:"おはよう",meaning:"good morning"},
  {word:"ありがとう",meaning:"thank you"}, {word:"がっこう",meaning:"school"},
  {word:"せんせい",meaning:"teacher"}, {word:"ともだち",meaning:"friend"},
  {word:"かぞく",meaning:"family"}, {word:"おかあさん",meaning:"mother"},
  {word:"おとうさん",meaning:"father"}, {word:"おねえさん",meaning:"older sister"},
  {word:"おにいさん",meaning:"older brother"},
  {word:"アイス",meaning:"ice cream"}, {word:"ケーキ",meaning:"cake"}, {word:"パン",meaning:"bread"},
  {word:"ラーメン",meaning:"ramen"}, {word:"テレビ",meaning:"TV"}, {word:"スマホ",meaning:"smartphone"},
  {word:"カメラ",meaning:"camera"}, {word:"バス",meaning:"bus"}, {word:"タクシー",meaning:"taxi"},
  {word:"ホテル",meaning:"hotel"}, {word:"ロボット",meaning:"robot"}, {word:"コーヒー",meaning:"coffee"},
  {word:"ミルク",meaning:"milk"}, {word:"ジュース",meaning:"juice"}, {word:"チョコ",meaning:"chocolate"},
];

type Tab = "hiragana" | "katakana";

// ── Handwriting recognition helpers ──────────────────────────────────────────
const FEAT = 28; // comparison grid size

function normalizeDrawing(src: HTMLCanvasElement): Float32Array {
  const ctx = src.getContext("2d")!;
  const { width: W, height: H } = src;
  const raw = ctx.getImageData(0, 0, W, H).data;

  // Find bounding box of dark pixels
  let x0 = W, x1 = 0, y0 = H, y1 = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const brightness = (raw[i] + raw[i+1] + raw[i+2]) / 3;
      if (brightness < 180) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x);
        y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
    }
  }
  if (x0 > x1 || y0 > y1) return new Float32Array(FEAT * FEAT);

  // Pad bounding box slightly
  const pad = 8;
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
  x1 = Math.min(W - 1, x1 + pad); y1 = Math.min(H - 1, y1 + pad);

  // Draw cropped content into FEAT×FEAT temp canvas
  const tmp = document.createElement("canvas");
  tmp.width = tmp.height = FEAT;
  const tc = tmp.getContext("2d")!;
  tc.fillStyle = "#ffffff";
  tc.fillRect(0, 0, FEAT, FEAT);
  tc.drawImage(src, x0, y0, x1 - x0, y1 - y0, 0, 0, FEAT, FEAT);

  const td = tc.getImageData(0, 0, FEAT, FEAT).data;
  const out = new Float32Array(FEAT * FEAT);
  for (let i = 0; i < FEAT * FEAT; i++) {
    const b = (td[i*4] + td[i*4+1] + td[i*4+2]) / 3;
    out[i] = 1 - b / 255; // dark=1, white=0
  }
  return out;
}

function renderCharFeature(char: string): Float32Array {
  const tmp = document.createElement("canvas");
  tmp.width = tmp.height = FEAT;
  const tc = tmp.getContext("2d")!;
  tc.fillStyle = "#ffffff";
  tc.fillRect(0, 0, FEAT, FEAT);
  tc.fillStyle = "#000000";
  tc.font = `bold ${FEAT * 0.82}px 'Noto Sans JP', serif`;
  tc.textAlign = "center";
  tc.textBaseline = "middle";
  tc.fillText(char, FEAT / 2, FEAT / 2 + 1);
  const d = tc.getImageData(0, 0, FEAT, FEAT).data;
  const out = new Float32Array(FEAT * FEAT);
  for (let i = 0; i < FEAT * FEAT; i++) {
    const b = (d[i*4] + d[i*4+1] + d[i*4+2]) / 3;
    out[i] = 1 - b / 255;
  }
  return out;
}

function cosineSim(a: Float32Array, b: Float32Array): number {
  let dot = 0, mA = 0, mB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    mA  += a[i] * a[i];
    mB  += b[i] * b[i];
  }
  return dot / (Math.sqrt(mA) * Math.sqrt(mB) + 1e-9);
}

// ── Draw popup ────────────────────────────────────────────────────────────────
const CS = 260; // canvas display + logical size

function DrawModal({
  tab,
  onSelect,
  onClose,
}: {
  tab: Tab;
  onSelect: (char: string) => void;
  onClose: () => void;
}) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const isDrawing   = useRef(false);
  const lastPos     = useRef<{ x: number; y: number } | null>(null);
  const [guesses, setGuesses]   = useState<string[]>([]);
  const [loading, setLoading]   = useState(false);
  const [hasInk, setHasInk]     = useState(false);

  useEffect(() => {
    const c = canvasRef.current?.getContext("2d");
    if (!c) return;
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, CS, CS);
    // draw light grid guide
    c.save();
    c.setLineDash([4, 4]);
    c.strokeStyle = "rgba(200,200,220,0.6)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(CS/2, 0); c.lineTo(CS/2, CS);
    c.moveTo(0, CS/2); c.lineTo(CS, CS/2);
    c.stroke();
    c.restore();
  }, []);

  const pos = (e: TouchEvent | MouseEvent) => {
    const el = canvasRef.current!;
    const r  = el.getBoundingClientRect();
    const sx = CS / r.width, sy = CS / r.height;
    if ("touches" in e) {
      const t = (e as TouchEvent).touches[0];
      return { x: (t.clientX - r.left) * sx, y: (t.clientY - r.top) * sy };
    }
    const m = e as MouseEvent;
    return { x: (m.clientX - r.left) * sx, y: (m.clientY - r.top) * sy };
  };

  const startDraw = useCallback((e: TouchEvent | MouseEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current   = pos(e);
    setHasInk(true);
    setGuesses([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveDraw = useCallback((e: TouchEvent | MouseEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const c = canvasRef.current?.getContext("2d");
    if (!c || !lastPos.current) return;
    const p = pos(e);
    c.save();
    c.strokeStyle = "#1e293b";
    c.lineWidth   = 6;
    c.lineCap     = "round";
    c.lineJoin    = "round";
    c.beginPath();
    c.moveTo(lastPos.current.x, lastPos.current.y);
    c.lineTo(p.x, p.y);
    c.stroke();
    c.restore();
    lastPos.current = p;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const endDraw = useCallback((e: TouchEvent | MouseEvent) => {
    e.preventDefault();
    isDrawing.current = false;
    lastPos.current   = null;
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("mousedown",  startDraw);
    el.addEventListener("mousemove",  moveDraw);
    el.addEventListener("mouseup",    endDraw);
    el.addEventListener("mouseleave", endDraw);
    el.addEventListener("touchstart", startDraw, { passive: false });
    el.addEventListener("touchmove",  moveDraw,  { passive: false });
    el.addEventListener("touchend",   endDraw,   { passive: false });
    return () => {
      el.removeEventListener("mousedown",  startDraw);
      el.removeEventListener("mousemove",  moveDraw);
      el.removeEventListener("mouseup",    endDraw);
      el.removeEventListener("mouseleave", endDraw);
      el.removeEventListener("touchstart", startDraw);
      el.removeEventListener("touchmove",  moveDraw);
      el.removeEventListener("touchend",   endDraw);
    };
  }, [startDraw, moveDraw, endDraw]);

  const clearCanvas = () => {
    const c = canvasRef.current?.getContext("2d");
    if (!c) return;
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, CS, CS);
    c.save();
    c.setLineDash([4, 4]);
    c.strokeStyle = "rgba(200,200,220,0.6)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(CS/2, 0); c.lineTo(CS/2, CS);
    c.moveTo(0, CS/2); c.lineTo(CS, CS/2);
    c.stroke();
    c.restore();
    setGuesses([]);
    setHasInk(false);
  };

  const guess = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setLoading(true);

    // Run in next tick so UI can update
    setTimeout(() => {
      const userVec = normalizeDrawing(canvas);
      const chars = (tab === "hiragana" ? HIRAGANA_ROWS : KATAKANA_ROWS)
        .flat().filter((c) => c !== "　");

      const scored = chars.map((ch) => ({
        ch,
        score: cosineSim(userVec, renderCharFeature(ch)),
      }));
      scored.sort((a, b) => b.score - a.score);
      setGuesses(scored.slice(0, 9).map((s) => s.ch));
      setLoading(false);
    }, 30);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet — pb-24 lifts content above the fixed BottomNav */}
      <div className="relative z-10 w-full max-w-sm rounded-t-3xl px-4 pt-4 pb-24 flex flex-col gap-3"
        style={{ background: "linear-gradient(160deg,#1a1a2e,#16213e)", border: "1px solid rgba(255,255,255,0.1)" }}>

        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-1" />

        <h3 className="text-white font-black text-center text-lg">✏️ もじをかいてください</h3>
        <p className="text-white/40 text-xs text-center -mt-1">Draw a character — we'll guess it</p>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={CS} height={CS}
          className="w-full rounded-2xl touch-none cursor-crosshair"
          style={{ border: "2px solid rgba(255,255,255,0.2)", background: "#ffffff", aspectRatio: "1" }}
        />

        {/* Buttons */}
        <div className="flex gap-3">
          <button onClick={clearCanvas}
            className="flex-1 py-3 rounded-2xl font-black text-red-300 active:scale-95"
            style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}>
            🗑️ Clear
          </button>
          <button onClick={guess} disabled={!hasInk || loading}
            className="flex-1 py-3 rounded-2xl font-black text-white active:scale-95 disabled:opacity-40"
            style={{ background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            {loading ? "⏳ …" : "🔍 Guess"}
          </button>
        </div>

        {/* Suggestions grid */}
        {guesses.length > 0 && (
          <div>
            <p className="text-white/40 text-xs font-bold text-center mb-2">これですか？ Tap to select</p>
            <div className="grid grid-cols-3 gap-2">
              {guesses.map((ch, i) => (
                <button key={ch}
                  onClick={() => { onSelect(ch); onClose(); }}
                  className="rounded-2xl py-3 flex flex-col items-center gap-1 active:scale-95 transition-all"
                  style={{
                    background: i === 0 ? "rgba(251,191,36,0.25)" : "rgba(255,255,255,0.08)",
                    border: i === 0 ? "2px solid rgba(251,191,36,0.6)" : "1px solid rgba(255,255,255,0.15)",
                  }}>
                  <span className="text-3xl font-black text-white">{ch}</span>
                  {i === 0 && <span className="text-[9px] font-black text-yellow-400 uppercase">Best match</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface DictEntry {
  japanese_word: string;
  hiragana?: string;
  english_meaning?: string;
  mongolian_meaning?: string;
  example_image_url?: string;
  pronunciation_audio_url?: string;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WordsPage() {
  const [tab, setTab]           = useState<Tab>("hiragana");
  const [word, setWord]         = useState<string[]>([]);
  const [lastChar, setLastChar] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState("");
  const [showDraw, setShowDraw] = useState(false);
  const [dictEntry, setDictEntry] = useState<DictEntry | null>(null);
  const inputRef                = useRef<HTMLInputElement>(null);
  const lookupTimer             = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { speak }               = useSpeech();

  const rows    = tab === "hiragana" ? HIRAGANA_ROWS : KATAKANA_ROWS;
  const current = word.join("");

  // Dictionary image lookup — debounced
  useEffect(() => {
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    if (!current) { setDictEntry(null); return; }
    lookupTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/dictionary?q=${encodeURIComponent(current)}&exact=true&limit=1`);
        const data = await res.json();
        const entry = data.words?.[0] ?? null;
        setDictEntry(entry && entry.example_image_url ? entry : null);
      } catch {
        setDictEntry(null);
      }
    }, 400);
    return () => { if (lookupTimer.current) clearTimeout(lookupTimer.current); };
  }, [current]);

  const suggestions = current.length > 0
    ? WORD_DICT.filter((w) => w.word.startsWith(current)).slice(0, 6)
    : [];
  const exactMatch = WORD_DICT.find((w) => w.word === current);
  const similar    = lastChar ? (SIMILAR[lastChar] ?? []) : [];

  const addChar = (c: string) => {
    if (c === "　") return;
    const next = [...word, c];
    setWord(next);
    setInputVal(next.join(""));
    setLastChar(c);
    speak(c);
  };

  const backspace = () => {
    setWord((w) => {
      const next = w.slice(0, -1);
      setInputVal(next.join(""));
      setLastChar(next.at(-1) ?? null);
      return next;
    });
  };

  const clear = () => { setWord([]); setLastChar(null); setInputVal(""); };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    const chars = Array.from(val);
    setWord(chars);
    setLastChar(chars.at(-1) ?? null);
  };

  const speakWord = () => { if (current) speak(current); };

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100dvh" }}>

      {/* ══ FIXED TOP ══ */}
      <div className="flex-shrink-0 flex flex-col"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>

        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xl font-black text-white">🔤 ことばつくり</h1>
        </div>

        {/* Input row */}
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-2xl px-3 py-2"
          style={{ background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.2)" }}>
          <span className="text-white/40 text-sm flex-shrink-0">⌨️</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={handleInput}
            placeholder="ここに かいてください…"
            className="flex-1 bg-transparent text-white text-lg font-bold outline-none placeholder:text-white/25 min-w-0"
            style={{ caretColor: "#fbbf24" }}
            lang="ja"
            inputMode="text"
          />
          {/* Draw button */}
          <button onClick={() => setShowDraw(true)}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg active:scale-90 transition-all"
            style={{ background: "rgba(139,92,246,0.3)", border: "1px solid rgba(139,92,246,0.5)" }}
            title="Draw a character">
            ✍️
          </button>
          {inputVal && (
            <button onClick={clear}
              className="flex-shrink-0 text-white/40 hover:text-white text-lg active:scale-90">✕</button>
          )}
        </div>

        {/* Word display */}
        <div className="mx-4 mb-2 rounded-2xl px-4 py-3 flex items-center gap-3 min-h-[60px]"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="flex-1 flex flex-wrap gap-1 min-h-[36px] items-center">
            {word.length === 0
              ? <span className="text-white/20 text-xl font-black">たたいてみよう…</span>
              : word.map((c, i) => (
                  <span key={i} className={`text-3xl font-black leading-none ${
                    i === word.length - 1 ? "text-yellow-300" : "text-white"
                  }`}>{c}</span>
                ))
            }
          </div>
          <div className="flex gap-1.5">
            <button onClick={speakWord} disabled={!current}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg active:scale-90 disabled:opacity-30"
              style={{ background: "rgba(59,130,246,0.3)", border: "1px solid rgba(59,130,246,0.5)" }}>
              🔊
            </button>
            <button onClick={backspace} disabled={word.length === 0}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg active:scale-90 disabled:opacity-30"
              style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}>
              ⌫
            </button>
            <button onClick={clear} disabled={word.length === 0}
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm active:scale-90 disabled:opacity-30 text-white/60"
              style={{ background: "rgba(100,116,139,0.2)", border: "1px solid rgba(100,116,139,0.3)" }}>
              ✕
            </button>
          </div>
        </div>

        {/* Dictionary image from DB */}
        {dictEntry && (
          <div className="mx-4 mb-2 rounded-2xl overflow-hidden flex items-stretch gap-0"
            style={{ background: "rgba(139,92,246,0.15)", border: "2px solid rgba(139,92,246,0.4)" }}>
            {/* Image */}
            <div className="w-24 h-24 flex-shrink-0 relative overflow-hidden rounded-l-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dictEntry.example_image_url}
                alt={dictEntry.japanese_word}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Info */}
            <div className="flex-1 flex flex-col justify-center px-3 py-2 gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-xl leading-tight">{dictEntry.japanese_word}</span>
                {dictEntry.hiragana && dictEntry.hiragana !== dictEntry.japanese_word && (
                  <span className="text-purple-300 text-sm font-bold">({dictEntry.hiragana})</span>
                )}
                <button
                  onClick={() => speak(dictEntry.pronunciation_audio_url || dictEntry.japanese_word)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm active:scale-90 ml-auto"
                  style={{ background: "rgba(139,92,246,0.4)" }}
                >
                  🔊
                </button>
              </div>
              {dictEntry.english_meaning && (
                <span className="text-purple-200/80 text-xs font-bold">{dictEntry.english_meaning}</span>
              )}
              {dictEntry.mongolian_meaning && (
                <span className="text-purple-300/70 text-xs">{dictEntry.mongolian_meaning}</span>
              )}
            </div>
          </div>
        )}

        {/* Exact match (local dict fallback) */}
        {exactMatch && !dictEntry && (
          <div className="mx-4 mb-2 rounded-2xl px-4 py-2.5 flex items-center gap-3"
            style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)" }}>
            <span className="text-xl">✅</span>
            <div className="flex-1">
              <span className="text-green-300 font-black text-base">{exactMatch.word}</span>
              <span className="text-green-300/60 text-sm ml-2">{exactMatch.meaning}</span>
            </div>
            <button onClick={() => speak(exactMatch.word)} className="text-lg active:scale-90">🔊</button>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && !exactMatch && (
          <div className="mx-4 mb-2 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button key={s.word}
                onClick={() => { setWord(Array.from(s.word)); setInputVal(s.word); setLastChar(null); speak(s.word); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl active:scale-95"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <span className="text-white font-black text-sm">{s.word}</span>
                <span className="text-white/40 text-xs">{s.meaning}</span>
              </button>
            ))}
          </div>
        )}

        {/* Similar chars */}
        {similar.length > 0 && (
          <div className="mx-4 mb-2 flex items-center gap-2 flex-wrap">
            <span className="text-white/30 text-xs font-bold">🔍 にている:</span>
            {similar.map((c) => (
              <button key={c} onClick={() => addChar(c)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black text-yellow-300 active:scale-90"
                style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.4)" }}>
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Tab selector */}
        <div className="flex gap-2 mx-4 mb-3 mt-1">
          {(["hiragana","katakana"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-2xl font-black text-sm transition-all active:scale-95 ${tab === t ? "text-white" : "text-white/40"}`}
              style={tab === t
                ? { background: t === "hiragana" ? "linear-gradient(135deg,#f97316,#ec4899)" : "linear-gradient(135deg,#3b82f6,#8b5cf6)" }
                : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }
              }>
              {t === "hiragana" ? "ひらがな" : "カタカナ"}
            </button>
          ))}
        </div>
      </div>

      {/* ══ SCROLLABLE GRID ══ */}
      <div className="flex-1 overflow-y-auto pb-28 px-2 pt-1">
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-0.5 mb-0.5 justify-center">
            {row.map((c, ci) => (
              <button key={ci} onClick={() => addChar(c)}
                disabled={c === "　"}
                className={`flex flex-col items-center justify-center font-black transition-all active:scale-90 ${
                  c === "　" ? "opacity-0 pointer-events-none"
                  : c === lastChar ? "text-yellow-300" : "text-white"
                }`}
                style={{
                  width: "19%", height: ci === 0 ? 44 : 38, fontSize: 16, borderRadius: 8,
                  ...(c !== "　" ? {
                    background: c === lastChar ? "rgba(251,191,36,0.25)" : "rgba(255,255,255,0.1)",
                    border: c === lastChar ? "1.5px solid rgba(251,191,36,0.6)" : "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "0 2px 0 rgba(0,0,0,0.3)",
                  } : {})
                }}>
                {ci === 0 && c !== "　" && (
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", lineHeight: 1, marginBottom: 1 }}>
                    {ROW_ROMAJI[ri]}
                  </span>
                )}
                {c === "　" ? "" : c}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* ══ DRAW MODAL ══ */}
      {showDraw && (
        <DrawModal
          tab={tab}
          onSelect={(ch) => addChar(ch)}
          onClose={() => setShowDraw(false)}
        />
      )}
    </div>
  );
}
