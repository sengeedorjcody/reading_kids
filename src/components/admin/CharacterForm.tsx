"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CharacterForm() {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !imageUrl.trim()) {
      setError("Name and image URL are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), imageUrl: imageUrl.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      router.push("/admin/characters");
      router.refresh();
    } catch {
      setError("Failed to create character.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
      {/* Preview */}
      <div className="flex justify-center">
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-pink-50 to-purple-100 border-2 border-pink-200 overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="preview" className="w-full h-full object-contain" />
          ) : (
            <span className="text-5xl">🎭</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1.5">Character Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. さくら"
            className="w-full border-2 border-gray-200 focus:border-pink-400 rounded-2xl px-4 py-3 text-gray-700 font-bold outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1.5">Image URL *</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
            className="w-full border-2 border-gray-200 focus:border-pink-400 rounded-2xl px-4 py-3 text-gray-700 font-medium outline-none transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1">Paste a Cloudinary or public image URL (PNG with transparent background recommended)</p>
        </div>

        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-200 text-white font-black py-3 rounded-2xl text-lg transition-colors"
        >
          {loading ? "Creating…" : "🎭 Create Character"}
        </button>
      </form>
    </div>
  );
}
