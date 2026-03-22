"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

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

  const bookId = params.get("book") ?? "";
  const conversationId = params.get("conversation") ?? "";

  const update = (book: string, conversation: string) => {
    const q = new URLSearchParams();
    if (book) q.set("book", book);
    if (conversation) q.set("conversation", conversation);
    startTransition(() => router.push(`/admin/dictionary?${q.toString()}`));
  };

  const hasFilter = bookId || conversationId;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={bookId}
        onChange={(e) => update(e.target.value, "")}
        className="border-2 border-gray-200 focus:border-purple-400 rounded-xl px-3 py-2 text-sm font-bold text-gray-600 outline-none bg-white"
      >
        <option value="">📚 All Books</option>
        {books.map((b) => (
          <option key={b._id} value={b._id}>{b.title}</option>
        ))}
      </select>

      <select
        value={conversationId}
        onChange={(e) => update("", e.target.value)}
        className="border-2 border-gray-200 focus:border-purple-400 rounded-xl px-3 py-2 text-sm font-bold text-gray-600 outline-none bg-white"
      >
        <option value="">💬 All Conversations</option>
        {conversations.map((c) => (
          <option key={c._id} value={c._id}>{c.title}</option>
        ))}
      </select>

      {hasFilter && (
        <button
          onClick={() => update("", "")}
          className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
        >
          ✕ Clear
        </button>
      )}

      <span className="text-sm text-gray-400 font-bold ml-auto">{total} words</span>
    </div>
  );
}
