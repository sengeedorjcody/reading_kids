"use client";

import { IWordToken, IDictionaryWord } from "@/types";
import { useReadingStore } from "@/store/readingStore";
import { useSpeech } from "@/hooks/useSpeech";
import { cn } from "@/lib/utils";

interface WordTokenProps {
  word: IWordToken;
}

export default function WordToken({ word }: WordTokenProps) {
  const { selectedSurface, setSelectedWord } = useReadingStore();
  const { speak } = useSpeech();
  const isSelected = selectedSurface === word.surface;

  const handleClick = () => {
    const dictEntry = word.dictionaryRef as unknown as IDictionaryWord | undefined;
    setSelectedWord(dictEntry ?? null, word.surface);
    if (dictEntry?.pronunciation_audio_url) {
      speak(word.surface, dictEntry.pronunciation_audio_url);
    } else {
      speak(word.surface);
    }
  };

  const hasFurigana = word.reading && word.reading !== word.surface;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "word-token inline-flex flex-col items-center justify-end",
        "mx-1 my-2 px-2 pt-5 pb-2 rounded-xl",
        "transition-all duration-200 book-font",
        "hover:bg-[#f5ecd4]/80 hover:scale-110 active:scale-95",
        isSelected
          ? "bg-[#fde68a] text-[#92400e] scale-110 shadow-lg shadow-[#c8783c]/30 ring-2 ring-[#c8783c]/50"
          : "text-[#2d1f0e]"
      )}
    >
      {hasFurigana ? (
        <ruby className="text-3xl font-bold leading-none">
          {word.surface}
          <rt className="text-xs font-bold" style={{ color: isSelected ? "#c05621" : "#e879a0" }}>
            {word.reading}
          </rt>
        </ruby>
      ) : (
        <span className="text-3xl font-bold leading-none">{word.surface}</span>
      )}
    </button>
  );
}
