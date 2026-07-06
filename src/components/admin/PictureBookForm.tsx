"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookLevel } from "@/types";

interface Background {
  _id: string;
  name: string;
  imageUrl: string;
}

const LEVELS: BookLevel[] = ["hiragana", "katakana", "beginner", "intermediate", "advanced", "N5", "N4", "N3"];

export default function PictureBookForm() {
  const [title, setTitle] = useState("");
  const [titleJapanese, setTitleJapanese] = useState("");
  const [level, setLevel] = useState<BookLevel>("beginner");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/backgrounds")
      .then((r) => r.json())
      .then((d) => setBackgrounds(d.backgrounds ?? []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/picture-books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          titleJapanese: titleJapanese.trim(),
          level,
          description: description.trim(),
          coverImageUrl: coverImageUrl.trim(),
          isPublished,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      router.push(`/admin/picture-books/${data.pictureBook._id}`);
    } catch {
      setError("Failed to create picture book.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
      {/* Cover preview */}
      <div className="w-full h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center border-2 border-gray-100">
        {coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImageUrl} alt="cover preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-1">🖼️</div>
            <p className="text-sm font-bold">Cover preview</p>
          </div>
        )}
      </div>

      {/* Cover picker */}
      <div>
        <label className="block text-sm font-bold text-gray-600 mb-2">Cover image</label>
        {backgrounds.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {backgrounds.map((bg) => (
              <button
                key={bg._id}
                type="button"
                onClick={() => setCoverImageUrl(bg.imageUrl)}
                className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                  coverImageUrl === bg.imageUrl
                    ? "border-amber-500 ring-2 ring-amber-300"
                    : "border-gray-200 hover:border-amber-300"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bg.imageUrl} alt={bg.name} className="w-full h-full object-cover" />
                {coverImageUrl === bg.imageUrl && (
                  <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                    <span className="text-white text-lg">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        <input
          type="text"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="Or paste image URL…"
          className="w-full border-2 border-gray-200 focus:border-amber-400 rounded-2xl px-4 py-2 text-sm text-gray-700 outline-none transition-colors"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1.5">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. こぐまくん の おさんぽ"
            className="w-full border-2 border-gray-200 focus:border-amber-400 rounded-2xl px-4 py-3 text-gray-700 font-bold outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1.5">Japanese title</label>
          <input
            type="text"
            value={titleJapanese}
            onChange={(e) => setTitleJapanese(e.target.value)}
            placeholder="こぐまくんのおさんぽ"
            className="w-full border-2 border-gray-200 focus:border-amber-400 rounded-2xl px-4 py-3 text-gray-700 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2">Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as BookLevel)}
            className="w-full border-2 border-gray-200 focus:border-amber-400 rounded-2xl px-4 py-3 text-gray-700 font-bold outline-none transition-colors"
          >
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Short description…"
            className="w-full border-2 border-gray-200 focus:border-amber-400 rounded-2xl px-4 py-3 text-gray-700 outline-none transition-colors resize-none"
          />
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
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 text-white font-black py-3 rounded-2xl text-lg transition-colors"
        >
          {loading ? "Creating…" : "🖼️ Create Picture Book"}
        </button>
      </form>
    </div>
  );
}
