"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { IFamilyTalkTopic } from "@/types";

interface FamilyTopicFormProps {
  initial?: Partial<IFamilyTalkTopic>;
  topicId?: string;
}

export default function FamilyTopicForm({ initial, topicId }: FamilyTopicFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imgUploading, setImgUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    titleJapanese: initial?.titleJapanese ?? "",
    description: initial?.description ?? "",
    coverImageUrl: initial?.coverImageUrl ?? "",
    order: initial?.order ?? 0,
    isPublished: initial?.isPublished ?? false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "order" ? Number(value) : value }));
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
      setForm((f) => ({ ...f, coverImageUrl: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setImgUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = topicId ? `/api/family-talk/topics/${topicId}` : "/api/family-talk/topics";
      const method = topicId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      const savedId = topicId ?? data.topic._id;
      router.push(`/admin/family-talk/${savedId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="flex gap-3 pb-2 border-b border-gray-100">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "⏳ Saving..." : topicId ? "💾 Update Topic" : "➕ Create Topic"}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-600 mb-1">Title *</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Family"
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:border-pink-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-600 mb-1">Japanese Title</label>
        <input
          type="text"
          name="titleJapanese"
          value={form.titleJapanese}
          onChange={handleChange}
          placeholder="かぞく"
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-2xl focus:border-pink-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-600 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={2}
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:border-pink-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-600 mb-2">Cover Image</label>
        <div className="flex gap-3 items-start">
          <div className="w-20 h-20 shrink-0 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
            {form.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.coverImageUrl} alt="preview" className="w-full h-full object-cover" />
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
              name="coverImageUrl"
              value={form.coverImageUrl}
              onChange={handleChange}
              placeholder="Or paste image URL…"
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-2 text-sm focus:border-pink-400 focus:outline-none"
            />
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageFile} />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-600 mb-1">Sort Order</label>
        <input
          type="number"
          name="order"
          value={form.order}
          onChange={handleChange}
          className="w-32 border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:border-pink-400 focus:outline-none"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer w-fit">
        <div
          onClick={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}
          className={`relative w-10 h-5 rounded-full transition-colors ${form.isPublished ? "bg-green-500" : "bg-gray-200"}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPublished ? "translate-x-5" : "translate-x-0.5"}`} />
        </div>
        <span className="text-sm font-bold text-gray-600">Published</span>
      </label>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 font-medium">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "⏳ Saving..." : topicId ? "💾 Update Topic" : "➕ Create Topic"}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
