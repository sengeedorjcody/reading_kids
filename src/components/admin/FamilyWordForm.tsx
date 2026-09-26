"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IFamilyTalkWord } from "@/types";
import { deleteFamilyWord } from "@/app/admin/family-talk/actions";

interface FamilyWordFormProps {
  topicId: string;
  word: IFamilyTalkWord;
}

export default function FamilyWordForm({ topicId, word }: FamilyWordFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    imageUrl: word.imageUrl ?? "",
    japanese: word.japanese ?? "",
    romaji: word.romaji ?? "",
    english_meaning: word.english_meaning ?? "",
    mongolian_meaning: word.mongolian_meaning ?? "",
    audioUrl: word.audioUrl ?? "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveForm = async (next: typeof form) => {
    const res = await fetch(`/api/family-talk/topics/${topicId}/words/${word._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Save failed");
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
      const nextForm = { ...form, imageUrl: data.url };
      setForm(nextForm);
      // Persist immediately — a separate "Save Word" click after an
      // upload is an easy step to miss (see Sentences' SentenceForm).
      await saveForm(nextForm);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setImgUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.japanese) {
      setError("Japanese word is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveForm(form);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${word.japanese}"?`)) return;
    setDeleting(true);
    await deleteFamilyWord(topicId, word._id);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 space-y-4 border-2 border-gray-100">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Word</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-400 hover:text-red-600 font-bold text-sm disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "🗑️ Delete"}
        </button>
      </div>

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
        <label className="block text-sm font-bold text-gray-600 mb-1">Japanese Word *</label>
        <input
          type="text"
          name="japanese"
          value={form.japanese}
          onChange={handleChange}
          placeholder="ねこ"
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-2xl focus:border-pink-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-600 mb-1">Romaji</label>
        <input
          type="text"
          name="romaji"
          value={form.romaji}
          onChange={handleChange}
          placeholder="neko"
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:border-pink-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-600 mb-1">English Meaning</label>
        <input
          type="text"
          name="english_meaning"
          value={form.english_meaning}
          onChange={handleChange}
          placeholder="cat"
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:border-pink-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-600 mb-1">Mongolian Meaning</label>
        <input
          type="text"
          name="mongolian_meaning"
          value={form.mongolian_meaning}
          onChange={handleChange}
          placeholder="муур"
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:border-pink-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-600 mb-1">Audio URL (optional)</label>
        <input
          type="text"
          name="audioUrl"
          value={form.audioUrl}
          onChange={handleChange}
          placeholder="Leave blank to use text-to-speech"
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-2 text-sm focus:border-pink-400 focus:outline-none"
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
        {saving ? "⏳ Saving..." : "💾 Save Word"}
      </button>
    </div>
  );
}
