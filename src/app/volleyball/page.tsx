"use client";

import { useState } from "react";
import { useSpeech } from "@/hooks/useSpeech";

interface Term {
  emoji: string;
  japanese: string;
  hiragana: string;
  romaji: string;
  mongolian: string;
}

type Section = "kihon" | "ugoki" | "position" | "sensei" | "phrase";

const TERMS: Record<Section, Term[]> = {
  kihon: [
    { emoji: "🏐", japanese: "バレーボール",  hiragana: "ばれーぼーる",     romaji: "bareebooru",   mongolian: "Волейбол" },
    { emoji: "🏐", japanese: "ボール",        hiragana: "ぼーる",           romaji: "booru",        mongolian: "Бөмбөг" },
    { emoji: "👥", japanese: "チーム",        hiragana: "ちーむ",           romaji: "chiimu",       mongolian: "Баг" },
    { emoji: "🏅", japanese: "選手",          hiragana: "せんしゅ",         romaji: "senshu",       mongolian: "Тамирчин" },
    { emoji: "🧑‍🏫", japanese: "コーチ",       hiragana: "こーち",           romaji: "koochi",       mongolian: "Дасгалжуулагч" },
    { emoji: "👨‍💼", japanese: "監督",          hiragana: "かんとく",         romaji: "kantoku",      mongolian: "Ахлах дасгалжуулагч" },
    { emoji: "📋", japanese: "練習",          hiragana: "れんしゅう",       romaji: "renshuu",      mongolian: "Бэлтгэл" },
    { emoji: "🏆", japanese: "試合",          hiragana: "しあい",           romaji: "shiai",        mongolian: "Тэмцээн" },
    { emoji: "🥇", japanese: "勝つ",          hiragana: "かつ",             romaji: "katsu",        mongolian: "Хожих" },
    { emoji: "😔", japanese: "負ける",        hiragana: "まける",           romaji: "makeru",       mongolian: "Хожигдох" },
    { emoji: "🔢", japanese: "得点",          hiragana: "とくてん",         romaji: "tokuten",      mongolian: "Оноо" },
    { emoji: "🕸️", japanese: "ネット",        hiragana: "ねっと",           romaji: "netto",        mongolian: "Тор" },
  ],
  ugoki: [
    { emoji: "🎯", japanese: "サーブ",        hiragana: "さーぶ",           romaji: "saabu",        mongolian: "Сервис" },
    { emoji: "🤲", japanese: "レシーブ",      hiragana: "れしーぶ",         romaji: "reshiibu",     mongolian: "Хүлээн авах" },
    { emoji: "🤝", japanese: "パス",          hiragana: "ぱす",             romaji: "pasu",         mongolian: "Дамжуулалт" },
    { emoji: "⬆️", japanese: "トス",          hiragana: "とす",             romaji: "tosu",         mongolian: "Өргөлт" },
    { emoji: "💥", japanese: "スパイク",      hiragana: "すぱいく",         romaji: "supaiku",      mongolian: "Цохилт (smash)" },
    { emoji: "🛡️", japanese: "ブロック",      hiragana: "ぶろっく",         romaji: "burokku",      mongolian: "Хаалт" },
    { emoji: "🦘", japanese: "ジャンプ",      hiragana: "じゃんぷ",         romaji: "janpu",        mongolian: "Үсрэх" },
    { emoji: "👊", japanese: "打つ",          hiragana: "うつ",             romaji: "utsu",         mongolian: "Цохих" },
    { emoji: "🏃", japanese: "ローテーション",hiragana: "ろーてーしょん",   romaji: "rooteshon",    mongolian: "Байрлал солих" },
    { emoji: "📣", japanese: "コール",        hiragana: "こーる",           romaji: "kooru",        mongolian: "Дуудлага/Дохио" },
  ],
  position: [
    { emoji: "🎮", japanese: "セッター",       hiragana: "せったー",         romaji: "settaa",       mongolian: "Холбогч" },
    { emoji: "🛡️", japanese: "リベロ",        hiragana: "りべろ",           romaji: "ribero",       mongolian: "Либеро" },
    { emoji: "⚡", japanese: "アタッカー",     hiragana: "あたっかー",       romaji: "atakkaa",      mongolian: "Довтлогч" },
    { emoji: "🧱", japanese: "ミドルブロッカー",hiragana: "みどるぶろっかー", romaji: "midoru burokkaa", mongolian: "Төвийн хаагч" },
    { emoji: "🔄", japanese: "オポジット",     hiragana: "おぽじっと",       romaji: "opojitto",     mongolian: "Эсрэг талын довтлогч" },
    { emoji: "📍", japanese: "ポジション",     hiragana: "ぽじしょん",       romaji: "pojishon",     mongolian: "Байрлал" },
  ],
  sensei: [
    { emoji: "▶️",  japanese: "はじめます",    hiragana: "はじめます",       romaji: "hajimemasu",        mongolian: "Эхэлье" },
    { emoji: "🙌",  japanese: "集まってください",hiragana: "あつまってください",romaji: "atsumatte kudasai", mongolian: "Наашаа цуглараарай" },
    { emoji: "🔁",  japanese: "もう一回！",    hiragana: "もういっかい",     romaji: "mou ikkai!",        mongolian: "Дахиад нэг удаа!" },
    { emoji: "👏",  japanese: "ナイス！",      hiragana: "ないす",           romaji: "naisu!",            mongolian: "Гоё байна!" },
    { emoji: "💪",  japanese: "がんばって！",  hiragana: "がんばって",       romaji: "ganbatte!",         mongolian: "Хичээгээрэй!" },
    { emoji: "🐢",  japanese: "ゆっくり",      hiragana: "ゆっくり",         romaji: "yukkuri",           mongolian: "Аажуухан" },
    { emoji: "❓",  japanese: "大丈夫ですか",  hiragana: "だいじょうぶですか",romaji: "daijoubu desu ka?", mongolian: "Зүгээр үү?" },
    { emoji: "⏹️",  japanese: "やめます",      hiragana: "やめます",         romaji: "yamemasu",          mongolian: "Зогсооё" },
    { emoji: "✋",  japanese: "まってください", hiragana: "まってください",   romaji: "matte kudasai",     mongolian: "Түр хүлээнэ үү" },
    { emoji: "⚡",  japanese: "もっとはやく",  hiragana: "もっとはやく",     romaji: "motto hayaku",      mongolian: "Илүү хурдан" },
  ],
  phrase: [
    { emoji: "🌱",  japanese: "バレーボールは初めてです", hiragana: "ばれーぼーるははじめてです", romaji: "bareebooru wa hajimete desu",    mongolian: "Би волейболоор анх удаа хичээллэж байна" },
    { emoji: "😅",  japanese: "まだ上手ではありません",  hiragana: "まだじょうずではありません", romaji: "mada jouzu de wa arimasen",      mongolian: "Би одоохондоо сайн биш" },
    { emoji: "🤝",  japanese: "よろしくお願いします",   hiragana: "よろしくおねがいします",     romaji: "yoroshiku onegaishimasu",        mongolian: "Сайн зааж өгөөрэй / Хамтран ажиллая" },
    { emoji: "💡",  japanese: "わかりました",           hiragana: "わかりました",               romaji: "wakarimashita",                  mongolian: "Ойлголоо" },
    { emoji: "😓",  japanese: "難しいです",             hiragana: "むずかしいです",             romaji: "muzukashii desu",                mongolian: "Хэцүү байна" },
    { emoji: "👌",  japanese: "大丈夫です",             hiragana: "だいじょうぶです",           romaji: "daijoubu desu",                  mongolian: "Зүгээр ээ" },
    { emoji: "🙋",  japanese: "もう一度お願いします",   hiragana: "もういちどおねがいします",   romaji: "mou ichido onegaishimasu",       mongolian: "Дахиад нэг удаа тайлбарлана уу" },
    { emoji: "🙏",  japanese: "ありがとうございました", hiragana: "ありがとうございました",     romaji: "arigatou gozaimashita",          mongolian: "Баярлалаа" },
    { emoji: "😊",  japanese: "たのしかった！",         hiragana: "たのしかった",               romaji: "tanoshikatta!",                  mongolian: "Хөгжилтэй байсан!" },
    { emoji: "💪",  japanese: "つよい！",               hiragana: "つよい",                     romaji: "tsuyoi!",                        mongolian: "Хүчтэй!" },
  ],
};

const SECTIONS: { id: Section; label: string; jp: string; icon: string; activeColor: string }[] = [
  { id: "kihon",    label: "Basics",       jp: "きほん",   icon: "🏐",  activeColor: "bg-yellow-500" },
  { id: "ugoki",    label: "Actions",      jp: "うごき",   icon: "💥",  activeColor: "bg-red-500" },
  { id: "position", label: "Positions",    jp: "ポジション",icon: "📍", activeColor: "bg-blue-500" },
  { id: "sensei",   label: "Coach says",   jp: "コーチ",   icon: "📣",  activeColor: "bg-green-500" },
  { id: "phrase",   label: "Phrases",      jp: "フレーズ", icon: "💬",  activeColor: "bg-purple-500" },
];

const CARD_BG: Record<Section, string> = {
  kihon:    "#fefce8",
  ugoki:    "#fff1f2",
  position: "#eff6ff",
  sensei:   "#f0fdf4",
  phrase:   "#fdf4ff",
};

const BADGE: Record<Section, string> = {
  kihon:    "bg-yellow-100 text-yellow-700",
  ugoki:    "bg-red-100 text-red-700",
  position: "bg-blue-100 text-blue-700",
  sensei:   "bg-green-100 text-green-700",
  phrase:   "bg-purple-100 text-purple-700",
};

export default function VolleyballPage() {
  const [section, setSection] = useState<Section>("kihon");
  const [active, setActive] = useState<Term | null>(null);
  const { speak } = useSpeech();

  const handleTap = (term: Term) => {
    speak(term.japanese);
    setActive(term);
    setTimeout(() => setActive(null), 2800);
  };

  const items = TERMS[section];
  const sec = SECTIONS.find((s) => s.id === section)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-lime-50 transition-all duration-500">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="px-4 pt-4 pb-2">
            <h1 className="text-2xl font-black text-gray-800">🏐 Volleyball · バレーボール</h1>
            <p className="text-xs text-gray-400 mt-0.5">タップして ことばを きこう！ · Волейболын нэр томьёо</p>
          </div>
          {/* Section tabs */}
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
                  section === s.id
                    ? `${s.activeColor} text-white shadow-md`
                    : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.jp}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section heading */}
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
        <span className="text-3xl">{sec.icon}</span>
        <div>
          <h2 className="text-lg font-black text-gray-800">{sec.jp}</h2>
          <p className="text-xs text-gray-400">{sec.label} · {items.length} ことば</p>
        </div>
      </div>

      {/* Cards grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3 px-4 pb-28">
        {items.map((term, i) => (
          <button
            key={i}
            onClick={() => handleTap(term)}
            className="flex flex-col items-center gap-2 p-4 rounded-3xl shadow-sm border border-white transition-all active:scale-95 hover:shadow-md text-center"
            style={{ backgroundColor: CARD_BG[section] }}
          >
            <span className="text-5xl leading-none">{term.emoji}</span>
            <div className="w-full">
              <p className="text-[11px] text-gray-400 font-bold leading-tight">{term.hiragana}</p>
              <p className="text-base font-black text-gray-800 leading-tight mt-0.5">{term.japanese}</p>
              <p className="text-[10px] text-gray-400 font-bold mt-0.5">{term.romaji}</p>
              <div className="mt-1.5 flex justify-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE[section]}`}>
                  {term.mongolian}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Floating detail card */}
      {active && (
        <div
          key={active.japanese + active.emoji}
          className="fixed bottom-28 left-1/2 z-50 animate-fade-in"
          style={{ transform: "translateX(-50%)" }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-yellow-100 px-5 py-4 flex items-center gap-4 max-w-[90vw]">
            <span className="text-6xl flex-shrink-0">{active.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-bold">{active.hiragana}</p>
              <p className="text-2xl font-black text-gray-800 leading-tight">{active.japanese}</p>
              <p className="text-sm font-bold text-yellow-500">{active.romaji}</p>
              <p className="text-sm text-blue-400 font-bold mt-0.5">{active.mongolian}</p>
            </div>
            <span className="text-2xl animate-bounce self-start mt-1">🔊</span>
          </div>
        </div>
      )}
    </div>
  );
}
