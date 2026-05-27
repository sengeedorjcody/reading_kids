"use client";

import { useState, useRef } from "react";
import { useSpeech } from "@/hooks/useSpeech";

// ── Character grids ───────────────────────────────────────────────────────────
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

// ── Similar-looking character hints ──────────────────────────────────────────
const SIMILAR: Record<string, string[]> = {
  "あ":["お","め"], "お":["あ","す"], "い":["り","こ"], "り":["い","け"],
  "う":["っ","ゆ"], "っ":["う","つ"], "え":["れ","ね"], "ね":["れ","え","ぬ"],
  "き":["さ"],      "さ":["き","ち"], "し":["つ","ン"], "つ":["し","っ"],
  "ぬ":["め","ね","の"], "め":["ぬ","ね"], "は":["ほ"], "ほ":["は"],
  "ふ":["ぬ"], "る":["ろ"], "ろ":["る"], "ん":["そ","こ"], "そ":["こ","ん"],
  "ア":["マ"], "マ":["ア"], "シ":["ツ","ン"], "ツ":["シ","ン"],
  "ン":["ソ","シ"], "ソ":["ン"], "ウ":["ワ"], "ワ":["ウ"],
};

// ── Word dictionary ───────────────────────────────────────────────────────────
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

export default function WordsPage() {
  const [tab, setTab]           = useState<Tab>("hiragana");
  const [word, setWord]         = useState<string[]>([]);
  const [lastChar, setLastChar] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState("");
  const inputRef                = useRef<HTMLInputElement>(null);
  const { speak }               = useSpeech();

  const rows   = tab === "hiragana" ? HIRAGANA_ROWS : KATAKANA_ROWS;
  const current = word.join("");

  const suggestions = current.length > 0
    ? WORD_DICT.filter((w) => w.word.startsWith(current)).slice(0, 6)
    : [];
  const exactMatch = WORD_DICT.find((w) => w.word === current);
  const similar    = lastChar ? (SIMILAR[lastChar] ?? []) : [];

  const addChar = (c: string) => {
    if (c === "　") return;
    setWord((w) => [...w, c]);
    setLastChar(c);
    speak(c);
  };

  const backspace = () => {
    setWord((w) => {
      const next = w.slice(0, -1);
      setLastChar(next[next.length - 1] ?? null);
      return next;
    });
  };

  const clear = () => { setWord([]); setLastChar(null); setInputVal(""); };

  // When user types directly into the input
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    setWord(Array.from(val));
    setLastChar(Array.from(val).at(-1) ?? null);
  };

  const speakWord = () => { if (current) speak(current); };

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100dvh" }}>

      {/* ══ FIXED TOP SECTION ══════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 flex flex-col"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>

        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xl font-black text-white">🔤 ことばつくり</h1>
        </div>

        {/* ── Direct text input ── */}
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-2xl px-4 py-2"
          style={{ background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.2)" }}>
          <span className="text-white/40 text-sm">⌨️</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={handleInput}
            placeholder="ここに にほんごを かいてください…"
            className="flex-1 bg-transparent text-white text-lg font-bold outline-none placeholder:text-white/25"
            style={{ caretColor: "#fbbf24" }}
            lang="ja"
            inputMode="text"
          />
          {inputVal && (
            <button onClick={clear}
              className="text-white/40 hover:text-white text-lg active:scale-90">✕</button>
          )}
        </div>

        {/* ── Word display (big chars) ── */}
        <div className="mx-4 mb-2 rounded-2xl px-4 py-3 flex items-center gap-3 min-h-[64px]"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="flex-1 flex flex-wrap gap-1 min-h-[40px] items-center">
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

        {/* ── Exact match ── */}
        {exactMatch && (
          <div className="mx-4 mb-2 rounded-2xl px-4 py-2.5 flex items-center gap-3"
            style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)" }}>
            <span className="text-xl">✅</span>
            <div className="flex-1 min-w-0">
              <span className="text-green-300 font-black text-base">{exactMatch.word}</span>
              <span className="text-green-300/60 text-sm ml-2">{exactMatch.meaning}</span>
            </div>
            <button onClick={() => speak(exactMatch.word)} className="text-lg active:scale-90">🔊</button>
          </div>
        )}

        {/* ── Suggestions ── */}
        {suggestions.length > 0 && !exactMatch && (
          <div className="mx-4 mb-2">
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button key={s.word}
                  onClick={() => {
                    const chars = Array.from(s.word);
                    setWord(chars);
                    setInputVal(s.word);
                    setLastChar(null);
                    speak(s.word);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl active:scale-95 transition-all"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <span className="text-white font-black text-sm">{s.word}</span>
                  <span className="text-white/40 text-xs">{s.meaning}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Similar characters ── */}
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

        {/* ── Tab selector ── */}
        <div className="flex gap-2 mx-4 mb-3 mt-1">
          {(["hiragana","katakana"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-2xl font-black text-sm transition-all active:scale-95 ${
                tab === t ? "text-white" : "text-white/40"
              }`}
              style={tab === t
                ? { background: t === "hiragana" ? "linear-gradient(135deg,#f97316,#ec4899)" : "linear-gradient(135deg,#3b82f6,#8b5cf6)" }
                : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }
              }>
              {t === "hiragana" ? "ひらがな" : "カタカナ"}
            </button>
          ))}
        </div>
      </div>

      {/* ══ SCROLLABLE CHARACTER GRID ══════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto pb-28 px-4 pt-2">
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-1 mb-1 justify-center">
            {row.map((c, ci) => (
              <button key={ci} onClick={() => addChar(c)}
                disabled={c === "　"}
                className={`w-[18%] aspect-square rounded-xl flex items-center justify-center text-xl font-black transition-all active:scale-90 ${
                  c === "　"
                    ? "opacity-0 pointer-events-none"
                    : c === lastChar
                      ? "text-yellow-300 scale-110"
                      : "text-white"
                }`}
                style={c !== "　" ? {
                  background: c === lastChar ? "rgba(251,191,36,0.25)" : "rgba(255,255,255,0.07)",
                  border: c === lastChar ? "2px solid rgba(251,191,36,0.6)" : "1px solid rgba(255,255,255,0.1)",
                } : {}}
              >
                {c === "　" ? "" : c}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
