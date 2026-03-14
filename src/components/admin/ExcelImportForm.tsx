"use client";

import { useRef, useState } from "react";
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

export default function ExcelImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
  };

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

    try {
      const res = await fetch("/api/dictionary/import", { method: "POST", body: fd });
      const data: ImportResult = await res.json();
      setResult(data);
      if (data.success) {
        router.refresh();
      }
    } catch {
      setResult({ success: false, total: 0, inserted: 0, updated: 0, skipped: 0, errors: ["Network error"] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5 max-w-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-gray-700">📊 Import from Excel</h2>
        <a
          href="/api/dictionary/template"
          download="dictionary_template.xlsx"
          className="flex items-center gap-1.5 text-sm font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-xl transition-colors"
        >
          ⬇ Download template
        </a>
      </div>

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
          💡 <span className="font-bold text-blue-500">example_image_url</span> — paste a Cloudinary or public image URL in this column
        </p>
      </div>

      {/* Drop zone */}
      <form onSubmit={handleSubmit}>
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
          className="mt-4 w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black py-3 rounded-2xl text-lg transition-colors"
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
  );
}
