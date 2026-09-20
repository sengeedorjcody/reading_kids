"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ITopicSentence } from "@/types";
import { deleteSentence } from "@/app/admin/sentences/actions";

interface SentenceFormProps {
  topicId: string;
  sentence: ITopicSentence;
}

export default function SentenceForm({ topicId, sentence }: SentenceFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    imageUrl: sentence.imageUrl ?? "",
    imagePrompt: sentence.imagePrompt ?? "",
    japanese: sentence.japanese ?? "",
    romaji: sentence.romaji ?? "",
    english_meaning: sentence.english_meaning ?? "",
    mongolian_meaning: sentence.mongolian_meaning ?? "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setImgUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.japanese) {
      setError("Japanese sentence is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/topics/${topicId}/sentences/${sentence._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete sentence #${sentence.order}?`)) return;
    setDeleting(true);
    await deleteSentence(topicId, sentence._id);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 space-y-4 border-2 border-gray-100">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-gray-400">
          Sentence #{sentence.order}
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-400 hover:text-red-600 font-bold text-sm disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "🗑️ Delete"}
        </button>
      </div>

      {/* Image */}
      <div className="flex gap-3 items-start">
        <div className="w-20 h-20 shrink-0 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
          {form.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.imageUrl} alt="preview" className="w-full h-full object-contain p-1" />
          ) : (
            <span className="text-2xl">🖼️</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={imgUploading}
            className="w-full border-2 border-dashed border-pink-200 hover:border-pink-400 text-pink-500 font-bold py-2 rounded-2xl text-sm transition-colors disabled:opacity-50"
          >
            {imgUploading ? "Uploading…" : "📁 Upload from computer"}
          </button>
          <input
            type="text"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="Or paste image URL…"
            className="w-full border-2 border-gray-200 rounded-2xl px-4 py-2 text-sm focus:border-pink-400 focus:outline-none"
          />
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageFile} />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-600 mb-1">Image Prompt</label>
        <textarea
          name="imagePrompt"
          value={form.imagePrompt}
          onChange={handleChange}
          rows={2}
          placeholder="Prompt used to generate the image (e.g. for Midjourney/DALL-E)…"
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-2 text-sm focus:border-pink-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-600 mb-1">Japanese Sentence *</label>
        <textarea
          name="japanese"
          value={form.japanese}
          onChange={handleChange}
          rows={2}
          placeholder="ねこ が すき です。"
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-xl focus:border-pink-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-600 mb-1">Romaji</label>
        <input
          type="text"
          name="romaji"
          value={form.romaji}
          onChange={handleChange}
          placeholder="neko ga suki desu."
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:border-pink-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-600 mb-1">English Translation</label>
        <input
          type="text"
          name="english_meaning"
          value={form.english_meaning}
          onChange={handleChange}
          placeholder="I like cats."
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:border-pink-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-600 mb-1">Mongolian Translation</label>
        <input
          type="text"
          name="mongolian_meaning"
          value={form.mongolian_meaning}
          onChange={handleChange}
          placeholder="Би муур дуртай."
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:border-pink-400 focus:outline-none"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-600 font-medium text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-black py-2.5 rounded-2xl text-sm transition-colors"
      >
        {saving ? "⏳ Saving..." : "💾 Save Sentence"}
      </button>
    </div>
  );
}
