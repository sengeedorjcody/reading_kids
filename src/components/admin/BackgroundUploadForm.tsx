"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function BackgroundUploadForm() {
  const [name, setName] = useState("");
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setUrlInput("");
    if (!name) setName(f.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "));
    setError("");
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    setPreview(val);
    setFile(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !urlInput.trim()) { setError("Please select an image or enter a URL."); return; }
    if (!name.trim()) { setError("Name is required."); return; }

    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      if (file) fd.append("file", file);
      if (urlInput.trim()) fd.append("imageUrl", urlInput.trim());
      fd.append("name", name.trim());
      const res = await fetch("/api/backgrounds", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setName("");
      setPreview("");
      setFile(null);
      setUrlInput("");
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

      {/* Preview / file drop zone */}
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

      {/* URL input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-bold">or paste URL</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <input
        type="url"
        value={urlInput}
        onChange={handleUrlChange}
        placeholder="https://example.com/image.jpg"
        className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-2xl px-4 py-3 text-sm text-gray-700 outline-none transition-colors"
      />

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
          disabled={uploading || (!file && !urlInput.trim())}
          className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black py-3 rounded-2xl transition-colors"
        >
          {uploading ? "Saving…" : "🌅 Save Background"}
        </button>
      </form>
    </div>
  );
}
