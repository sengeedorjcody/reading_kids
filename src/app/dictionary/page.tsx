"use client";

import { useState, useEffect, useCallback } from "react";
import { IDictionaryWord } from "@/types";
import WordCard from "@/components/dictionary/WordCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DictionaryPage() {
  const [words, setWords] = useState<IDictionaryWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [exporting, setExporting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchWords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      params.set("limit", "30");
      const res = await fetch(`/api/dictionary?${params}`);
      const data = await res.json();
      setWords(data.words ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setWords([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchWords(); }, [fetchWords]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/dictionary/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dictionary_export.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-black text-gray-800 mb-2">📝 Dictionary</h1>
          <p className="text-xl text-gray-500">じしょ を みよう！</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold text-sm transition-colors"
        >
          {exporting ? "⏳ Exporting..." : "📥 Export Excel"}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-xl">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search in Japanese, romaji, or English..."
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        )}
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-sm text-gray-400 mb-4">
          {total} word{total !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Results */}
      {loading ? (
        <LoadingSpinner />
      ) : words.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="text-8xl">🔍</div>
          <p className="text-2xl font-bold text-gray-400">No words found</p>
          {search && (
            <button onClick={() => setSearch("")} className="text-purple-500 font-bold hover:underline">
              Clear search
            </button>
          )}
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
