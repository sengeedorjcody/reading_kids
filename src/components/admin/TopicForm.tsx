"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { ITopic } from "@/types";

interface TopicFormProps {
  initial?: Partial<ITopic>;
  topicId?: string;
}

export default function TopicForm({ initial, topicId }: TopicFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    titleJapanese: initial?.titleJapanese ?? "",
    description: initial?.description ?? "",
    order: initial?.order ?? 0,
    isPublished: initial?.isPublished ?? false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "order" ? Number(value) : value }));
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
      const url = topicId ? `/api/topics/${topicId}` : "/api/topics";
      const method = topicId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      const savedId = topicId ?? data.topic._id;
      router.push(`/admin/sentences/${savedId}`);
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
          placeholder="Сэдэв нэр (e.g. Гэр бүл)"
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
