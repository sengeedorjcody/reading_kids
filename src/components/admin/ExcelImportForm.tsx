"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface ImportResult {
  success: boolean;
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
  error?: string;
}

interface Conversation { _id: string; title: string; }
interface Book { _id: string; title: string; }

function ExcelImportModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [conversationId, setConversationId] = useState("");
  const [bookId, setBookId] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/conversations/all")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations ?? []))
      .catch(() => {});
    fetch("/api/books")
      .then((r) => r.json())
      .then((d) => setBooks(d.books ?? []))
      .catch(() => {});
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleFile = (f: File) => { setFile(f); setResult(null); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    if (conversationId) fd.append("conversationId", conversationId);
    if (bookId) fd.append("bookId", bookId);
    try {
      const res = await fetch("/api/dictionary/import", { method: "POST", body: fd });
      const data: ImportResult = await res.json();
      setResult(data);
      if (data.success) router.refresh();
    } catch {
      setResult({ success: false, total: 0, inserted: 0, updated: 0, skipped: 0, errors: ["Network error"] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <h2 className="text-xl font-black text-gray-800">Import from Excel</h2>
              <p className="text-xs text-gray-400">Upload a .xlsx / .xls / .csv file</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/api/dictionary/template"
              download="dictionary_template.xlsx"
              className="flex items-center gap-1.5 text-sm font-bold text-green-600 hover:text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              ⬇ Template
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors text-lg font-black shadow-sm border border-gray-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Column guide */}
          <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-500 space-y-1">
            <p className="font-bold text-gray-600 mb-2">Excel column headers:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              <span><span className="text-pink-500 font-bold">japanese_word</span> *required</span>
              <span>hiragana</span>
              <span>romaji</span>
              <span>english_meaning</span>
              <span>mongolian_meaning</span>
              <span>example_sentence</span>
              <span>example_sentence_reading</span>
              <span className="text-blue-500 font-bold">example_image_url</span>
              <span>jlpt_level</span>
              <span>part_of_speech</span>
            </div>
            <p className="mt-2 text-gray-400">
              💡 <span className="font-bold text-blue-500">example_image_url</span> — paste a Cloudinary or public image URL
            </p>
          </div>

          {/* Conversation picker */}
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">
              Link to Conversation <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-2xl px-4 py-2.5 text-gray-700 outline-none bg-white"
            >
              <option value="">— No conversation —</option>
              {conversations.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
            {conversationId && (
              <p className="text-xs text-purple-500 font-bold mt-1">Words will be tagged with this conversation</p>
            )}
          </div>

          {/* Book picker */}
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">
              Link to Book <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-blue-400 rounded-2xl px-4 py-2.5 text-gray-700 outline-none bg-white"
            >
              <option value="">— No book —</option>
              {books.map((b) => (
                <option key={b._id} value={b._id}>{b.title}</option>
              ))}
            </select>
            {bookId && (
              <p className="text-xs text-blue-500 font-bold mt-1">Words will be tagged with this book</p>
            )}
          </div>

          {/* Drop zone */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragging
                  ? "border-green-400 bg-green-50"
                  : file
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {file ? (
                <div className="space-y-1">
                  <div className="text-3xl">📊</div>
                  <p className="font-bold text-green-700">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB · click to change</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-4xl">📁</div>
                  <p className="font-bold text-gray-500">Drop your .xlsx file here</p>
                  <p className="text-sm text-gray-400">or click to browse</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black py-3 rounded-2xl text-lg transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Importing…
                </span>
              ) : "📥 Import Words"}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className={`rounded-2xl p-4 ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              {result.error ? (
                <p className="text-red-600 font-bold">{result.error}</p>
              ) : (
                <div className="space-y-2">
                  <p className="font-black text-green-700 text-lg">✅ Import complete!</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white rounded-xl p-2">
                      <div className="text-2xl font-black text-green-600">{result.inserted}</div>
                      <div className="text-xs text-gray-400">new</div>
                    </div>
                    <div className="bg-white rounded-xl p-2">
                      <div className="text-2xl font-black text-blue-500">{result.updated}</div>
                      <div className="text-xs text-gray-400">updated</div>
                    </div>
                    <div className="bg-white rounded-xl p-2">
                      <div className="text-2xl font-black text-gray-400">{result.skipped}</div>
                      <div className="text-xs text-gray-400">skipped</div>
                    </div>
                  </div>
                  {result.errors.length > 0 && (
                    <div className="bg-yellow-50 rounded-xl p-3 mt-2">
                      <p className="text-xs font-bold text-yellow-700 mb-1">Warnings:</p>
                      {result.errors.map((e, i) => (
                        <p key={i} className="text-xs text-yellow-600">{e}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExcelImportForm() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-2xl transition-all shadow-sm"
      >
        📊 Import Excel
      </button>

      {open && <ExcelImportModal onClose={() => setOpen(false)} />}
    </>
  );
}
