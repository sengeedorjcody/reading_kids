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

type Section = "kihon" | "ugoki" | "style" | "sensei" | "phrase";

const TERMS: Record<Section, Term[]> = {
  kihon: [
    { emoji: "🏊", japanese: "水泳",           hiragana: "すいえい",               romaji: "suiei",              mongolian: "Усанд сэлэлт" },
    { emoji: "🏊", japanese: "泳ぐ",           hiragana: "およぐ",                 romaji: "oyogu",              mongolian: "Сэлэх" },
    { emoji: "🏊‍♂️", japanese: "プール",         hiragana: "ぷーる",                 romaji: "puuru",              mongolian: "Усан сан" },
    { emoji: "🧑‍🏫", japanese: "コーチ",         hiragana: "こーち",                 romaji: "koochi",             mongolian: "Дасгалжуулагч" },
    { emoji: "👩‍🏫", japanese: "先生",           hiragana: "せんせい",               romaji: "sensei",             mongolian: "Багш" },
    { emoji: "📋", japanese: "練習",            hiragana: "れんしゅう",             romaji: "renshuu",            mongolian: "Дасгал" },
    { emoji: "🤸", japanese: "準備運動",        hiragana: "じゅんびうんどう",       romaji: "junbi undou",        mongolian: "Бие халаалт" },
    { emoji: "🥽", japanese: "ゴーグル",        hiragana: "ごーぐる",               romaji: "googuru",            mongolian: "Нүдний шил" },
    { emoji: "🩱", japanese: "水着",            hiragana: "みずぎ",                 romaji: "mizugi",             mongolian: "Усны хувцас" },
    { emoji: "🧢", japanese: "水泳帽",          hiragana: "すいえいぼう",           romaji: "suiei bou",          mongolian: "Усны малгай" },
  ],
  ugoki: [
    { emoji: "🦵", japanese: "キック",         hiragana: "きっく",                 romaji: "kikku",              mongolian: "Хөл өшиглөх" },
    { emoji: "🦵", japanese: "バタ足",         hiragana: "ばたあし",               romaji: "bataashi",           mongolian: "Хөл савчих" },
    { emoji: "😮‍💨", japanese: "息を吸う",       hiragana: "いきをすう",             romaji: "iki o suu",          mongolian: "Амьсгаа авах" },
    { emoji: "💨", japanese: "息を吐く",        hiragana: "いきをはく",             romaji: "iki o haku",         mongolian: "Амьсгаа гаргах" },
    { emoji: "😶‍🌫️", japanese: "顔を水につける",  hiragana: "かおをみずにつける",     romaji: "kao o mizu ni tsukeru", mongolian: "Нүүрээ усанд хийх" },
    { emoji: "🪁", japanese: "浮く",           hiragana: "うく",                   romaji: "uku",                mongolian: "Усанд хөвөх" },
    { emoji: "🤿", japanese: "潜る",           hiragana: "もぐる",                 romaji: "moguru",             mongolian: "Усанд шумбах" },
    { emoji: "🧘", japanese: "いきつぎ",        hiragana: "いきつぎ",               romaji: "ikitsugi",           mongolian: "Амьсгаа авах техник" },
    { emoji: "🚶", japanese: "立つ",           hiragana: "たつ",                   romaji: "tatsu",              mongolian: "Босох" },
    { emoji: "✋", japanese: "止まる",          hiragana: "とまる",                 romaji: "tomaru",             mongolian: "Зогсох" },
  ],
  style: [
    { emoji: "🏊", japanese: "クロール",        hiragana: "くろーる",               romaji: "kurooru",            mongolian: "Чөлөөт сэлэлт (freestyle)" },
    { emoji: "🐸", japanese: "平泳ぎ",         hiragana: "ひらおよぎ",             romaji: "hiraoyogi",          mongolian: "Мэлхий сэлэлт (breaststroke)" },
    { emoji: "🔄", japanese: "背泳ぎ",         hiragana: "せおよぎ",               romaji: "seoyogi",            mongolian: "Араараа сэлэлт (backstroke)" },
    { emoji: "🦋", japanese: "バタフライ",      hiragana: "ばたふらい",             romaji: "batafurai",          mongolian: "Эрвээхэй сэлэлт (butterfly)" },
  ],
  sensei: [
    { emoji: "▶️",  japanese: "はじめます",      hiragana: "はじめます",             romaji: "hajimemasu",         mongolian: "Эхэлье" },
    { emoji: "⏹️",  japanese: "やめます",        hiragana: "やめます",               romaji: "yamemasu",           mongolian: "Зогсооё" },
    { emoji: "✋",  japanese: "まってください",   hiragana: "まってください",         romaji: "matte kudasai",      mongolian: "Түр хүлээнэ үү" },
    { emoji: "🐢",  japanese: "ゆっくり",        hiragana: "ゆっくり",               romaji: "yukkuri",            mongolian: "Аажуухан" },
    { emoji: "⚡",  japanese: "もっとはやく",    hiragana: "もっとはやく",           romaji: "motto hayaku",       mongolian: "Илүү хурдан" },
    { emoji: "💪",  japanese: "がんばって！",    hiragana: "がんばって",             romaji: "ganbatte!",          mongolian: "Хичээгээрэй!" },
    { emoji: "💧",  japanese: "みずになれてください", hiragana: "みずになれてください", romaji: "mizu ni narete kudasai", mongolian: "Усанд дасарай" },
    { emoji: "🔁",  japanese: "もう一回",        hiragana: "もういっかい",           romaji: "mou ikkai",          mongolian: "Дахиад нэг удаа" },
  ],
  phrase: [
    { emoji: "👌",  japanese: "大丈夫です",      hiragana: "だいじょうぶです",       romaji: "daijoubu desu",      mongolian: "Зүгээр ээ" },
    { emoji: "😓",  japanese: "難しいです",      hiragana: "むずかしいです",         romaji: "muzukashii desu",    mongolian: "Хэцүү байна" },
    { emoji: "💡",  japanese: "わかりました",    hiragana: "わかりました",           romaji: "wakarimashita",      mongolian: "Ойлголоо" },
    { emoji: "🙋",  japanese: "もう一度お願いします", hiragana: "もういちどおねがいします", romaji: "mou ichido onegaishimasu", mongolian: "Дахиад нэг удаа тайлбарлана уу" },
    { emoji: "🏊",  japanese: "まだ上手に泳げません", hiragana: "まだじょうずにおよげません", romaji: "mada jouzu ni oyogemasen", mongolian: "Би одоохондоо сайн сэлж чаддаггүй" },
    { emoji: "🌱",  japanese: "水泳は初めてです", hiragana: "すいえいははじめてです", romaji: "suiei wa hajimete desu", mongolian: "Усанд сэлэлтийн хичээлд анх удаа орж байна" },
    { emoji: "😰",  japanese: "怖いです",        hiragana: "こわいです",             romaji: "kowai desu",         mongolian: "Айж байна" },
    { emoji: "😊",  japanese: "たのしいです！",  hiragana: "たのしいです",           romaji: "tanoshii desu!",     mongolian: "Хөгжилтэй байна!" },
    { emoji: "🤝",  japanese: "よろしくおねがいします", hiragana: "よろしくおねがいします", romaji: "yoroshiku onegaishimasu", mongolian: "Сайн дурьдаарай" },
    { emoji: "🙏",  japanese: "ありがとうございました", hiragana: "ありがとうございました", romaji: "arigatou gozaimashita", mongolian: "Баярлалаа" },
  ],
};

const SECTIONS: { id: Section; label: string; jp: string; icon: string; activeColor: string }[] = [
  { id: "kihon",   label: "Basics",       jp: "きほん",   icon: "🏊",  activeColor: "bg-blue-500" },
  { id: "ugoki",   label: "Movements",    jp: "うごき",   icon: "🦵",  activeColor: "bg-cyan-500" },
  { id: "style",   label: "Styles",       jp: "スタイル", icon: "🦋",  activeColor: "bg-purple-500" },
  { id: "sensei",  label: "Coach says",   jp: "コーチ",   icon: "📣",  activeColor: "bg-green-500" },
  { id: "phrase",  label: "Phrases",      jp: "フレーズ", icon: "💬",  activeColor: "bg-orange-500" },
];

const BG: Record<Section, string> = {
  kihon:  "from-blue-50 via-sky-50 to-indigo-50",
  ugoki:  "from-cyan-50 via-teal-50 to-sky-50",
  style:  "from-purple-50 via-violet-50 to-fuchsia-50",
  sensei: "from-green-50 via-emerald-50 to-teal-50",
  phrase: "from-orange-50 via-amber-50 to-yellow-50",
};

const CARD_BG: Record<Section, string> = {
  kihon:  "#eff6ff",
  ugoki:  "#ecfeff",
  style:  "#faf5ff",
  sensei: "#f0fdf4",
  phrase: "#fff7ed",
};

const BADGE: Record<Section, string> = {
  kihon:  "bg-blue-100 text-blue-700",
  ugoki:  "bg-cyan-100 text-cyan-700",
  style:  "bg-purple-100 text-purple-700",
  sensei: "bg-green-100 text-green-700",
  phrase: "bg-orange-100 text-orange-700",
};

export default function SwimmingPage() {
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
    <div className={`min-h-screen bg-gradient-to-br ${BG[section]} transition-all duration-500`}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-2xl font-black text-gray-800">🏊 Swimming · すいえい</h1>
          <p className="text-xs text-gray-400 mt-0.5">タップして ことばを きこう！ · Усанд сэлэлтийн нэр томьёо</p>
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

      {/* Section heading */}
      <div className="px-4 py-3 flex items-center gap-2">
        <span className="text-3xl">{sec.icon}</span>
        <div>
          <h2 className="text-lg font-black text-gray-800">{sec.jp}</h2>
          <p className="text-xs text-gray-400">{sec.label} · {items.length} ことば</p>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4 pb-28">
        {items.map((term, i) => (
          <button
            key={i}
            onClick={() => handleTap(term)}
            className="flex flex-col items-center gap-2 p-4 rounded-3xl shadow-sm border border-white transition-all active:scale-95 hover:shadow-md text-center"
            style={{ backgroundColor: CARD_BG[section] }}
          >
            <span className="text-5xl leading-none">{term.emoji}</span>
            <div className="w-full">
              {/* Hiragana (small, above) */}
              <p className="text-[11px] text-gray-400 font-bold leading-tight">{term.hiragana}</p>
              {/* Kanji / main word */}
              <p className="text-base font-black text-gray-800 leading-tight mt-0.5">{term.japanese}</p>
              {/* Romaji */}
              <p className="text-[10px] text-gray-400 font-bold mt-0.5">{term.romaji}</p>
              {/* Mongolian badge */}
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
          <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 px-5 py-4 flex items-center gap-4 max-w-[90vw]">
            <span className="text-6xl flex-shrink-0">{active.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-bold">{active.hiragana}</p>
              <p className="text-2xl font-black text-gray-800 leading-tight">{active.japanese}</p>
              <p className="text-sm font-bold text-blue-500">{active.romaji}</p>
              <p className="text-sm text-blue-400 font-bold mt-0.5">{active.mongolian}</p>
            </div>
            <span className="text-2xl animate-bounce self-start mt-1">🔊</span>
          </div>
        </div>
      )}
    </div>
  );
}
