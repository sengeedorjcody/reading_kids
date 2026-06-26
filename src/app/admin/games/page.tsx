"use client";

import { useState, useEffect } from "react";
import { IGame } from "@/lib/db/models/Game";

const COLOR_OPTIONS = [
  { label: "Green",  color: "#22c55e", bg: "from-green-400 to-emerald-600" },
  { label: "Blue",   color: "#3b82f6", bg: "from-blue-400 to-indigo-600" },
  { label: "Purple", color: "#8b5cf6", bg: "from-purple-400 to-violet-600" },
  { label: "Red",    color: "#ef4444", bg: "from-red-400 to-rose-600" },
  { label: "Orange", color: "#f97316", bg: "from-orange-400 to-amber-600" },
  { label: "Yellow", color: "#f59e0b", bg: "from-yellow-400 to-orange-500" },
  { label: "Teal",   color: "#14b8a6", bg: "from-teal-400 to-cyan-600" },
  { label: "Pink",   color: "#ec4899", bg: "from-pink-400 to-fuchsia-600" },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  emoji: "🎮",
  iframeSrc: "",
  tags: "",
  color: "#22c55e",
  bg: "from-green-400 to-emerald-600",
  order: 0,
};

export default function AdminGamesPage() {
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchGames = async () => {
    const res = await fetch("/api/games");
    const data = await res.json();
    setGames(data);
    setLoading(false);
  };

  useEffect(() => { fetchGames(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      const url  = editing ? `/api/games/${editing}` : "/api/games";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed");
      setForm(EMPTY_FORM);
      setEditing(null);
      await fetchGames();
    } catch {
      setError("Хадгалахад алдаа гарлаа");
    }
    setSaving(false);
  };

  const handleEdit = (game: IGame) => {
    setEditing(game._id);
    setForm({
      title: game.title,
      description: game.description,
      emoji: game.emoji,
      iframeSrc: game.iframeSrc,
      tags: (game.tags || []).join(", "),
      color: game.color,
      bg: game.bg,
      order: game.order,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Устгах уу?")) return;
    await fetch(`/api/games/${id}`, { method: "DELETE" });
    fetchGames();
  };

  const setColor = (opt: (typeof COLOR_OPTIONS)[0]) => {
    setForm((f) => ({ ...f, color: opt.color, bg: opt.bg }));
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-800">🎮 Games</h1>
        <a href="/games" target="_blank" className="text-sm text-blue-600 hover:underline font-bold">
          View →
        </a>
      </div>

      {/* Form */}
      <div className="bg-white rounded-3xl shadow-sm p-6">
        <h2 className="text-lg font-black text-gray-700 mb-4">
          {editing ? "✏️ Засах" : "➕ Шинэ тоглоом нэмэх"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Тоглоомын нэр *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Tank Nostalgica"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Emoji</label>
              <input
                value={form.emoji}
                onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                placeholder="🎮"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">iframe src URL *</label>
            <input
              required
              type="url"
              value={form.iframeSrc}
              onChange={(e) => setForm((f) => ({ ...f, iframeSrc: e.target.value }))}
              placeholder="https://xxxx.higgsfield.gg/"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Тайлбар</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Тоглоомын товч тайлбар..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Tags (таслалаар)</label>
              <input
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="Arcade, Action, Retro"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Дараалал (order)</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Өнгө</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setColor(opt)}
                  className={`w-8 h-8 rounded-full border-4 transition-all ${form.color === opt.color ? "border-gray-800 scale-110" : "border-transparent"}`}
                  style={{ background: opt.color }}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

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
                onClick={() => { setEditing(null); setForm(EMPTY_FORM); }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-2.5 px-6 rounded-2xl transition-all"
              >
                Цуцлах
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Games list */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-700">Тоглоомуудын жагсаалт ({games.length})</h2>
        </div>
        {loading && <p className="text-center py-8 text-gray-400">Loading…</p>}
        {!loading && games.length === 0 && (
          <p className="text-center py-8 text-gray-400">Тоглоом байхгүй байна</p>
        )}
        {games.map((game, i) => (
          <div
            key={game._id}
            className={`flex items-center gap-4 px-6 py-4 ${i !== games.length - 1 ? "border-b border-gray-100" : ""}`}
          >
            {/* Color swatch + emoji */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 bg-gradient-to-br ${game.bg}`}
            >
              {game.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-black text-gray-800 truncate">{game.title}</div>
              <div className="text-xs text-gray-400 truncate font-mono">{game.iframeSrc}</div>
              {game.tags?.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {game.tags.map((t) => (
                    <span key={t} className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => handleEdit(game)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
              >
                ✏️ Засах
              </button>
              <button
                onClick={() => handleDelete(game._id)}
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
