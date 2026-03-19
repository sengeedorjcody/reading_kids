"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConversationForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [displayMode, setDisplayMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), backgroundImageUrl: backgroundImageUrl.trim(), displayMode, isPublished }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      router.push(`/admin/conversations/${data.conversation._id}`);
    } catch {
      setError("Failed to create conversation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
      {/* Background preview */}
      <div className="w-full h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-2 border-gray-100">
        {backgroundImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={backgroundImageUrl} alt="background preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-1">🖼️</div>
            <p className="text-sm font-bold">Background preview</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1.5">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. はじめまして！"
            className="w-full border-2 border-gray-200 focus:border-rose-400 rounded-2xl px-4 py-3 text-gray-700 font-bold outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Short description…"
            className="w-full border-2 border-gray-200 focus:border-rose-400 rounded-2xl px-4 py-3 text-gray-700 outline-none transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1.5">Background Image URL</label>
          <input
            type="url"
            value={backgroundImageUrl}
            onChange={(e) => setBackgroundImageUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
            className="w-full border-2 border-gray-200 focus:border-rose-400 rounded-2xl px-4 py-3 text-gray-700 outline-none transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1">One background image used for the whole conversation</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2">Display Mode</label>
          <div className="flex gap-3">
            {(['mobile', 'desktop'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDisplayMode(mode)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                  displayMode === mode
                    ? "border-rose-400 bg-rose-50 text-rose-600"
                    : "border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
              >
                <span className="text-2xl">{mode === 'mobile' ? '📱' : '🖥️'}</span>
                {mode === 'mobile' ? 'Mobile' : 'Desktop'}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setIsPublished(!isPublished)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isPublished ? "bg-green-500" : "bg-gray-200"}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublished ? "translate-x-7" : "translate-x-1"}`} />
          </div>
          <span className="font-bold text-gray-600 text-sm">Published</span>
        </label>

        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-gray-200 text-white font-black py-3 rounded-2xl text-lg transition-colors"
        >
          {loading ? "Creating…" : "💬 Create Conversation"}
        </button>
      </form>
    </div>
  );
}
