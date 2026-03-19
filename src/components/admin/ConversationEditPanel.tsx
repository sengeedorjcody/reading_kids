"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IConversation } from "@/types";

export default function ConversationEditPanel({ conversation }: { conversation: IConversation }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(conversation.backgroundImageUrl ?? "");
  const [title, setTitle] = useState(conversation.title);
  const [isPublished, setIsPublished] = useState(conversation.isPublished);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/conversations/${conversation._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, backgroundImageUrl, isPublished }),
    });
    setSaving(false);
    setOpen(false);
    router.refresh();
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
          {/* Background preview */}
          <div className="w-full h-36 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border border-gray-100">
            {backgroundImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={backgroundImageUrl} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-3xl mb-1">🖼️</div>
                <p className="text-xs font-bold">No background image</p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-rose-400 rounded-xl px-3 py-2 text-gray-700 font-bold outline-none text-sm"
            />
          </div>

          {/* Background Image URL */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Background Image URL</label>
            <input
              type="url"
              value={backgroundImageUrl}
              onChange={(e) => setBackgroundImageUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="w-full border-2 border-gray-200 focus:border-rose-400 rounded-xl px-3 py-2 text-gray-700 outline-none text-sm"
            />
          </div>

          {/* Published toggle */}
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
