"use client";

import { useState, useEffect } from "react";
import { IDictionaryWord } from "@/types";
import Image from "next/image";
import AudioButton from "@/components/dictionary/AudioButton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface AlphabetDictionaryModalProps {
  char: string;
  romaji: string;
  onClose: () => void;
}

function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight || !text) return <span>{text}</span>;

  const parts = text.split(highlight);
  return (
    <span>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="bg-yellow-300 text-yellow-900 font-black rounded px-0.5 mx-0.5">
              {highlight}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}

function DictionaryWordRow({ word, highlight }: { word: IDictionaryWord; highlight: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-100 flex items-center gap-4 hover:border-pink-300 hover:shadow-md transition-all">
      {word.example_image_url && (
        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
          <Image
            src={word.example_image_url}
            alt={word.japanese_word}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-bold text-gray-800">
            <HighlightedText text={word.japanese_word} highlight={highlight} />
          </span>
          {word.hiragana && word.hiragana !== word.japanese_word && (
            <span className="text-sm text-gray-400">
              <HighlightedText text={word.hiragana} highlight={highlight} />
            </span>
          )}
        </div>
        {word.romaji && (
          <p className="text-sm text-blue-500 font-medium">{word.romaji}</p>
        )}
        {word.english_meaning && (
          <p className="text-sm text-gray-600 truncate">{word.english_meaning}</p>
        )}
        {word.mongolian_meaning && (
          <p className="text-xs text-gray-400 truncate">{word.mongolian_meaning}</p>
        )}
      </div>
      <AudioButton text={word.japanese_word} audioUrl={word.pronunciation_audio_url} size="sm" />
    </div>
  );
}

export default function AlphabetDictionaryModal({ char, romaji, onClose }: AlphabetDictionaryModalProps) {
  const [words, setWords] = useState<IDictionaryWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dictionary?q=${encodeURIComponent(char)}&limit=50`);
        const data = await res.json();
        setWords(data.words ?? []);
        setTotal(data.total ?? 0);
      } catch {
        setWords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [char]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Window panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Big character display */}
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-pink-200 flex items-center justify-center shadow-sm">
              <span className="text-4xl font-black text-gray-800">{char}</span>
            </div>
            <div>
              <p className="text-2xl font-black text-blue-500">{romaji}</p>
              {!loading && (
                <p className="text-sm text-gray-400">
                  {total === 0
                    ? "No words found"
                    : (
                      <>
                        {total} word{total !== 1 ? "s" : ""} with{" "}
                        <span className="bg-yellow-300 text-yellow-900 font-black rounded px-1 text-xs">
                          {char}
                        </span>
                      </>
                    )}
                </p>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-purple-400 font-bold hidden sm:block">
              📖 Dictionary
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors text-lg font-black shadow-sm border border-gray-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Word list body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <LoadingSpinner />
              <p className="text-gray-400 text-sm">Loading words…</p>
            </div>
          ) : words.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="text-6xl">📭</div>
              <p className="text-xl font-bold text-gray-400">No words found</p>
              <p className="text-gray-400 text-sm">
                No dictionary words contain{" "}
                <span className="font-bold text-gray-600">「{char}」</span> yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {words.map((word) => (
                <DictionaryWordRow key={word._id} word={word} highlight={char} />
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        {!loading && words.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <p className="text-xs text-center text-gray-400">
              Click 🔊 on any word to hear its pronunciation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
