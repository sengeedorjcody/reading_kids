"use client";

import { useState, useEffect } from "react";
import { IYoutubeVideo, TranscriptLine } from "@/lib/db/models/YoutubeVideo";

function extractYoutubeId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return trimmed;
}

function timecodeToSeconds(hh: string, mm: string, ss: string, ms: string) {
  return parseInt(hh) * 3600 + parseInt(mm) * 60 + parseInt(ss) + parseInt(ms) / 1000;
}

// Parses standard .srt subtitle format into { start, text } transcript lines.
function parseSRT(content: string): TranscriptLine[] {
  const blocks = content.replace(/\r/g, "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const lines: TranscriptLine[] = [];

  for (const block of blocks) {
    const blockLines = block.split("\n");
    const startIdx = /^\d+$/.test(blockLines[0]?.trim()) ? 1 : 0;
    const timeLine = blockLines[startIdx] ?? "";
    const match = timeLine.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->/);
    if (!match) continue;
    const [, hh, mm, ss, ms] = match;
    const start = timecodeToSeconds(hh, mm, ss, ms);
    const text = blockLines.slice(startIdx + 1).join(" ").replace(/\s+/g, " ").trim();
    if (text) lines.push({ start, text });
  }
  return lines;
}

function mmss(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

const EMPTY_FORM = {
  title: "",
  youtubeUrl: "",
  order: 0,
};

export default function AdminYoutubePage() {
  const [videos, setVideos] = useState<IYoutubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [srtFileName, setSrtFileName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchVideos = async () => {
    const res = await fetch("/api/youtube?all=true");
    setVideos(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleSrtFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSrtFileName(file.name);
    const text = await file.text();
    const parsed = parseSRT(text);
    if (parsed.length === 0) {
      setError("SRT файлыг уншиж чадсангүй — формат шалгана уу");
      return;
    }
    setError("");
    setTranscript(parsed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.length === 0) {
      setError("SRT файл сонгоно уу");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const youtubeId = extractYoutubeId(form.youtubeUrl);
      const durationSeconds = Math.round(transcript[transcript.length - 1]?.start ?? 0);

      const body = { title: form.title, youtubeId, durationSeconds, transcript, order: form.order };
      const url = editing ? `/api/youtube/${editing}` : "/api/youtube";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed");
      setForm(EMPTY_FORM);
      setTranscript([]);
      setSrtFileName("");
      setEditing(null);
      await fetchVideos();
    } catch {
      setError("Хадгалахад алдаа гарлаа");
    }
    setSaving(false);
  };

  const handleEdit = (v: IYoutubeVideo) => {
    setEditing(v._id);
    setForm({ title: v.title, youtubeUrl: v.youtubeId, order: v.order });
    setTranscript(v.transcript);
    setSrtFileName(`(одоо байгаа ${v.transcript.length} мөр — солихыг хүсвэл шинэ .srt сонгоно уу)`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Устгах уу?")) return;
    await fetch(`/api/youtube/${id}`, { method: "DELETE" });
    fetchVideos();
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-800">📺 YouTube</h1>
        <a href="/youtube" target="_blank" className="text-sm text-blue-600 hover:underline font-bold">
          View →
        </a>
      </div>

      {/* Form */}
      <div className="bg-white rounded-3xl shadow-sm p-6">
        <h2 className="text-lg font-black text-gray-700 mb-4">
          {editing ? "✏️ Засах" : "➕ Шинэ видео нэмэх"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Гарчиг *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="自己紹介 podcast 1"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">YouTube URL эсвэл video ID *</label>
            <input
              required
              value={form.youtubeUrl}
              onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=OlZx_o60qAs"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Subtitle .srt файл *</label>
              <input
                type="file"
                accept=".srt"
                onChange={handleSrtFile}
                className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Дараалал</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          {srtFileName && (
            <p className="text-[11px] text-gray-500">
              📄 {srtFileName} {transcript.length > 0 && `— ${transcript.length} мөр, нийт урт ${mmss(transcript[transcript.length - 1].start)}`}
            </p>
          )}

          {error && <p className="text-sm text-red-500 font-bold">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 text-white font-black py-2.5 px-6 rounded-2xl transition-all disabled:opacity-50"
            >
              {saving ? "Хадгалж байна..." : editing ? "✅ Хадгалах" : "➕ Нэмэх"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => { setEditing(null); setForm(EMPTY_FORM); setTranscript([]); setSrtFileName(""); }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-2.5 px-6 rounded-2xl transition-all"
              >
                Цуцлах
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-700">Видеонуудын жагсаалт ({videos.length})</h2>
        </div>
        {loading && <p className="text-center py-8 text-gray-400">Loading…</p>}
        {!loading && videos.length === 0 && (
          <p className="text-center py-8 text-gray-400">Видео байхгүй байна</p>
        )}
        {videos.map((v, i) => (
          <div
            key={v._id}
            className={`flex items-center gap-4 px-6 py-4 ${i !== videos.length - 1 ? "border-b border-gray-100" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${v.youtubeId}/default.jpg`}
              alt={v.title}
              className="w-20 h-14 rounded-xl object-cover flex-shrink-0 bg-gray-100"
            />
            <div className="flex-1 min-w-0">
              <div className="font-black text-gray-800 truncate">{v.title}</div>
              <div className="text-xs text-gray-400 font-mono">{v.youtubeId} · {mmss(v.durationSeconds)} · {v.transcript.length} мөр</div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => handleEdit(v)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
              >
                ✏️ Засах
              </button>
              <button
                onClick={() => handleDelete(v._id)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
