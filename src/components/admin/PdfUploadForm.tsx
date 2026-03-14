"use client";

import { useState, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { BOOK_LEVELS } from "@/constants/levels";
import { BookLevel } from "@/types";

export default function PdfUploadForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    titleJapanese: "",
    level: "beginner" as BookLevel,
    description: "",
  });

  const MAX_MB = 20;

  const validateAndSetFile = (f: File | undefined | null) => {
    if (!f) return;
    if (f.type !== "application/pdf") { setError("Please select a PDF file"); return; }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_MB} MB.`);
      return;
    }
    setError("");
    setFile(f);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please select a PDF file"); return; }
    if (!form.title || !form.level) { setError("Title and level are required"); return; }

    setUploading(true);
    setError("");

    // Animated progress steps
    const steps = [
      "📤 Uploading PDF to storage...",
      "📄 Extracting text from PDF...",
      "🔗 Matching words with dictionary...",
      "💾 Saving to database...",
    ];
    let stepIdx = 0;
    setProgress(steps[0]);
    const stepTimer = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, steps.length - 1);
      setProgress(steps[stepIdx]);
    }, 8000); // advance step every 8s

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", form.title);
      fd.append("titleJapanese", form.titleJapanese);
      fd.append("level", form.level);
      fd.append("description", form.description);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      clearInterval(stepTimer);
      setProgress(`✅ Done! ${data.totalPages} pages extracted.`);
      setTimeout(() => router.push("/admin/books"), 1500);
    } catch (err: unknown) {
      clearInterval(stepTimer);
      setProgress("");
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* PDF Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-4 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
          dragging ? "border-pink-400 bg-pink-50" : "border-gray-200 hover:border-pink-300 hover:bg-pink-50"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => validateAndSetFile(e.target.files?.[0])}
        />
        {file ? (
          <div>
            <div className="text-5xl mb-2">📄</div>
            <p className="text-lg font-bold text-green-600">{file.name}</p>
            <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div>
            <div className="text-6xl mb-3">📁</div>
            <p className="text-xl font-bold text-gray-500">Drag & drop PDF here</p>
            <p className="text-sm text-gray-400 mt-1">or click to browse</p>
            <p className="text-xs text-gray-300 mt-2">Max {MAX_MB} MB · PDF only</p>
          </div>
        )}
      </div>

      {/* Form fields */}
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">Book Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Hiragana Practice Book"
            required
            className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-lg focus:border-pink-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">Japanese Title</label>
          <input
            type="text"
            value={form.titleJapanese}
            onChange={(e) => setForm({ ...form, titleJapanese: e.target.value })}
            placeholder="e.g. ひらがな練習帳"
            className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-2xl focus:border-pink-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">Level *</label>
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value as BookLevel })}
            className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-lg focus:border-pink-400 focus:outline-none bg-white"
          >
            {BOOK_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief description of this book..."
            rows={3}
            className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:border-pink-400 focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Progress */}
      {progress && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-600 font-medium animate-pulse">
          {progress}
        </div>
      )}

      <Button type="submit" size="lg" disabled={uploading} className="w-full">
        {uploading ? "⏳ Uploading..." : "📤 Upload Book"}
      </Button>
    </form>
  );
}
