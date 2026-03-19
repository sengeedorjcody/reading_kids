"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface ImportResult {
  success: boolean;
  inserted: number;
  errors: string[];
  error?: string;
}

export default function ConversationExcelImport({ conversationId }: { conversationId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/import`, { method: "POST", body: fd });
      const data: ImportResult = await res.json();
      setResult(data);
      if (data.success) { router.refresh(); }
    } catch {
      setResult({ success: false, inserted: 0, errors: ["Network error"] });
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-bold px-4 py-2.5 rounded-xl border border-green-200 transition-colors text-sm"
      >
        📊 Import from Excel
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-gray-700">📊 Import Conversation from Excel</h3>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
      </div>

      <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
        <p className="font-bold text-gray-600">Excel columns:</p>
        <div className="grid grid-cols-2 gap-1">
          <span><span className="text-pink-500 font-bold">page_number</span> *</span>
          <span><span className="text-pink-500 font-bold">character_name</span> * (must match character name)</span>
          <span><span className="text-pink-500 font-bold">text</span> (dialogue)</span>
          <span>char_x, char_y (0-100, default 50)</span>
          <span>text_x, text_y (0-100, default 50/80)</span>
        </div>
        <p className="text-gray-400">Multiple rows with same page_number = multiple characters on that page</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${file ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
        >
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
          {file ? (
            <div><div className="text-2xl">📊</div><p className="font-bold text-green-700 text-sm">{file.name}</p></div>
          ) : (
            <div><div className="text-3xl">📁</div><p className="font-bold text-gray-400 text-sm">Drop .xlsx file here or click</p></div>
          )}
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-200 text-white font-black py-2.5 rounded-2xl transition-colors"
        >
          {loading ? "Importing…" : "📥 Import Pages"}
        </button>
      </form>

      {result && (
        <div className={`rounded-xl p-3 ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          {result.error ? (
            <p className="text-red-600 font-bold text-sm">{result.error}</p>
          ) : (
            <div className="space-y-1">
              <p className="font-black text-green-700">✅ Imported {result.inserted} pages!</p>
              {result.errors.length > 0 && (
                <div className="space-y-0.5">
                  {result.errors.map((e, i) => <p key={i} className="text-xs text-yellow-600">{e}</p>)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
