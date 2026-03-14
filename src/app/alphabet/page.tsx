"use client";

import { useState } from "react";
import { HIRAGANA } from "@/constants/hiragana";
import { KATAKANA } from "@/constants/katakana";
import AlphabetGrid from "@/components/alphabet/AlphabetGrid";

export default function AlphabetPage() {
  const [tab, setTab] = useState<"hiragana" | "katakana">("hiragana");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-800 mb-2">
          もじ を まなぼう！
        </h1>
        <p className="text-xl text-gray-500">Click a character to hear how it sounds 🔊</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-3 justify-center mb-10">
        <button
          onClick={() => setTab("hiragana")}
          className={`px-8 py-4 rounded-3xl text-xl font-black transition-all duration-200 ${
            tab === "hiragana"
              ? "bg-pink-500 text-white shadow-lg shadow-pink-200 scale-105"
              : "bg-white text-gray-500 border-2 border-gray-200 hover:border-pink-300"
          }`}
        >
          あ Hiragana
        </button>
        <button
          onClick={() => setTab("katakana")}
          className={`px-8 py-4 rounded-3xl text-xl font-black transition-all duration-200 ${
            tab === "katakana"
              ? "bg-blue-500 text-white shadow-lg shadow-blue-200 scale-105"
              : "bg-white text-gray-500 border-2 border-gray-200 hover:border-blue-300"
          }`}
        >
          ア Katakana
        </button>
      </div>

      {/* Tip */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-6 py-3 text-center mb-8">
        <p className="text-yellow-700 font-medium">
          💡 Hover over a character to see an example word!
        </p>
      </div>

      {/* Grid */}
      {tab === "hiragana" ? (
        <AlphabetGrid kana={HIRAGANA} title="ひらがな (Hiragana)" />
      ) : (
        <AlphabetGrid kana={KATAKANA} title="カタカナ (Katakana)" />
      )}
    </div>
  );
}
