"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useReadingStore } from "@/store/readingStore";
import AudioButton from "@/components/dictionary/AudioButton";
import { IDictionaryWord } from "@/types";

export default function DictionaryPanel() {
  const { selectedWord, selectedSurface, setSelectedWord } = useReadingStore();
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [liveMn, setLiveMn] = useState("");
  const [mnLoading, setMnLoading] = useState(false);

  // ── Search dictionary when word clicked ──────────────────────────────────
  useEffect(() => {
    if (!selectedSurface || selectedWord) {
      setNotFound(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setLiveMn("");

    fetch(`/api/dictionary?q=${encodeURIComponent(selectedSurface)}&exact=true&limit=1`)
      .then((r) => r.json())
      .then((data: { words: IDictionaryWord[] }) => {
        if (cancelled) return;
        setLoading(false);
        const match = data.words?.[0];
        if (match) {
          setSelectedWord(match, selectedSurface);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setNotFound(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSurface, selectedWord, setSelectedWord]);

  // ── Fetch Mongolian via Google Translate ─────────────────────────────────
  // Runs for both: words in dictionary (uses japanese_word) and not-found words (uses selectedSurface)
  useEffect(() => {
    const wordToTranslate =
      selectedWord?.japanese_word || (notFound ? selectedSurface : null);
    if (!wordToTranslate) {
      setLiveMn("");
      return;
    }

    let cancelled = false;
    setMnLoading(true);

    fetch(`/api/mongolian?word=${encodeURIComponent(wordToTranslate)}`)
      .then((r) => r.json())
      .then((data: { mongolian?: string }) => {
        if (!cancelled) setLiveMn(data.mongolian ?? "");
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setMnLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedWord, notFound, selectedSurface]);

  /* ── Empty state ── */
  if (!selectedSurface) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
        <div className="text-6xl animate-pulse-slow">👆</div>
        <p className="text-base font-bold text-[#c8a96e]/80">
          ことばをクリックしてね
        </p>
        <p className="text-xs text-[#c8a96e]/40">Click any word to look up</p>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
        <div className="text-4xl font-bold text-[#c8a96e]">
          {selectedSurface}
        </div>
        <div className="flex gap-2">
          {[0, 150, 300].map((d) => (
            <div
              key={d}
              className="w-2.5 h-2.5 rounded-full bg-[#c8783c] animate-bounce"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </div>
        <p className="text-xs text-[#c8a96e]/50">じしょをさがしています…</p>
      </div>
    );
  }

  /* ── Not in dictionary — but show Google Translate Mongolian ── */
  if (notFound && !selectedWord) {
    return (
      <div className="flex flex-col gap-4 p-5 animate-fade-in">
        <div className="text-4xl font-bold text-[#c8a96e] ">
          {selectedSurface}
        </div>

        <div className="bg-[#2d1f0e] rounded-2xl p-3 border border-[#5a3e28]">
          <p className="text-xs text-[#c8a96e]/70 font-bold">
            まだ じしょに ありません
          </p>
          <p className="text-xs text-[#c8a96e]/40 mt-0.5">
            Not in dictionary yet
          </p>
        </div>

        {/* Still show Mongolian from Google Translate */}
        {mnLoading ? (
          <div className="flex items-center gap-2.5 bg-[#2d1f0e] rounded-xl p-3 border border-[#5a3e28]">
            <span className="text-lg">🇲🇳</span>
            <div className="flex gap-1.5 items-center">
              {[0, 100, 200].map((d) => (
                <div
                  key={d}
                  className="w-2 h-2 rounded-full bg-[#c8783c]/60 animate-bounce"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          </div>
        ) : liveMn ? (
          <div className="flex items-start gap-2.5 bg-[#2d1f0e] rounded-xl p-3 border border-[#5a3e28]">
            <span className="text-lg">🇲🇳</span>
            <div>
              <p className="text-xs text-[#c8a96e]/60 font-medium">Mongolian</p>
              <p className="text-base font-bold text-[#fdf6e8]">{liveMn}</p>
            </div>
          </div>
        ) : null}

        <AudioButton text={selectedSurface} size="lg" />
      </div>
    );
  }

  if (!selectedWord) return null;

  const mongolian = liveMn || selectedWord.mongolian_meaning;

  return (
    <div className="flex flex-col gap-4 p-4 animate-fade-in overflow-y-auto h-full reading-scroll">
      {/* Image */}
      {selectedWord.example_image_url && (
        <div className="relative w-full h-40 rounded-xl overflow-hidden">
          <Image
            src={selectedWord.example_image_url}
            alt={selectedWord.japanese_word}
            fill
            className="object-cover"
            sizes="320px"
          />
        </div>
      )}

      {/* Word header */}
      <div className="bg-[#2d1f0e] rounded-2xl p-3 border border-[#5a3e28] flex items-center justify-between gap-2">
        <div>
          <p className="text-base font-black text-[#fdf6e8]">
            {selectedWord.japanese_word}
          </p>
          {selectedWord.hiragana &&
            selectedWord.hiragana !== selectedWord.japanese_word && (
              <p className="text-sm text-[#e879a0] font-bold">
                {selectedWord.hiragana}
              </p>
            )}
          {selectedWord.romaji && (
            <p className="text-xs text-[#c8a96e] italic font-bold">
              {selectedWord.romaji}
            </p>
          )}
        </div>
        <AudioButton
          text={selectedWord.japanese_word}
          audioUrl={selectedWord.pronunciation_audio_url}
          size="lg"
        />
      </div>

      {/* Original word that was clicked */}
      {selectedSurface && selectedSurface !== selectedWord.japanese_word && (
        <div className="bg-[#2d1f0e] rounded-xl px-3 py-1.5 flex items-center gap-2 border border-[#5a3e28]">
          <span className="text-xs text-[#c8a96e]/60">Original:</span>
          <span className="text-base font-bold text-[#c8a96e]">
            {selectedSurface}
          </span>
        </div>
      )}

      {/* Meanings */}
      <div className="space-y-2">
        {selectedWord.english_meaning && (
          <div className="flex items-start gap-2.5 bg-[#2d1f0e] rounded-xl p-3 border border-[#5a3e28]">
            <span className="text-lg">🇬🇧</span>
            <div>
              <p className="text-xs text-[#c8a96e]/60 font-medium">English</p>
              <p className="text-base font-bold text-[#fdf6e8]">
                {selectedWord.english_meaning}
              </p>
            </div>
          </div>
        )}

        {/* Mongolian — Google Translate (live) or dict stored value */}
        {mnLoading ? (
          <div className="flex items-center gap-2.5 bg-[#2d1f0e] rounded-xl p-3 border border-[#5a3e28]">
            <span className="text-lg">🇲🇳</span>
            <div className="flex gap-1.5 items-center">
              {[0, 100, 200].map((d) => (
                <div
                  key={d}
                  className="w-2 h-2 rounded-full bg-[#c8783c]/60 animate-bounce"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          </div>
        ) : mongolian ? (
          <div className="flex items-start gap-2.5 bg-[#2d1f0e] rounded-xl p-3 border border-[#5a3e28]">
            <span className="text-lg">🇲🇳</span>
            <div>
              <p className="text-xs text-[#c8a96e]/60 font-medium">Mongolian</p>
              <p className="text-base font-bold text-[#fdf6e8]">{mongolian}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Example sentence */}
      {selectedWord.example_sentence && (
        <div className="bg-[#2d1f0e] rounded-xl p-3 border border-[#5a3e28]">
          <p className="text-xs text-[#c8a96e]/60 mb-1">Example:</p>
          <p className="text-sm text-[#fdf6e8]">
            {selectedWord.example_sentence}
          </p>
          {selectedWord.example_sentence_reading && (
            <p className="text-xs text-[#c8a96e]/60 mt-1">
              {selectedWord.example_sentence_reading}
            </p>
          )}
        </div>
      )}

      {/* Badges */}
      {(selectedWord.jlpt_level || selectedWord.part_of_speech) && (
        <div className="flex gap-2 flex-wrap">
          {selectedWord.jlpt_level && (
            <span className="bg-[#5a3e28] text-[#c8a96e] text-xs font-bold px-3 py-1 rounded-full">
              {selectedWord.jlpt_level}
            </span>
          )}
          {selectedWord.part_of_speech && (
            <span className="bg-[#3d2a18] text-[#c8a96e]/70 text-xs font-bold px-3 py-1 rounded-full">
              {selectedWord.part_of_speech}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
