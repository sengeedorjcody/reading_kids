"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

interface Option { _id: string; title: string; }

interface Props {
  books: Option[];
  conversations: Option[];
  total: number;
}

export default function DictionaryFilter({ books, conversations, total }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const bookId       = params.get("book")         ?? "";
  const conversationId = params.get("conversation") ?? "";
  const qParam       = params.get("q")            ?? "";

  const [search, setSearch] = useState(qParam);

  // Keep local input in sync if the URL changes externally
  useEffect(() => { setSearch(qParam); }, [qParam]);

  const push = (book: string, conversation: string, q: string) => {
    const qs = new URLSearchParams();
    if (book)         qs.set("book",         book);
    if (conversation) qs.set("conversation", conversation);
    if (q.trim())     qs.set("q",            q.trim());
    startTransition(() => router.push(`/admin/dictionary?${qs.toString()}`));
  };

  // Debounce search input — fire after 350 ms of no typing
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== qParam) push(bookId, conversationId, search);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasFilter = bookId || conversationId || qParam;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search box */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search words…"
          className="border-2 border-gray-200 focus:border-pink-400 rounded-xl pl-8 pr-8 py-2 text-sm font-bold text-gray-700 outline-none bg-white w-48"
        />
        {search && (
          <button
            onClick={() => { setSearch(""); push(bookId, conversationId, ""); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-xs font-black"
          >
            ✕
          </button>
        )}
      </div>

      {/* Book filter */}
      <select
        value={bookId}
        onChange={(e) => push(e.target.value, "", search)}
        className="border-2 border-gray-200 focus:border-purple-400 rounded-xl px-3 py-2 text-sm font-bold text-gray-600 outline-none bg-white"
      >
        <option value="">📚 All Books</option>
        {books.map((b) => (
          <option key={b._id} value={b._id}>{b.title}</option>
        ))}
      </select>

      {/* Conversation filter */}
      <select
        value={conversationId}
        onChange={(e) => push("", e.target.value, search)}
        className="border-2 border-gray-200 focus:border-purple-400 rounded-xl px-3 py-2 text-sm font-bold text-gray-600 outline-none bg-white"
      >
        <option value="">💬 All Conversations</option>
        {conversations.map((c) => (
          <option key={c._id} value={c._id}>{c.title}</option>
        ))}
      </select>

      {hasFilter && (
        <button
          onClick={() => { setSearch(""); push("", "", ""); }}
          className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
        >
          ✕ Clear all
        </button>
      )}

      <span className="text-sm text-gray-400 font-bold ml-auto">{total} words</span>
    </div>
  );
}
