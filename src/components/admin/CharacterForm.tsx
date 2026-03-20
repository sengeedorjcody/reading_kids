"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CharacterForm() {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // local preview
    setPreview(URL.createObjectURL(file));
    setImageUrl("");
    setError("");
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreview("");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !imageUrl.trim()) {
      setError("Name and image are required.");
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

  const displayImage = preview || imageUrl;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
      {/* Preview */}
      <div className="flex justify-center">
        <div
          onClick={() => fileRef.current?.click()}
          className="w-32 h-32 rounded-3xl bg-gradient-to-br from-pink-50 to-purple-100 border-2 border-dashed border-pink-300 overflow-hidden flex items-center justify-center cursor-pointer hover:border-pink-500 transition-colors relative group"
        >
          {displayImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayImage} alt="preview" className="w-full h-full object-contain" />
          ) : (
            <span className="text-5xl">🎭</span>
          )}
          <div className="absolute inset-0 bg-black/30 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="text-white text-xs font-bold">Change</span>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-white/70 rounded-3xl flex items-center justify-center">
              <span className="text-sm font-bold text-pink-500">Uploading…</span>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload button */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full border-2 border-dashed border-pink-200 hover:border-pink-400 text-pink-500 font-bold py-3 rounded-2xl text-sm transition-colors disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "📁 Upload image from computer"}
      </button>

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

        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

        <button
          type="submit"
          disabled={loading || uploading || !imageUrl}
          className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black py-3 rounded-2xl text-lg transition-colors"
        >
          {loading ? "Creating…" : "🎭 Create Character"}
        </button>
      </form>
    </div>
  );
}
