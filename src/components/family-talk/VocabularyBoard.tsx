"use client";

import { useMemo, useRef, useState, UIEvent } from "react";
import Link from "next/link";
import { useSpeech } from "@/hooks/useSpeech";
import { IFamilyTalkTopic, IFamilyTalkWord } from "@/types";
import { buildScatterLayout } from "@/lib/scatterLayout";

const PAGE_SIZE = 12;

export default function VocabularyBoard({ topic, words }: { topic: IFamilyTalkTopic; words: IFamilyTalkWord[] }) {
  const { speak } = useSpeech();
  
  const wordPages = useMemo(() => {
    const count = Math.max(1, Math.ceil(words.length / PAGE_SIZE));
    return Array.from({ length: count }, (_, i) =>
      words.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE)
    );
  }, [words]);

  const layouts = useMemo(() => {
    return wordPages.map(pageWords => buildScatterLayout(pageWords.length));
  }, [wordPages]);

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = (word: IFamilyTalkWord) => {
    speak(word.japanese, word.audioUrl);
    setPlayingId(word._id);
    if (playTimer.current) clearTimeout(playTimer.current);
    playTimer.current = setTimeout(() => setPlayingId(null), 2200);
  };

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const clientWidth = e.currentTarget.clientWidth;
    const page = Math.round(scrollLeft / clientWidth);
    setCurrentPage(page);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0f766e 0%, #0e7490 45%, #1e40af 100%)" }}
    >
      <div className="flex-shrink-0 px-5 pt-6 pb-3 flex items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/family-talk"
            className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl text-white hover:bg-white/20 transition-all active:scale-90"
          >
            ←
          </Link>
          <h1 className="text-xl font-black text-white truncate">{topic.title}</h1>
        </div>
        <span className="flex-shrink-0 text-white/70 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full">
          {words.length} words
        </span>
      </div>

      <div 
        className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
      >
        {words.length === 0 && (
          <div className="w-full h-full flex-shrink-0 flex items-center justify-center text-center px-8 snap-center">
            <p className="text-white/70 font-bold">No vocabulary linked to this topic yet.</p>
          </div>
        )}
        {wordPages.map((pageWords, pageIndex) => {
          const layout = layouts[pageIndex];
          return (
            <div key={pageIndex} className="w-full h-full flex-shrink-0 relative snap-center">
              {pageWords.map((word, i) => {
                const slot = layout[i];
                const isPlaying = playingId === word._id;
                if (!slot) return null;
                return (
                  <button
                    key={word._id}
                    onClick={() => handleTap(word)}
                    className="absolute flex flex-col items-center gap-1 active:scale-90 transition-transform"
                    style={{
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                      transform: `translate(-50%, -50%) rotate(${isPlaying ? 0 : slot.rotate}deg) scale(${isPlaying ? 1.12 : 1})`,
                      zIndex: isPlaying ? 10 : 1,
                      transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                    }}
                  >
                    <div
                      className="w-24 rounded-2xl overflow-hidden shadow-xl border-2 flex flex-col items-center pb-2"
                      style={{
                        background: isPlaying ? "#fffbeb" : "#ffffff",
                        borderColor: isPlaying ? "#facc15" : "rgba(255,255,255,0.4)",
                        boxShadow: isPlaying ? "0 6px 20px rgba(250,204,21,0.5)" : undefined,
                      }}
                    >
                      <div className="w-full h-16 bg-gray-50 flex items-center justify-center overflow-hidden">
                        {word.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={word.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                          <span className="text-3xl">🔤</span>
                        )}
                      </div>
                      <p className="text-gray-800 font-black text-sm mt-1 text-center px-1 leading-tight">
                        {word.japanese}
                      </p>
                      {word.hiragana && word.hiragana !== word.japanese && (
                        <p className="text-gray-400 text-[10px] text-center px-1 leading-tight">
                          {word.hiragana}
                        </p>
                      )}
                      {word.romaji && (
                        <p className="text-pink-500 text-[10px] font-bold text-center px-1 leading-tight">
                          {word.romaji}
                        </p>
                      )}
                      <span className="text-sm mt-0.5">🔊</span>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      
      {/* Pagination indicators */}
      {wordPages.length > 1 && (
        <div className="flex-shrink-0 flex items-center justify-center gap-2 pb-6 z-10 pointer-events-none">
          {wordPages.map((_, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-colors ${i === currentPage ? 'bg-white' : 'bg-white/30'}`} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
