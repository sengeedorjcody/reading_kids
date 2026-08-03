"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { IDictionaryWord } from "@/types";
import WordCard from "@/components/dictionary/WordCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function MyWordsPage() {
  const { data: session, status } = useSession();
  const [words, setWords] = useState<IDictionaryWord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/saved-words")
      .then((r) => r.json())
      .then((data) => setWords(data.words ?? []))
      .catch(() => setWords([]))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-200/30 border-t-pink-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6 pb-28">
        <div className="text-8xl">🔒</div>
        <p className="text-2xl font-bold text-white/70">Log in to see your saved words</p>
        <Link href="/login" className="text-pink-400 font-bold hover:underline">
          Log In →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-28">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">📚 My Saved Words</h1>
        <p className="text-xl text-white/60">Words you bookmarked</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : words.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="text-8xl">📭</div>
          <p className="text-2xl font-bold text-white/50">No saved words yet</p>
          <Link href="/dictionary" className="text-pink-400 font-bold hover:underline">
            Browse the dictionary →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {words.map((word) => (
            <WordCard key={word._id} word={word} compact />
          ))}
        </div>
      )}
    </div>
  );
}
