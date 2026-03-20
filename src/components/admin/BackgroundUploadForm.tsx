"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function BackgroundUploadForm() {
  const [name, setName] = useState("");
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    if (!name) setName(f.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please select an image."); return; }
    if (!name.trim()) { setError("Name is required."); return; }

    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", name.trim());
      const res = await fetch("/api/backgrounds", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setName("");
      setPreview("");
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4 max-w-md">
      <h2 className="text-lg font-black text-gray-700">➕ Add Background</h2>

      {/* Preview */}
      <div
        onClick={() => fileRef.current?.click()}
        className="w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-200 hover:border-purple-400 flex items-center justify-center cursor-pointer transition-colors"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-1">🌄</div>
            <p className="text-sm font-bold">Click to choose image</p>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} />

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Background name…"
          className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-2xl px-4 py-3 font-bold text-gray-700 outline-none transition-colors"
        />
        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black py-3 rounded-2xl transition-colors"
        >
          {uploading ? "Uploading…" : "🌅 Save Background"}
        </button>
      </form>
    </div>
  );
}
