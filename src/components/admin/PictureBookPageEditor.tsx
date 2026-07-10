"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IPictureBookPage } from "@/types";

interface IBackground { _id: string; name: string; imageUrl: string; }

interface Props {
  page: IPictureBookPage;
  backgrounds: IBackground[];
  pictureBookId: string;
}

export default function PictureBookPageEditor({ page, backgrounds, pictureBookId }: Props) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(page.imageUrl ?? "");
  const [rawText, setRawText] = useState(page.rawText ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/picture-books/${pictureBookId}/pages/${page.pageNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imageUrl || null, rawText }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete page ${page.pageNumber}?`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/picture-books/${pictureBookId}/pages/${page.pageNumber}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Page header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="bg-amber-100 text-amber-600 font-black text-sm w-8 h-8 rounded-xl flex items-center justify-center">
            {page.pageNumber}
          </span>
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="bg" className="w-10 h-7 object-cover rounded" />
          )}
          <span className="font-bold text-gray-500 text-sm truncate max-w-xs">
            {rawText ? rawText.slice(0, 40) : "No text"}
          </span>
        </div>
        <span className="text-gray-400 text-sm">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          {/* Illustration picker */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Illustration (full page, with blank caption area)</label>
            {backgrounds.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-2">
                {backgrounds.map((bg) => (
                  <button
                    key={bg._id}
                    type="button"
                    onClick={() => setImageUrl(bg.imageUrl)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      imageUrl === bg.imageUrl ? "border-amber-500 ring-2 ring-amber-300" : "border-gray-200 hover:border-amber-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bg.imageUrl} alt={bg.name} className="w-full h-full object-cover" />
                    {imageUrl === bg.imageUrl && (
                      <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or paste image URL…"
              className="w-full border border-gray-200 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none transition-colors"
            />
          </div>

          {/* Text */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Caption text (overlaid on the illustration's blank area)</label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={4}
              placeholder="きょう は とても いい おてんき です。"
              className="w-full border border-gray-200 focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none transition-colors resize-none"
            />
            <p className="text-[11px] text-gray-400 mt-1">Space-separate words if not using kanji/kana auto-tokenizing.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-sm transition-colors"
            >
              {saving ? "Saving…" : "✅ Save"}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-100 hover:bg-red-200 text-red-600 font-bold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {deleting ? "..." : "🗑️"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
