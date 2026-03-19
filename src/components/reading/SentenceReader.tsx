"use client";

import { ISentence } from "@/types";
import SentenceDisplay from "./SentenceDisplay";

interface SentenceReaderProps {
  sentences: ISentence[];
  rawText: string;
  index: number;
  onIndexChange: (index: number) => void;
}

export default function SentenceReader({ sentences, rawText, index, onIndexChange }: SentenceReaderProps) {
  const setIndex = onIndexChange;

  if (sentences.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-2xl text-[#a07840]/50 italic book-font">{rawText || "このページはからです。"}</p>
      </div>
    );
  }

  const total = sentences.length;
  const sentence = sentences[index];
  const hasPrev = index > 0;
  const hasNext = index < total - 1;

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-bold text-[#a07840]/70 tabular-nums w-10">
          {index + 1}/{total}
        </span>
        <div className="flex-1 h-1.5 bg-[#d4b87a]/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#c8783c] rounded-full transition-all duration-500"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* THE SENTENCE — fills most of the page */}
      <div className="flex-1 flex items-center justify-center">
        <div
          key={index}
          className="sentence-in w-full text-center px-2"
        >
          <SentenceDisplay sentence={sentence} index={0} />
        </div>
      </div>

      {/* Sentence navigation */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#d4b87a]/30">
        <button
          onClick={() => setIndex(Math.max(0, index - 1))}
          disabled={!hasPrev}
          className="flex items-center gap-1.5 bg-[#f5ecd4] hover:bg-[#ead5a8] disabled:opacity-20 disabled:cursor-not-allowed text-[#6b4423] font-bold py-2 px-4 rounded-xl text-sm transition-colors border border-[#d4b87a]/50 active:scale-95"
        >
          ◀ まえ
        </button>

        {/* Dot indicators */}
        <div className="flex gap-2 items-center flex-wrap justify-center max-w-xs">
          {sentences.slice(0, 10).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`rounded-full transition-all duration-200 ${
                i === index
                  ? "w-3.5 h-3.5 bg-[#c8783c] shadow-sm shadow-[#c8783c]/50"
                  : "w-2.5 h-2.5 bg-[#d4b87a]/50 hover:bg-[#c8783c]/60"
              }`}
            />
          ))}
          {total > 10 && <span className="text-xs text-[#a07840]/50">…</span>}
        </div>

        <button
          onClick={() => setIndex(Math.min(total - 1, index + 1))}
          disabled={!hasNext}
          className="flex items-center gap-1.5 bg-[#c8783c] hover:bg-[#b5652b] disabled:opacity-20 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors active:scale-95 shadow shadow-[#c8783c]/30"
        >
          つぎ ▶
        </button>
      </div>
    </div>
  );
}
