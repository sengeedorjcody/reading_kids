"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IDictionaryWord } from "@/types";

interface FamilyWordPickerProps {
  topicId: string;
  existingJapanese: string[];
}

export default function FamilyWordPicker({ topicId, existingJapanese }: FamilyWordPickerProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IDictionaryWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const existingSet = new Set(existingJapanese);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Empty query still hits the API — it just omits the q filter,
        // so admins can browse the full dictionary before they've typed
        // anything.
        const q = query.trim();
        const res = await fetch(`/api/dictionary?limit=50${q ? `&q=${encodeURIComponent(q)}` : ""}`);
        const data = await res.json();
        setResults(data.words ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleAdd = async (word: IDictionaryWord) => {
    setAddingId(word._id);
    try {
      await fetch(`/api/family-talk/topics/${topicId}/words`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          japanese: word.japanese_word,
          hiragana: word.hiragana,
          romaji: word.romaji,
          english_meaning: word.english_meaning,
          mongolian_meaning: word.mongolian_meaning,
          imageUrl: word.example_image_url,
          audioUrl: word.pronunciation_audio_url,
        }),
      });
      router.refresh();
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 space-y-4 border-2 border-dashed border-gray-200">
      <h3 className="font-black text-gray-700 flex items-center gap-2">📖 Add Words from Dictionary</h3>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by Japanese, romaji, or meaning…"
        className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:border-pink-400 focus:outline-none"
      />

      {loading && <p className="text-sm text-gray-400 font-bold">Searching…</p>}

      {!loading && results.length === 0 && (
        <p className="text-sm text-gray-400 font-bold">No dictionary words found.</p>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {results.map((word) => {
          const already = existingSet.has(word.japanese_word);
          return (
            <div key={word._id} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                {word.example_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={word.example_image_url} alt="" className="w-full h-full object-contain p-0.5" />
                ) : (
                  <span className="text-lg">🔤</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-700 truncate">{word.japanese_word}</p>
                <p className="text-xs text-gray-400 truncate">
                  {[word.romaji, word.english_meaning].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                onClick={() => handleAdd(word)}
                disabled={already || addingId === word._id}
                className={`flex-shrink-0 font-bold px-3 py-2 rounded-xl text-sm transition-colors ${
                  already
                    ? "bg-gray-100 text-gray-400"
                    : "bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-50"
                }`}
              >
                {already ? "Added" : addingId === word._id ? "…" : "+ Add"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
