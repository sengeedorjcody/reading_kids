"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { IDictionaryWord } from "@/types";

interface WordFormProps {
  initial?: Partial<IDictionaryWord>;
  wordId?: string;
}

export default function WordForm({ initial, wordId }: WordFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imgUploading, setImgUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    japanese_word: initial?.japanese_word ?? "",
    hiragana: initial?.hiragana ?? "",
    romaji: initial?.romaji ?? "",
    english_meaning: initial?.english_meaning ?? "",
    mongolian_meaning: initial?.mongolian_meaning ?? "",
    example_sentence: initial?.example_sentence ?? "",
    example_sentence_reading: initial?.example_sentence_reading ?? "",
    jlpt_level: initial?.jlpt_level ?? "",
    part_of_speech: initial?.part_of_speech ?? "",
    example_image_url: initial?.example_image_url ?? "",
    pronunciation_audio_url: initial?.pronunciation_audio_url ?? "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((f) => ({ ...f, example_image_url: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setImgUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.japanese_word) { setError("Japanese word is required"); return; }

    setSaving(true);
    setError("");

    try {
      const url = wordId ? `/api/dictionary/${wordId}` : "/api/dictionary";
      const method = wordId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.push("/admin/dictionary");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: "japanese_word", label: "Japanese Word *", placeholder: "ねこ", className: "text-3xl" },
    { name: "hiragana", label: "Hiragana", placeholder: "ねこ", className: "text-2xl" },
    { name: "romaji", label: "Romaji", placeholder: "neko" },
    { name: "english_meaning", label: "English Meaning", placeholder: "cat" },
    { name: "mongolian_meaning", label: "Mongolian Meaning", placeholder: "муур" },
    { name: "example_sentence", label: "Example Sentence", placeholder: "ねこ が います。" },
    { name: "example_sentence_reading", label: "Example Sentence Reading", placeholder: "neko ga imasu." },
    { name: "pronunciation_audio_url", label: "Audio URL (Cloudinary)", placeholder: "https://res.cloudinary.com/..." },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-bold text-gray-600 mb-1">{field.label}</label>
          <input
            type="text"
            name={field.name}
            value={form[field.name]}
            onChange={handleChange}
            placeholder={field.placeholder}
            className={`w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-pink-400 focus:outline-none ${"className" in field ? field.className : "text-base"}`}
          />
        </div>
      ))}

      {/* ── Example image ── */}
      <div>
        <label className="block text-sm font-bold text-gray-600 mb-2">Example Image</label>
        <div className="flex gap-3 items-start">
          {/* Preview */}
          <div className="w-20 h-20 shrink-0 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
            {form.example_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.example_image_url} alt="preview" className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-2xl">🖼️</span>
            )}
          </div>
          <div className="flex-1 space-y-2">
            {/* Upload button */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={imgUploading}
              className="w-full border-2 border-dashed border-pink-200 hover:border-pink-400 text-pink-500 font-bold py-2 rounded-2xl text-sm transition-colors disabled:opacity-50"
            >
              {imgUploading ? "Uploading…" : "📁 Upload from computer"}
            </button>
            {/* URL input */}
            <input
              type="text"
              name="example_image_url"
              value={form.example_image_url}
              onChange={handleChange}
              placeholder="Or paste image URL…"
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-2 text-sm focus:border-pink-400 focus:outline-none"
            />
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageFile} />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-600 mb-1">JLPT Level</label>
        <select
          name="jlpt_level"
          value={form.jlpt_level}
          onChange={handleChange}
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 bg-white focus:border-pink-400 focus:outline-none"
        >
          <option value="">-- Select level --</option>
          {["N5", "N4", "N3", "N2", "N1"].map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 font-medium">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "⏳ Saving..." : wordId ? "💾 Update Word" : "➕ Add Word"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
