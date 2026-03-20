"use client";

import { useState } from "react";
import { KanaChar } from "@/types";
import { useSpeech } from "@/hooks/useSpeech";
import { cn } from "@/lib/utils";

interface CharacterCardProps {
  kana: KanaChar;
  speakText?: string; // override what gets spoken (e.g. romaji for Mongolian)
}

export default function CharacterCard({ kana, speakText }: CharacterCardProps) {
  const [clicked, setClicked] = useState(false);
  const { speak } = useSpeech();

  const handleClick = () => {
    speak(speakText ?? kana.char);
    setClicked(true);
    setTimeout(() => setClicked(false), 500);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all duration-200",
        "hover:border-pink-400 hover:bg-pink-50 hover:shadow-lg hover:-translate-y-1",
        "active:scale-95 group cursor-pointer",
        clicked
          ? "border-pink-500 bg-pink-100 scale-110 animate-wiggle"
          : "border-pink-100 bg-white"
      )}
    >
      {/* Character */}
      <span className="text-5xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors">
        {kana.char}
      </span>

      {/* Romaji */}
      <span className="text-base font-bold text-blue-400">{kana.romaji}</span>

      {/* Example word - shown on hover */}
      {kana.exampleWord && (
        <div className="hidden group-hover:flex flex-col items-center gap-0.5 animate-fade-in">
          <span className="text-sm text-gray-700 font-medium">{kana.exampleWord}</span>
          <span className="text-xs text-gray-400">{kana.exampleMeaning}</span>
        </div>
      )}

      {/* Sound icon */}
      <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity">🔊</span>
    </button>
  );
}
