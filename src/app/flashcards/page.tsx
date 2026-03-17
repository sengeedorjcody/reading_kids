"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { IDictionaryWord, IBook } from "@/types";
import AudioButton from "@/components/dictionary/AudioButton";

export default function FlashcardsPage() {
  const [books, setBooks] = useState<IBook[]>([]);
  const [selectedBook, setSelectedBook] = useState("all");
  const [words, setWords] = useState<IDictionaryWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Fetch books on mount
  useEffect(() => {
    fetch("/api/books?limit=50")
      .then((r) => r.json())
      .then((data) => setBooks(data.books ?? []))
      .catch(() => {});
  }, []);

  // Fetch words when book changes
  const fetchWords = useCallback(async () => {
    setLoading(true);
    setIndex(0);
    setFlipped(false);
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (selectedBook !== "all") params.set("bookId", selectedBook);
      const res = await fetch(`/api/dictionary?${params}`);
      const data = await res.json();
      // Shuffle the words
      const arr: IDictionaryWord[] = data.words ?? [];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setWords(arr);
    } catch {
      setWords([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBook]);

  useEffect(() => { fetchWords(); }, [fetchWords]);

  const current = words[index];
  const total = words.length;

  const goNext = () => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.min(total - 1, i + 1)), 150);
  };

  const goPrev = () => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.max(0, i - 1)), 150);
  };

  const shuffle = () => {
    const arr = [...words];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setWords(arr);
    setIndex(0);
    setFlipped(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-black text-gray-800 mb-1">🃏 Flashcards</h1>
        <p className="text-lg text-gray-500">フラッシュカード で おぼえよう！</p>
      </div>

      {/* Book filter */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedBook("all")}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            selectedBook === "all"
              ? "bg-pink-500 text-white shadow-md shadow-pink-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          📚 All words
        </button>
        {books.map((b) => (
          <button
            key={b._id}
            onClick={() => setSelectedBook(b._id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              selectedBook === b._id
                ? "bg-pink-500 text-white shadow-md shadow-pink-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {b.title}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          <p className="text-gray-400 font-bold">Loading cards…</p>
        </div>
      ) : words.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
          <div className="text-8xl">📭</div>
          <p className="text-2xl font-bold text-gray-400">No words found</p>
          <p className="text-gray-400 text-sm">Add words to the dictionary first</p>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-400 rounded-full transition-all duration-300"
                style={{ width: `${((index + 1) / total) * 100}%` }}
              />
            </div>
            <span className="text-sm font-black text-gray-500 tabular-nums w-16 text-right">
              {index + 1} / {total}
            </span>
          </div>

          {/* Card */}
          <div
            className="flashcard-container w-full cursor-pointer select-none mb-6"
            style={{ height: "380px" }}
            onClick={() => setFlipped((f) => !f)}
          >
            <div className={`flashcard-inner w-full h-full relative${flipped ? " flipped" : ""}`}>
              {/* Front — Japanese word */}
              <div className="flashcard-front absolute inset-0 bg-white rounded-3xl shadow-xl border-2 border-pink-100 flex flex-col items-center justify-center gap-4 p-8">
                <div className="text-6xl font-black text-gray-800" style={{ fontFamily: "var(--font-noto-serif-jp), serif" }}>
                  {current.japanese_word}
                </div>
                {current.hiragana && current.hiragana !== current.japanese_word && (
                  <div className="text-2xl font-bold text-pink-400">{current.hiragana}</div>
                )}
                {current.romaji && (
                  <div className="text-lg text-gray-400 italic">{current.romaji}</div>
                )}
                <div className="mt-4 flex items-center gap-2 text-gray-300">
                  <span className="text-sm">tap to flip</span>
                  <span className="text-xl">↺</span>
                </div>
              </div>

              {/* Back — meanings + image */}
              <div className="flashcard-back absolute inset-0 bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl shadow-xl border-2 border-pink-200 overflow-hidden">
                <div className="flex flex-col h-full">
                  {/* Image */}
                  {current.example_image_url && (
                    <div className="relative w-full h-48 flex-shrink-0 bg-white">
                      <Image
                        src={current.example_image_url}
                        alt={current.japanese_word}
                        fill
                        className="object-contain"
                        sizes="640px"
                      />
                    </div>
                  )}

                  <div className={`flex flex-col justify-center gap-3 p-6 flex-1 ${!current.example_image_url ? "items-center text-center" : ""}`}>
                    {/* Word reminder */}
                    <div className="text-3xl font-black text-gray-700" style={{ fontFamily: "var(--font-noto-serif-jp), serif" }}>
                      {current.japanese_word}
                    </div>

                    {/* Meanings */}
                    {current.english_meaning && (
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🇬🇧</span>
                        <span className="text-lg font-bold text-gray-700">{current.english_meaning}</span>
                      </div>
                    )}
                    {current.mongolian_meaning && (
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🇲🇳</span>
                        <span className="text-lg font-bold text-gray-700">{current.mongolian_meaning}</span>
                      </div>
                    )}

                    {/* Audio */}
                    <div className="mt-1">
                      <AudioButton
                        text={current.japanese_word}
                        audioUrl={current.pronunciation_audio_url}
                        size="md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={goPrev}
              disabled={index === 0}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 font-bold py-3 px-6 rounded-2xl text-base transition-colors border-2 border-gray-200 active:scale-95"
            >
              ◀ まえ
            </button>

            <button
              onClick={shuffle}
              className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-600 font-bold py-3 px-5 rounded-2xl text-sm transition-colors active:scale-95"
              title="Shuffle cards"
            >
              🔀 shuffle
            </button>

            <button
              onClick={goNext}
              disabled={index === total - 1}
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-2xl text-base transition-colors shadow-md shadow-pink-200 active:scale-95"
            >
              つぎ ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}
