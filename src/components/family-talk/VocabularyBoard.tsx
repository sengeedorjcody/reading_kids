"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSpeech } from "@/hooks/useSpeech";
import { IConversation, IDictionaryWord } from "@/types";
import { buildScatterLayout } from "@/lib/scatterLayout";

export default function VocabularyBoard({ topic, words }: { topic: IConversation; words: IDictionaryWord[] }) {
  const { speak } = useSpeech();
  const layout = useMemo(() => buildScatterLayout(words.length), [words.length]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = (word: IDictionaryWord) => {
    speak(word.japanese_word, word.pronunciation_audio_url);
    setPlayingId(word._id);
    if (playTimer.current) clearTimeout(playTimer.current);
    playTimer.current = setTimeout(() => setPlayingId(null), 2200);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0f766e 0%, #0e7490 45%, #1e40af 100%)" }}
    >
      <div className="flex-shrink-0 px-5 pt-6 pb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link href="/family-talk" className="text-white/60 hover:text-white text-sm font-bold">← Family Talk</Link>
          <h1 className="text-xl font-black text-white truncate mt-0.5">{topic.title}</h1>
        </div>
        <span className="flex-shrink-0 text-white/70 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full">
          {words.length} words
        </span>
      </div>

      <div className="flex-1 relative">
        {words.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-center px-8">
            <p className="text-white/70 font-bold">No vocabulary linked to this topic yet.</p>
          </div>
        )}
        {words.map((word, i) => {
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
                  {word.example_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={word.example_image_url} alt="" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-3xl">🔤</span>
                  )}
                </div>
                <p className="text-gray-800 font-black text-sm mt-1 text-center px-1 leading-tight">
                  {word.japanese_word}
                </p>
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
    </div>
  );
}
