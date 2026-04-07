"use client";

import { useState } from "react";
import { KanaChar } from "@/types";
import { useSpeech } from "@/hooks/useSpeech";
import { cn } from "@/lib/utils";
import AlphabetDictionaryModal from "./AlphabetDictionaryModal";
import StrokeOrderModal from "./StrokeOrderModal";

interface CharacterCardProps {
  kana: KanaChar;
  speakText?: string; // override what gets spoken (e.g. romaji for Mongolian)
}

export default function CharacterCard({ kana, speakText }: CharacterCardProps) {
  const [clicked, setClicked] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [showStrokeOrder, setShowStrokeOrder] = useState(false);
  const { speak } = useSpeech();

  const handleClick = () => {
    speak(speakText ?? kana.char);
    setClicked(true);
    setTimeout(() => setClicked(false), 500);
  };

  const handleDictionaryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDictionary(true);
  };

  const handleStrokeOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowStrokeOrder(true);
  };

  return (
    <>
      <div className="relative group">
        {/* Main character button */}
        <button
          onClick={handleClick}
          className={cn(
            "w-full flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all duration-200",
            "hover:border-pink-400 hover:bg-pink-50 hover:shadow-lg hover:-translate-y-1",
            "active:scale-95 cursor-pointer",
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

        {/* Dictionary lookup button — appears on hover */}
        <button
          onClick={handleDictionaryClick}
          title={`Words containing ${kana.char}`}
          className={cn(
            "absolute top-1.5 right-1.5",
            "w-7 h-7 rounded-xl flex items-center justify-center text-xs",
            "bg-purple-100 text-purple-500 border border-purple-200",
            "hover:bg-purple-500 hover:text-white hover:border-purple-500",
            "opacity-0 group-hover:opacity-100",
            "transition-all duration-150 shadow-sm"
          )}
        >
          📖
        </button>

        {/* Stroke order button — appears on hover */}
        <button
          onClick={handleStrokeOrderClick}
          title={`How to write ${kana.char}`}
          className={cn(
            "absolute top-1.5 left-1.5",
            "w-7 h-7 rounded-xl flex items-center justify-center text-xs",
            "bg-orange-100 text-orange-500 border border-orange-200",
            "hover:bg-orange-500 hover:text-white hover:border-orange-500",
            "opacity-0 group-hover:opacity-100",
            "transition-all duration-150 shadow-sm"
          )}
        >
          ✏️
        </button>
      </div>

      {/* Dictionary modal */}
      {showDictionary && (
        <AlphabetDictionaryModal
          char={kana.char}
          romaji={kana.romaji}
          onClose={() => setShowDictionary(false)}
        />
      )}

      {/* Stroke order modal */}
      {showStrokeOrder && (
        <StrokeOrderModal
          char={kana.char}
          romaji={kana.romaji}
          onClose={() => setShowStrokeOrder(false)}
        />
      )}
    </>
  );
}
