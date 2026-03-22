"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IConversationPage } from "@/types";

interface IBackground { _id: string; name: string; imageUrl: string; }

interface Props {
  page: IConversationPage;
  characters?: unknown[];
  backgrounds: IBackground[];
  conversationId: string;
  fallbackBackgroundImageUrl?: string;
  displayMode?: "mobile" | "desktop";
}

export default function ConversationPageEditor({ page, backgrounds, conversationId, fallbackBackgroundImageUrl }: Props) {
  const router = useRouter();
  const [pageBackground, setPageBackground] = useState<string | undefined>(page.backgroundImageUrl);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/conversations/${conversationId}/pages/${page.pageNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backgroundImageUrl: pageBackground ?? null }),
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
      await fetch(`/api/conversations/${conversationId}/pages/${page.pageNumber}`, { method: "DELETE" });
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
          <span className="bg-rose-100 text-rose-600 font-black text-sm w-8 h-8 rounded-xl flex items-center justify-center">
            {page.pageNumber}
          </span>
          {pageBackground && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pageBackground} alt="bg" className="w-8 h-5 object-cover rounded" />
          )}
          <span className="font-bold text-gray-500 text-sm">
            {pageBackground ? "Custom background" : fallbackBackgroundImageUrl ? "Default background" : "No background"}
          </span>
        </div>
        <span className="text-gray-400 text-sm">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 space-y-4">
          {/* Background picker */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider">🌅 Page Background</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPageBackground(undefined)}
                className={`aspect-video rounded-xl border-2 flex items-center justify-center text-xs font-bold transition-all ${
                  pageBackground === undefined
                    ? "border-rose-400 bg-rose-50 text-rose-600"
                    : "border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
              >
                {fallbackBackgroundImageUrl ? "Default" : "None"}
              </button>
              {backgrounds.map((bg) => (
                <button
                  key={bg._id}
                  type="button"
                  onClick={() => setPageBackground(bg.imageUrl)}
                  title={bg.name}
                  className={`aspect-video rounded-xl border-2 overflow-hidden transition-all ${
                    pageBackground === bg.imageUrl
                      ? "border-rose-400 ring-2 ring-rose-300"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bg.imageUrl} alt={bg.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-200 text-white font-black py-2.5 rounded-xl text-sm transition-colors"
            >
              {saving ? "Saving…" : "💾 Save Page"}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-50 hover:bg-red-100 text-red-500 font-bold py-2.5 px-4 rounded-xl text-sm transition-colors"
            >
              {deleting ? "…" : "🗑"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
