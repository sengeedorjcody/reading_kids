"use client";

import { useRef, useState, useTransition } from "react";
import { updateTextBook } from "@/app/admin/books/[bookId]/edit/actions";

const LEVELS = ["hiragana", "katakana", "beginner", "intermediate", "advanced", "N5", "N4", "N3"] as const;

interface Props {
  bookId: string;
  initialTitle: string;
  initialTitleJapanese: string;
  initialLevel: string;
  initialDescription: string;
  initialPages: string[];
}

export default function EditBookForm({
  bookId,
  initialTitle,
  initialTitleJapanese,
  initialLevel,
  initialDescription,
  initialPages,
}: Props) {
  const [pages, setPages] = useState<string[]>(initialPages.length > 0 ? initialPages : [""]);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const addPage = () => setPages((p) => [...p, ""]);
  const removePage = (i: number) => setPages((p) => p.filter((_, idx) => idx !== i));
  const updatePage = (i: number, val: string) =>
    setPages((p) => p.map((v, idx) => (idx === i ? val : v)));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    pages.forEach((text) => fd.append("page", text));
    startTransition(() => updateTextBook(bookId, fd));
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* ── Book metadata ── */}
      <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-gray-700">📖 Book info</h2>

        <div>
          <label className="block text-sm font-bold text-gray-500 mb-1">Title *</label>
          <input
            name="title"
            required
            defaultValue={initialTitle}
            placeholder="e.g. はじめての にほんご"
            className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 mb-1">Japanese title (optional)</label>
          <input
            name="titleJapanese"
            defaultValue={initialTitleJapanese}
            placeholder="e.g. はじめての にほんご"
            className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-1">Level *</label>
            <select
              name="level"
              defaultValue={initialLevel || "beginner"}
              className="w-full border border-gray-200 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-1">Description</label>
            <input
              name="description"
              defaultValue={initialDescription}
              placeholder="Short description…"
              className="w-full border border-gray-200 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
        </div>
      </div>

      {/* ── Pages ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-700">📄 Pages</h2>
          <button
            type="button"
            onClick={addPage}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-2 px-4 rounded-2xl text-sm transition-colors"
          >
            ＋ Add page
          </button>
        </div>

        {pages.map((text, i) => (
          <div key={i} className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-400">Page {i + 1}</span>
              {pages.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePage(i)}
                  className="text-red-400 hover:text-red-600 text-xs font-bold"
                >
                  ✕ Remove
                </button>
              )}
            </div>

            <textarea
              value={text}
              onChange={(e) => updatePage(i, e.target.value)}
              placeholder="Enter Japanese text…"
              rows={6}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-xl leading-relaxed focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none font-sans"
              style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
            />

            {text.trim() && (
              <div className="mt-3 p-3 bg-pink-50 rounded-2xl">
                <p className="text-xs text-gray-400 font-bold mb-2">Preview — sentences detected:</p>
                <div className="space-y-1">
                  {text
                    .split(/(?<=[。！？!?\n])/)
                    .flatMap((s) => s.split("\n"))
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((s, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <span className="text-pink-300 text-xs mt-1 font-bold">{j + 1}.</span>
                        <span className="text-base text-gray-700">{s}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-black py-4 rounded-3xl text-xl transition-colors active:scale-95"
      >
        {isPending ? "Saving…" : "💾 Save Changes"}
      </button>
    </form>
  );
}
