"use client";

import { ISentence } from "@/types";
import SentenceDisplay from "./SentenceDisplay";

interface SentenceReaderProps {
  sentences: ISentence[];
  rawText: string;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
}

// Shows every sentence of the page at once, one per line, top to bottom.
export default function SentenceReader({ sentences, rawText, onPrev, onNext, hasPrev }: SentenceReaderProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {sentences.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-2xl text-[#a07840]/50 italic book-font">{rawText || "このページはからです。"}</p>
          </div>
        ) : (
          <div className="sentence-in flex flex-col gap-1 py-2">
            {sentences.map((sentence, i) => (
              <SentenceDisplay key={i} sentence={sentence} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Page navigation */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#d4b87a]/30">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex items-center gap-1.5 bg-[#f5ecd4] hover:bg-[#ead5a8] disabled:opacity-20 disabled:cursor-not-allowed text-[#6b4423] font-bold py-2 px-4 rounded-xl text-sm transition-colors border border-[#d4b87a]/50 active:scale-95"
        >
          ◀ まえ
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 bg-[#c8783c] hover:bg-[#b5652b] text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors active:scale-95 shadow shadow-[#c8783c]/30"
        >
          つぎ ▶
        </button>
      </div>
    </div>
  );
}
