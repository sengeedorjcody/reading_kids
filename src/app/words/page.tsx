"use client";

import { useState } from "react";
import { useSpeech } from "@/hooks/useSpeech";

// ── Hiragana grid ─────────────────────────────────────────────────────────────
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
  // Small/dakuten
  ["が","ぎ","ぐ","げ","ご"],
  ["ざ","じ","ず","ぜ","ぞ"],
  ["だ","ぢ","づ","で","ど"],
  ["ば","び","ぶ","べ","ぼ"],
  ["ぱ","ぴ","ぷ","ぺ","ぽ"],
  // Small
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

// ── Similar-looking character map ─────────────────────────────────────────────
const SIMILAR: Record<string, string[]> = {
  "あ": ["お","め"],      "お": ["あ","す"],
  "い": ["り","こ"],      "り": ["い","け"],
  "う": ["っ","ゆ"],      "っ": ["う","つ"],
  "え": ["れ","ね"],      "ね": ["れ","え","ぬ"],
  "き": ["さ"],           "さ": ["き","ち"],
  "し": ["つ","ン"],      "つ": ["し","っ"],
  "ぬ": ["め","ね","の"],  "め": ["ぬ","ね"],
  "の": ["の"],           "は": ["ほ"],
  "ほ": ["は"],           "ふ": ["ぬ"],
  "る": ["ろ"],           "ろ": ["る"],
  "ん": ["そ","こ"],      "そ": ["こ","ん"],
  "ア": ["マ"],           "マ": ["ア"],
  "シ": ["ツ","ン"],      "ツ": ["シ","ン"],
  "ン": ["ソ","シ"],      "ソ": ["ン"],
  "ウ": ["ワ"],           "ワ": ["ウ"],
};

// ── Common word dictionary for suggestions ────────────────────────────────────
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
  {word:"りんご",meaning:"apple"}, {word:"るす",meaning:"absence"}, {word:"わに",meaning:"crocodile"},
  {word:"わたし",meaning:"I/me"}, {word:"ごはん",meaning:"rice/meal"}, {word:"おはよう",meaning:"good morning"},
  {word:"ありがとう",meaning:"thank you"}, {word:"がっこう",meaning:"school"}, {word:"せんせい",meaning:"teacher"},
  {word:"ともだち",meaning:"friend"}, {word:"かぞく",meaning:"family"}, {word:"おかあさん",meaning:"mother"},
  {word:"おとうさん",meaning:"father"}, {word:"おねえさん",meaning:"older sister"}, {word:"おにいさん",meaning:"older brother"},
  // katakana words
  {word:"アイス",meaning:"ice cream"}, {word:"ケーキ",meaning:"cake"}, {word:"パン",meaning:"bread"},
  {word:"ラーメン",meaning:"ramen"}, {word:"テレビ",meaning:"TV"}, {word:"スマホ",meaning:"smartphone"},
  {word:"カメラ",meaning:"camera"}, {word:"バス",meaning:"bus"}, {word:"タクシー",meaning:"taxi"},
  {word:"ホテル",meaning:"hotel"}, {word:"ロボット",meaning:"robot"}, {word:"コーヒー",meaning:"coffee"},
  {word:"ミルク",meaning:"milk"}, {word:"ジュース",meaning:"juice"}, {word:"チョコ",meaning:"chocolate"},
];

type Tab = "hiragana" | "katakana";

export default function WordsPage() {
  const [tab, setTab]     = useState<Tab>("hiragana");
  const [word, setWord]   = useState<string[]>([]);
  const [lastChar, setLastChar] = useState<string | null>(null);
  const { speak }         = useSpeech();

  const rows = tab === "hiragana" ? HIRAGANA_ROWS : KATAKANA_ROWS;
  const current = word.join("");

  // Suggestions: words that START with the current typed chars
  const suggestions = current.length > 0
    ? WORD_DICT.filter((w) => w.word.startsWith(current)).slice(0, 6)
    : [];

  // Exact match
  const exactMatch = WORD_DICT.find((w) => w.word === current);

  // Similar characters for last tapped char
  const similar = lastChar ? (SIMILAR[lastChar] ?? []) : [];

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

  const clear = () => { setWord([]); setLastChar(null); };

  const speakWord = () => { if (current) speak(current); };

  return (
    <div className="flex flex-col pb-28" style={{ minHeight: "100dvh" }}>

      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-2xl font-black text-white mb-1">🔤 ことばつくり</h1>
        <p className="text-white/50 text-xs">Tap characters to build a word</p>
      </div>

      {/* ── Word display ── */}
      <div className="mx-4 mb-3 rounded-3xl px-5 py-4 flex items-center gap-3 min-h-[80px]"
        style={{ background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.15)" }}>
        <div className="flex-1 flex flex-wrap gap-1">
          {word.length === 0
            ? <span className="text-white/25 text-2xl font-black">たたいてみよう…</span>
            : word.map((c, i) => (
                <span key={i}
                  className={`text-4xl font-black leading-none transition-all ${
                    i === word.length - 1 ? "text-yellow-300" : "text-white"
                  }`}>{c}</span>
              ))
          }
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={speakWord} disabled={!current}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl active:scale-90 disabled:opacity-30"
            style={{ background: "rgba(59,130,246,0.3)", border: "1px solid rgba(59,130,246,0.5)" }}>
            🔊
          </button>
          <button onClick={backspace} disabled={word.length === 0}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl active:scale-90 disabled:opacity-30"
            style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}>
            ⌫
          </button>
          <button onClick={clear} disabled={word.length === 0}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl active:scale-90 disabled:opacity-30"
            style={{ background: "rgba(100,116,139,0.2)", border: "1px solid rgba(100,116,139,0.4)" }}>
            ✕
          </button>
        </div>
      </div>

      {/* ── Exact match ── */}
      {exactMatch && (
        <div className="mx-4 mb-3 rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)" }}>
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-green-300 font-black text-lg">{exactMatch.word}</p>
            <p className="text-green-300/70 text-sm">{exactMatch.meaning}</p>
          </div>
          <button onClick={() => speak(exactMatch.word)}
            className="ml-auto text-xl active:scale-90">🔊</button>
        </div>
      )}

      {/* ── Suggestions ── */}
      {suggestions.length > 0 && !exactMatch && (
        <div className="mx-4 mb-3">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">
            💡 ことばのヒント
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s.word}
                onClick={() => { setWord(Array.from(s.word)); setLastChar(null); speak(s.word); }}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl active:scale-95 transition-all"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <span className="text-white font-black">{s.word}</span>
                <span className="text-white/40 text-xs">{s.meaning}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Similar characters ── */}
      {similar.length > 0 && (
        <div className="mx-4 mb-3">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">
            🔍 にているもじ ({lastChar})
          </p>
          <div className="flex gap-2 flex-wrap">
            {similar.map((c) => (
              <button key={c} onClick={() => addChar(c)}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black text-white active:scale-90 transition-all"
                style={{ background: "rgba(251,191,36,0.15)", border: "2px solid rgba(251,191,36,0.4)" }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab selector ── */}
      <div className="flex gap-2 mx-4 mb-3">
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

      {/* ── Character grid ── */}
      <div className="mx-4">
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
                      : "text-white hover:text-yellow-200"
                }`}
                style={c !== "　" ? {
                  background: c === lastChar
                    ? "rgba(251,191,36,0.25)"
                    : "rgba(255,255,255,0.07)",
                  border: c === lastChar
                    ? "2px solid rgba(251,191,36,0.6)"
                    : "1px solid rgba(255,255,255,0.1)",
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
