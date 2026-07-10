"use client";

import { IWordToken, IDictionaryWord } from "@/types";
import { useReadingStore } from "@/store/readingStore";
import { useSpeech } from "@/hooks/useSpeech";
import { cn } from "@/lib/utils";

interface Props {
  word: IWordToken;
  fontPx: number;
}

// A compact, size-driven word for the picture-book caption overlay.
// (The shared reading/WordToken hardcodes text-5xl, far too big to sit inside
// an illustration's small blank caption strip.)
export default function PictureBookWord({ word, fontPx }: Props) {
  const { selectedSurface, setSelectedWord } = useReadingStore();
  const { speak } = useSpeech();
  const isSelected = selectedSurface === word.surface;

  const handleClick = () => {
    const dictEntry = word.dictionaryRef as unknown as IDictionaryWord | undefined;
    setSelectedWord(dictEntry ?? null, word.surface);
    if (dictEntry?.pronunciation_audio_url) speak(word.surface, dictEntry.pronunciation_audio_url);
    else speak(word.surface);
  };

  const hasFurigana = word.reading && word.reading !== word.surface;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex flex-col items-center justify-end rounded-lg book-font align-bottom",
        "transition-all duration-150 hover:bg-[#f5ecd4]/70 active:scale-95",
        isSelected ? "bg-[#fde68a] text-[#92400e] ring-2 ring-[#c8783c]/50" : "text-[#2d1f0e]"
      )}
      style={{ margin: `${fontPx * 0.06}px ${fontPx * 0.1}px`, padding: `${fontPx * 0.1}px ${fontPx * 0.14}px` }}
    >
      {hasFurigana ? (
        <ruby className="font-bold leading-none" style={{ fontSize: fontPx }}>
          {word.surface}
          <rt className="font-bold" style={{ fontSize: fontPx * 0.4, color: isSelected ? "#c05621" : "#e879a0" }}>
            {word.reading}
          </rt>
        </ruby>
      ) : (
        <span className="font-bold leading-none" style={{ fontSize: fontPx }}>{word.surface}</span>
      )}
    </button>
  );
}
