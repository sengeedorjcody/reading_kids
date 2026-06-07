"use client";

import { useSpeech } from "@/hooks/useSpeech";
import { useState } from "react";

interface Letter {
  upper: string;
  lower: string;
  sound: string;   // phonics sound description
  word: string;    // example word
  emoji: string;
  mongolian: string;
}

const LETTERS: Letter[] = [
  { upper: "A", lower: "a", sound: "/æ/", word: "Apple",     emoji: "🍎", mongolian: "Алим" },
  { upper: "B", lower: "b", sound: "/b/",  word: "Ball",      emoji: "⚽", mongolian: "Бөмбөг" },
  { upper: "C", lower: "c", sound: "/k/",  word: "Cat",       emoji: "🐱", mongolian: "Муур" },
  { upper: "D", lower: "d", sound: "/d/",  word: "Dog",       emoji: "🐶", mongolian: "Нохой" },
  { upper: "E", lower: "e", sound: "/ɛ/",  word: "Elephant",  emoji: "🐘", mongolian: "Заан" },
  { upper: "F", lower: "f", sound: "/f/",  word: "Fish",      emoji: "🐟", mongolian: "Загас" },
  { upper: "G", lower: "g", sound: "/ɡ/",  word: "Grape",     emoji: "🍇", mongolian: "Усан үзэм" },
  { upper: "H", lower: "h", sound: "/h/",  word: "House",     emoji: "🏠", mongolian: "Байшин" },
  { upper: "I", lower: "i", sound: "/ɪ/",  word: "Ice cream", emoji: "🍦", mongolian: "Зайрмаг" },
  { upper: "J", lower: "j", sound: "/dʒ/", word: "Juice",     emoji: "🧃", mongolian: "Шүүс" },
  { upper: "K", lower: "k", sound: "/k/",  word: "Kite",      emoji: "🪁", mongolian: "Хий тэрэг" },
  { upper: "L", lower: "l", sound: "/l/",  word: "Lion",      emoji: "🦁", mongolian: "Арслан" },
  { upper: "M", lower: "m", sound: "/m/",  word: "Moon",      emoji: "🌙", mongolian: "Сар" },
  { upper: "N", lower: "n", sound: "/n/",  word: "Nest",      emoji: "🪺", mongolian: "Үүр" },
  { upper: "O", lower: "o", sound: "/ɒ/",  word: "Orange",    emoji: "🍊", mongolian: "Жүрж" },
  { upper: "P", lower: "p", sound: "/p/",  word: "Penguin",   emoji: "🐧", mongolian: "Пингвин" },
  { upper: "Q", lower: "q", sound: "/kw/", word: "Queen",     emoji: "👑", mongolian: "Хатан хаан" },
  { upper: "R", lower: "r", sound: "/r/",  word: "Rainbow",   emoji: "🌈", mongolian: "Солонго" },
  { upper: "S", lower: "s", sound: "/s/",  word: "Sun",       emoji: "☀️",  mongolian: "Нар" },
  { upper: "T", lower: "t", sound: "/t/",  word: "Tiger",     emoji: "🐯", mongolian: "Бар" },
  { upper: "U", lower: "u", sound: "/ʌ/",  word: "Umbrella",  emoji: "☂️",  mongolian: "Нарны шүхэр" },
  { upper: "V", lower: "v", sound: "/v/",  word: "Violin",    emoji: "🎻", mongolian: "Хийл" },
  { upper: "W", lower: "w", sound: "/w/",  word: "Water",     emoji: "💧", mongolian: "Ус" },
  { upper: "X", lower: "x", sound: "/ks/", word: "X-ray",     emoji: "🩻", mongolian: "Рентген" },
  { upper: "Y", lower: "y", sound: "/j/",  word: "Yogurt",    emoji: "🍦", mongolian: "Тараг" },
  { upper: "Z", lower: "z", sound: "/z/",  word: "Zebra",     emoji: "🦓", mongolian: "Тахь" },
];

const VOWELS = new Set(["A","E","I","O","U"]);

export default function EnglishAlphabetGrid() {
  const [active, setActive] = useState<Letter | null>(null);
  const { speak } = useSpeech();

  const handleTap = (letter: Letter) => {
    speak(letter.lower, "en-US");
    setActive(letter);
    setTimeout(() => setActive(null), 2500);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-700 text-center">🔤 English Alphabet</h2>

      {/* Vowels row */}
      <div>
        <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider mb-3 pl-2">
          🔴 Vowels — A E I O U
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {LETTERS.filter((l) => VOWELS.has(l.upper)).map((letter) => (
            <LetterCard key={letter.upper} letter={letter} isActive={active?.upper === letter.upper} isVowel onTap={handleTap} />
          ))}
        </div>
      </div>

      {/* Consonants */}
      <div>
        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3 pl-2">
          🔵 Consonants
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {LETTERS.filter((l) => !VOWELS.has(l.upper)).map((letter) => (
            <LetterCard key={letter.upper} letter={letter} isActive={active?.upper === letter.upper} isVowel={false} onTap={handleTap} />
          ))}
        </div>
      </div>

      {/* Detail popup */}
      {active && (
        <div
          key={active.upper}
          className="fixed bottom-28 left-1/2 z-50 animate-fade-in"
          style={{ transform: "translateX(-50%)" }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 px-6 py-4 flex items-center gap-4 min-w-[260px]">
            <div className="flex flex-col items-center">
              <span className="text-5xl font-black text-blue-600">{active.upper}</span>
              <span className="text-3xl font-black text-blue-300">{active.lower}</span>
            </div>
            <div className="text-4xl">{active.emoji}</div>
            <div>
              <p className="text-xl font-black text-gray-800">{active.word}</p>
              <p className="text-sm font-bold text-pink-500">{active.sound}</p>
              <p className="text-xs text-gray-400 font-bold mt-0.5">{active.mongolian}</p>
            </div>
            <span className="text-2xl animate-bounce self-start mt-1">🔊</span>
          </div>
        </div>
      )}
    </div>
  );
}

function LetterCard({ letter, isActive, isVowel, onTap }: {
  letter: Letter;
  isActive: boolean;
  isVowel: boolean;
  onTap: (l: Letter) => void;
}) {
  return (
    <button
      onClick={() => onTap(letter)}
      className="flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all active:scale-95 hover:shadow-md"
      style={{
        background: isActive
          ? (isVowel ? "#fce7f3" : "#eff6ff")
          : "#fff",
        borderColor: isActive
          ? (isVowel ? "#ec4899" : "#3b82f6")
          : (isVowel ? "#fce7f3" : "#dbeafe"),
        boxShadow: isActive ? `0 0 0 3px ${isVowel ? "#fce7f388" : "#dbeafe88"}` : undefined,
      }}
    >
      <span className="text-2xl leading-none">{letter.emoji}</span>
      <span className={`text-2xl font-black leading-none ${isVowel ? "text-pink-500" : "text-blue-600"}`}>
        {letter.upper}
      </span>
      <span className={`text-lg font-black leading-none ${isVowel ? "text-pink-300" : "text-blue-300"}`}>
        {letter.lower}
      </span>
      <span className="text-[9px] font-bold text-gray-400 mt-0.5">{letter.sound}</span>
    </button>
  );
}
