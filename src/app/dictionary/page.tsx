"use client";

import { useState, useEffect, useCallback } from "react";
import { IDictionaryWord, IBook } from "@/types";
import WordCard from "@/components/dictionary/WordCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface IConversationSimple {
  _id: string;
  title: string;
}

export default function DictionaryPage() {
  const [words, setWords] = useState<IDictionaryWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [exporting, setExporting] = useState(false);

  const [books, setBooks] = useState<IBook[]>([]);
  const [conversations, setConversations] = useState<IConversationSimple[]>([]);
  const [filterType, setFilterType] = useState<"all" | "book" | "conversation">("all");
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedConversation, setSelectedConversation] = useState("");

  // Fetch books + conversations on mount
  useEffect(() => {
    fetch("/api/books?limit=50")
      .then((r) => r.json())
      .then((data) => setBooks(data.books ?? []))
      .catch(() => {});
    fetch("/api/conversations/all")
      .then((r) => r.json())
      .then((data) => setConversations(data.conversations ?? []))
      .catch(() => {});
  }, []);

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
      if (filterType === "book" && selectedBook) params.set("bookId", selectedBook);
      if (filterType === "conversation" && selectedConversation) params.set("conversationId", selectedConversation);
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
  }, [debouncedSearch, filterType, selectedBook, selectedConversation]);

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

  const selectBook = (id: string) => {
    setSelectedBook(id);
    setFilterType("book");
    setSearch("");
  };

  const selectConversation = (id: string) => {
    setSelectedConversation(id);
    setFilterType("conversation");
    setSearch("");
  };

  const selectAll = () => {
    setFilterType("all");
    setSelectedBook("");
    setSelectedConversation("");
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

      {/* Filter pills */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={selectAll}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              filterType === "all"
                ? "bg-purple-500 text-white shadow-md shadow-purple-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            📚 All words
          </button>
        </div>

        {books.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mr-1">Books</span>
            {books.map((b) => (
              <button
                key={b._id}
                onClick={() => selectBook(b._id)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  filterType === "book" && selectedBook === b._id
                    ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                📖 {b.title}
              </button>
            ))}
          </div>
        )}

        {conversations.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mr-1">Conversations</span>
            {conversations.map((c) => (
              <button
                key={c._id}
                onClick={() => selectConversation(c._id)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  filterType === "conversation" && selectedConversation === c._id
                    ? "bg-pink-500 text-white shadow-md shadow-pink-200"
                    : "bg-pink-50 text-pink-600 hover:bg-pink-100"
                }`}
              >
                💬 {c.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-xl">
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
          {filterType === "book" && selectedBook && (
            <span className="ml-2 text-blue-400 font-bold">
              · 📖 {books.find((b) => b._id === selectedBook)?.title}
            </span>
          )}
          {filterType === "conversation" && selectedConversation && (
            <span className="ml-2 text-pink-400 font-bold">
              · 💬 {conversations.find((c) => c._id === selectedConversation)?.title}
            </span>
          )}
        </p>
      )}

      {/* Results */}
      {loading ? (
        <LoadingSpinner />
      ) : words.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="text-8xl">🔍</div>
          <p className="text-2xl font-bold text-gray-400">No words found</p>
          {(search || filterType !== "all") && (
            <button onClick={() => { setSearch(""); selectAll(); }} className="text-purple-500 font-bold hover:underline">
              Clear filters
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
