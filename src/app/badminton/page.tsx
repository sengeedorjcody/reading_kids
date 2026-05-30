"use client";

import { useState } from "react";
import { useSpeech } from "@/hooks/useSpeech";

interface Term {
  emoji: string;
  japanese: string;
  romaji: string;
  english: string;
  mongolian: string;
}

type Section = "kigu" | "waza" | "rule" | "phrase";

const TERMS: Record<Section, Term[]> = {
  kigu: [
    { emoji: "🏸", japanese: "バドミントン",      romaji: "badominton",    english: "Badminton",        mongolian: "Бадминтон" },
    { emoji: "🏸", japanese: "ラケット",          romaji: "raketto",       english: "Racket",           mongolian: "Ракет" },
    { emoji: "🪶", japanese: "シャトル",          romaji: "shatoru",       english: "Shuttlecock",      mongolian: "Шаттл" },
    { emoji: "🕸️", japanese: "ネット",            romaji: "netto",         english: "Net",              mongolian: "Тор" },
    { emoji: "👟", japanese: "シューズ",          romaji: "shuuzu",        english: "Shoes",            mongolian: "Гутал" },
    { emoji: "👕", japanese: "ユニフォーム",      romaji: "yunifoomu",     english: "Uniform",          mongolian: "Дүрэмт хувцас" },
    { emoji: "🎒", japanese: "ラケットバッグ",    romaji: "raketto baggu", english: "Racket bag",       mongolian: "Ракетны цүнх" },
    { emoji: "📏", japanese: "コート",            romaji: "kooto",         english: "Court",            mongolian: "Талбай" },
  ],
  waza: [
    { emoji: "💥", japanese: "スマッシュ",        romaji: "sumasshu",      english: "Smash",            mongolian: "Смэш" },
    { emoji: "🌀", japanese: "ドロップ",          romaji: "doroppu",       english: "Drop shot",        mongolian: "Дроп шот" },
    { emoji: "🎯", japanese: "サーブ",            romaji: "saabu",         english: "Serve",            mongolian: "Сэрвис" },
    { emoji: "⬆️", japanese: "クリア",            romaji: "kuria",         english: "Clear",            mongolian: "Клир" },
    { emoji: "⬇️", japanese: "ヘアピン",          romaji: "heapin",        english: "Hairpin",          mongolian: "Хэрпин" },
    { emoji: "↗️", japanese: "ロブ",              romaji: "robu",          english: "Lob",              mongolian: "Лоб" },
    { emoji: "➡️", japanese: "ドライブ",          romaji: "doraibu",       english: "Drive",            mongolian: "Драйв" },
    { emoji: "🔄", japanese: "リターン",          romaji: "ritaan",        english: "Return",           mongolian: "Буцаалт" },
    { emoji: "🏃", japanese: "フットワーク",      romaji: "futtowaaku",    english: "Footwork",         mongolian: "Хөлийн ажиллагаа" },
    { emoji: "🤝", japanese: "ダブルス",          romaji: "daburusu",      english: "Doubles",          mongolian: "Хосын тоглолт" },
    { emoji: "🧍", japanese: "シングルス",        romaji: "shingurusu",    english: "Singles",          mongolian: "Ганцаарын тоглолт" },
    { emoji: "🖐️", japanese: "バックハンド",      romaji: "bakkuhando",    english: "Backhand",         mongolian: "Буцааж цохилт" },
  ],
  rule: [
    { emoji: "🔢", japanese: "てん",              romaji: "ten",           english: "Point / Score",    mongolian: "Оноо" },
    { emoji: "🏆", japanese: "かち",              romaji: "kachi",         english: "Win",              mongolian: "Ялах" },
    { emoji: "😔", japanese: "まけ",              romaji: "make",          english: "Lose",             mongolian: "Ялагдах" },
    { emoji: "🤝", japanese: "サービス",          romaji: "saabisusu",     english: "Service",          mongolian: "Сэрвис" },
    { emoji: "❌", japanese: "アウト",            romaji: "auto",          english: "Out",              mongolian: "Гарт" },
    { emoji: "✅", japanese: "イン",              romaji: "in",            english: "In",               mongolian: "Талбайд" },
    { emoji: "🔁", japanese: "ゲーム",            romaji: "geemu",         english: "Game (set)",       mongolian: "Гэйм" },
    { emoji: "⚖️", japanese: "デュース",          romaji: "dyuusu",        english: "Deuce",            mongolian: "Дюс" },
    { emoji: "🎽", japanese: "レシーブ",          romaji: "reshiibu",      english: "Receive",          mongolian: "Хүлээн авах" },
    { emoji: "🚫", japanese: "フォルト",          romaji: "foruto",        english: "Fault",            mongolian: "Алдаа" },
    { emoji: "🔔", japanese: "ラリー",            romaji: "rarii",         english: "Rally",            mongolian: "Рэлли" },
  ],
  phrase: [
    { emoji: "🌅", japanese: "おはようございます",romaji: "ohayou gozaimasu",english: "Good morning!",  mongolian: "Өглөөний мэнд!" },
    { emoji: "🏋️", japanese: "がんばれ！",        romaji: "ganbare!",      english: "Do your best!",    mongolian: "Чармай!" },
    { emoji: "👏", japanese: "ナイスショット！",   romaji: "naisu shotto!", english: "Nice shot!",        mongolian: "Гайхалтай цохилт!" },
    { emoji: "🙏", japanese: "よろしくおねがいします",romaji: "yoroshiku onegaishimasu",english: "Please treat me well",mongolian: "Сайн дурьдаарай" },
    { emoji: "🏁", japanese: "はじめましょう",    romaji: "hajimemashou",  english: "Let's begin!",     mongolian: "Эхэлцгээе!" },
    { emoji: "🎉", japanese: "おめでとう！",      romaji: "omedetou!",     english: "Congratulations!", mongolian: "Баяр хүргэе!" },
    { emoji: "😤", japanese: "もう一度！",         romaji: "mou ichido!",   english: "One more time!",   mongolian: "Дахиад нэг удаа!" },
    { emoji: "🛑", japanese: "ストップ！",        romaji: "sutoppu!",      english: "Stop!",            mongolian: "Зогсоо!" },
    { emoji: "🤸", japanese: "じゅんびうんどう",  romaji: "junbi undou",   english: "Warm-up exercise", mongolian: "Дулаацах дасгал" },
    { emoji: "🙌", japanese: "ありがとう！",      romaji: "arigatou!",     english: "Thank you!",       mongolian: "Баярлалаа!" },
    { emoji: "💪", japanese: "つよい！",          romaji: "tsuyoi!",       english: "Strong! / Great!", mongolian: "Хүчтэй!" },
    { emoji: "😊", japanese: "たのしかった！",    romaji: "tanoshikatta!", english: "That was fun!",    mongolian: "Хөгжилтэй байсан!" },
  ],
};

const SECTIONS: { id: Section; label: string; jp: string; icon: string; color: string }[] = [
  { id: "kigu",   label: "Equipment",  jp: "どうぐ",   icon: "🏸", color: "bg-blue-500" },
  { id: "waza",   label: "Techniques", jp: "わざ",     icon: "💥", color: "bg-purple-500" },
  { id: "rule",   label: "Rules",      jp: "ルール",   icon: "📋", color: "bg-green-500" },
  { id: "phrase", label: "Phrases",    jp: "フレーズ", icon: "💬", color: "bg-orange-500" },
];

const BG_COLORS: Record<Section, string> = {
  kigu:   "from-blue-50 via-sky-50 to-indigo-50",
  waza:   "from-purple-50 via-fuchsia-50 to-pink-50",
  rule:   "from-green-50 via-emerald-50 to-teal-50",
  phrase: "from-orange-50 via-amber-50 to-yellow-50",
};

const CARD_COLORS: Record<Section, string> = {
  kigu:   "#eff6ff",
  waza:   "#faf5ff",
  rule:   "#f0fdf4",
  phrase: "#fff7ed",
};

const BADGE_COLORS: Record<Section, string> = {
  kigu:   "bg-blue-100 text-blue-700",
  waza:   "bg-purple-100 text-purple-700",
  rule:   "bg-green-100 text-green-700",
  phrase: "bg-orange-100 text-orange-700",
};

export default function BadmintonPage() {
  const [section, setSection] = useState<Section>("kigu");
  const [active, setActive] = useState<Term | null>(null);
  const { speak } = useSpeech();

  const handleTap = (term: Term) => {
    speak(term.japanese);
    setActive(term);
    setTimeout(() => setActive(null), 2500);
  };

  const items = TERMS[section];
  const sec = SECTIONS.find((s) => s.id === section)!;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${BG_COLORS[section]} transition-all duration-500`}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-2xl font-black text-gray-800">🏸 バドミントン</h1>
          <p className="text-xs text-gray-400 mt-0.5">タップして ことばを きこう！ · Бадминтоны нэр томьёо</p>
        </div>

        {/* Section tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
                section === s.id
                  ? `${s.color} text-white shadow-md`
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
            style={{ backgroundColor: CARD_COLORS[section] }}
          >
            <span className="text-5xl leading-none">{term.emoji}</span>
            <div className="w-full">
              <p className="text-base font-black text-gray-800 leading-tight">{term.japanese}</p>
              <p className="text-[11px] text-gray-400 font-bold mt-0.5">{term.romaji}</p>
              <div className="mt-1.5 flex flex-wrap gap-1 justify-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_COLORS[section]}`}>
                  {term.english}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{term.mongolian}</p>
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
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 px-6 py-4 flex items-center gap-4 min-w-[280px] max-w-[90vw]">
            <span className="text-6xl">{active.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-black text-gray-800 leading-tight">{active.japanese}</p>
              <p className="text-sm font-bold text-purple-500">{active.romaji}</p>
              <p className="text-sm text-gray-500">{active.english}</p>
              <p className="text-xs text-blue-400 font-bold mt-0.5">{active.mongolian}</p>
            </div>
            <span className="text-2xl animate-bounce self-start mt-1">🔊</span>
          </div>
        </div>
      )}
    </div>
  );
}
