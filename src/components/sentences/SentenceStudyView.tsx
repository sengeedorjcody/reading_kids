"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSpeech } from "@/hooks/useSpeech";
import { ITopic, ITopicSentence } from "@/types";

export default function SentenceStudyView({
  topic,
  sentences,
}: {
  topic: ITopic;
  sentences: ITopicSentence[];
}) {
  const { speak } = useSpeech();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePlay = (sentence: ITopicSentence) => {
    if (!sentence.japanese) return;
    speak(sentence.japanese);
    setPlayingId(sentence._id);
    if (playTimer.current) clearTimeout(playTimer.current);
    playTimer.current = setTimeout(() => setPlayingId(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Link href="/sentences" className="text-white/50 hover:text-white text-sm font-bold">← Sentences</Link>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 mt-1">
            <span className="text-4xl">🗣️</span> {topic.title}
          </h1>
          {topic.titleJapanese && <p className="text-white/60 mt-1">{topic.titleJapanese}</p>}
        </div>
        {sentences.length > 0 && (
          <Link
            href={`/sentences/${topic._id}/quiz`}
            className="flex-shrink-0 bg-gradient-to-br from-orange-500 to-pink-500 text-white font-black px-5 py-3 rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            📝 Quiz
          </Link>
        )}
      </div>

      {sentences.length === 0 ? (
        <div className="text-center py-20 text-white/40">
          <div className="text-6xl mb-4">🗣️</div>
          <p className="text-xl font-bold">No sentences yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sentences.map((sentence) => {
            const isPlaying = playingId === sentence._id;
            return (
              <button
                key={sentence._id}
                onClick={() => handlePlay(sentence)}
                className="w-full text-left flex items-center gap-4 p-4 rounded-3xl border-2 shadow-sm transition-all active:scale-95"
                style={{
                  backgroundColor: isPlaying ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
                  borderColor: isPlaying ? "#ec4899" : "rgba(255,255,255,0.12)",
                  boxShadow: isPlaying ? "0 4px 20px rgba(236,72,153,0.35)" : undefined,
                }}
              >
                {sentence.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sentence.imageUrl} alt="" className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-3xl flex-shrink-0">
                    🖼️
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-black text-white leading-snug">{sentence.japanese}</p>
                  {sentence.romaji && <p className="text-sm font-bold mt-0.5 text-pink-300">{sentence.romaji}</p>}
                  {sentence.english_meaning && <p className="text-sm text-white/60 mt-0.5">{sentence.english_meaning}</p>}
                  {sentence.mongolian_meaning && <p className="text-sm text-white/40 mt-0.5">{sentence.mongolian_meaning}</p>}
                </div>
                <span
                  className="text-2xl flex-shrink-0 transition-transform"
                  style={{ transform: isPlaying ? "scale(1.3)" : "scale(1)" }}
                >
                  🔊
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
