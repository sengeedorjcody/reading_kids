"use client";

import { useState } from "react";
import { fixSrt, type SrtCue } from "@/lib/srt/spacing";

export default function SrtImportForm() {
  const [raw, setRaw] = useState("");
  const [fileName, setFileName] = useState("");
  const [spacing, setSpacing] = useState(true);
  const [cues, setCues] = useState<SrtCue[]>([]);
  const [fixed, setFixed] = useState("");
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setRaw(text);
    process(text);
  }

  function process(source?: string) {
    setError("");
    const content = source ?? raw;
    if (!content.trim()) {
      setError("SRT текст оруулна уу.");
      return;
    }
    try {
      const { srt, cues: parsed } = fixSrt(content, { spacing });
      setCues(parsed);
      setFixed(srt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Боловсруулахад алдаа гарлаа.");
    }
  }

  function download() {
    if (!fixed) return;
    const blob = new Blob([fixed], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileName || "subtitles").replace(/\.srt$/i, "") + "_fixed.srt";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copy() {
    if (!fixed) return;
    await navigator.clipboard.writeText(fixed);
  }

  return (
    <div className="bg-white rounded-3xl p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-5 rounded-2xl transition-all cursor-pointer">
          📁 Choose .srt
          <input type="file" accept=".srt,.txt" onChange={onFile} className="hidden" />
        </label>
        {fileName && <span className="text-sm text-gray-500 font-medium">{fileName}</span>}

        <label className="ml-auto flex items-center gap-2 text-sm font-bold text-gray-700 select-none">
          <input
            type="checkbox"
            checked={spacing}
            onChange={(e) => setSpacing(e.target.checked)}
            className="w-4 h-4 accent-purple-500"
          />
          分かち書き (add spaces)
        </label>
      </div>

      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="…эсвэл SRT-г энд буулгана уу"
        className="w-full h-40 rounded-2xl border border-gray-200 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => process()}
          className="bg-gray-800 hover:bg-black text-white font-bold py-2 px-5 rounded-2xl transition-all"
        >
          ✨ Fix spacing
        </button>
        {fixed && (
          <>
            <button
              onClick={download}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-2xl transition-all"
            >
              ⬇️ Download .srt
            </button>
            <button
              onClick={copy}
              className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-2 px-5 rounded-2xl transition-all"
            >
              📋 Copy
            </button>
            <span className="text-sm text-gray-500 font-bold ml-auto">
              {cues.length} cues
            </span>
          </>
        )}
      </div>

      {error && (
        <p className="text-red-500 font-bold text-sm">⚠️ {error}</p>
      )}

      {/* Preview: first 10 cues, before → after */}
      {cues.length > 0 && (
        <div className="rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[3rem_1fr] bg-gray-50 text-xs font-black text-gray-400 uppercase tracking-wide">
            <div className="p-3">#</div>
            <div className="p-3">Text</div>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-auto">
            {cues.slice(0, 10).map((c, i) => (
              <div key={i} className="grid grid-cols-[3rem_1fr]">
                <div className="p-3 text-gray-300 font-mono text-sm">{i + 1}</div>
                <div className="p-3 text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {c.text}
                </div>
              </div>
            ))}
          </div>
          {cues.length > 10 && (
            <div className="p-3 text-center text-xs text-gray-400 font-bold bg-gray-50">
              … +{cues.length - 10} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}
