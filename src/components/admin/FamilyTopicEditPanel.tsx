"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IFamilyTalkTopic } from "@/types";

export default function FamilyTopicEditPanel({ topic }: { topic: IFamilyTalkTopic }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(topic.title);
  const [titleJapanese, setTitleJapanese] = useState(topic.titleJapanese ?? "");
  const [description, setDescription] = useState(topic.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(topic.coverImageUrl ?? "");
  const [isPublished, setIsPublished] = useState(topic.isPublished);
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/family-talk/topics/${topic._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, titleJapanese, description, coverImageUrl, isPublished }),
    });
    setSaving(false);
    setOpen(false);
    router.refresh();
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/image", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setCoverImageUrl(data.url);
        // Persist immediately — matches the sentence/word forms, so an
        // upload isn't lost if the admin closes the panel without
        // clicking Save separately.
        await fetch(`/api/family-talk/topics/${topic._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coverImageUrl: data.url }),
        });
        router.refresh();
      }
    } finally {
      setImgUploading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-4 py-2 rounded-xl text-sm transition-colors"
      >
        ✏️ Edit Settings
      </button>

      {open && (
        <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-rose-400 rounded-xl px-3 py-2 text-gray-700 font-bold outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Japanese Title</label>
            <input
              type="text"
              value={titleJapanese}
              onChange={(e) => setTitleJapanese(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-rose-400 rounded-xl px-3 py-2 text-gray-700 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border-2 border-gray-200 focus:border-rose-400 rounded-xl px-3 py-2 text-gray-700 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Cover Image</label>
            <div className="flex gap-3 items-start">
              <div className="w-16 h-16 shrink-0 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                {coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImageUrl} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">🖼️</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={imgUploading}
                  className="w-full border-2 border-dashed border-pink-200 hover:border-pink-400 text-pink-500 font-bold py-1.5 rounded-xl text-xs transition-colors disabled:opacity-50"
                >
                  {imgUploading ? "Uploading…" : "📁 Upload from computer"}
                </button>
                <input
                  type="text"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="Or paste image URL…"
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:border-pink-400 focus:outline-none"
                />
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageFile} />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setIsPublished(!isPublished)}
              className={`relative w-10 h-5 rounded-full transition-colors ${isPublished ? "bg-green-500" : "bg-gray-200"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublished ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm font-bold text-gray-600">Published</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-black py-2 rounded-xl text-sm transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2 rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
