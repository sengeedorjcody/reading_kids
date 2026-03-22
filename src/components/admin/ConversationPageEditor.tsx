"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IConversationPage, ITextSlot } from "@/types";

interface IBackground { _id: unknown; name: string; imageUrl: string; }

interface Props {
  page: IConversationPage;
  backgrounds: IBackground[];
  conversationId: string;
  fallbackBackgroundImageUrl?: string;
  displayMode?: "mobile" | "desktop";
}

export default function ConversationPageEditor({ page, backgrounds, conversationId, fallbackBackgroundImageUrl, displayMode = "mobile" }: Props) {
  const router = useRouter();
  const [texts, setTexts] = useState<ITextSlot[]>(page.texts ?? []);
  const [pageBackground, setPageBackground] = useState<string | undefined>(page.backgroundImageUrl);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const addText = () => setTexts([...texts, { text: "", position: { x: 50, y: 50 + texts.length * 15 } }]);
  const removeText = (idx: number) => setTexts(texts.filter((_, i) => i !== idx));
  const updateText = (idx: number, updates: Partial<ITextSlot>) =>
    setTexts(texts.map((t, i) => i === idx ? { ...t, ...updates } : t));

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/conversations/${conversationId}/pages/${page.pageNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts, backgroundImageUrl: pageBackground ?? null }),
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

  const activeBackground = pageBackground ?? fallbackBackgroundImageUrl;
  const aspectRatio = displayMode === "desktop" ? "16 / 9" : "9 / 16";

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
          {activeBackground && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activeBackground} alt="bg" className="w-8 h-5 object-cover rounded" />
          )}
          <span className="font-bold text-gray-500 text-sm">
            {texts.length === 0 ? "No text" : `${texts.length} text bubble${texts.length > 1 ? "s" : ""}`}
          </span>
        </div>
        <span className="text-gray-400 text-sm">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 space-y-4">
          {/* Background picker */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider">🌅 Page Background</label>
            <div className={`grid gap-1.5 ${displayMode === "desktop" ? "grid-cols-4 sm:grid-cols-5" : "grid-cols-5 sm:grid-cols-6"}`}>
              {/* Default button — shows actual fallback image if available */}
              <button
                type="button"
                onClick={() => setPageBackground(undefined)}
                className={`rounded-xl border-2 overflow-hidden relative transition-all ${
                  pageBackground === undefined
                    ? "border-rose-400 ring-2 ring-rose-300"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                style={{ aspectRatio }}
              >
                {fallbackBackgroundImageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fallbackBackgroundImageUrl} alt="default" className="w-full h-full object-cover" />
                    <span className="absolute inset-0 flex items-end justify-center pb-1">
                      <span className="bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Default</span>
                    </span>
                  </>
                ) : (
                  <span className="flex items-center justify-center h-full text-xs font-bold text-gray-400">None</span>
                )}
              </button>

              {backgrounds.map((bg) => (
                <button
                  key={String(bg._id)}
                  type="button"
                  onClick={() => setPageBackground(bg.imageUrl)}
                  title={bg.name}
                  className={`rounded-xl border-2 overflow-hidden transition-all ${
                    pageBackground === bg.imageUrl
                      ? "border-rose-400 ring-2 ring-rose-300"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  style={{ aspectRatio }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bg.imageUrl} alt={bg.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Text inputs */}
          {texts.map((slot, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-2 text-xs font-black text-gray-400 w-5 text-center">{idx + 1}</span>
              <textarea
                value={slot.text}
                onChange={(e) => updateText(idx, { text: e.target.value })}
                rows={2}
                placeholder="Enter dialogue text…"
                className="flex-1 border-2 border-gray-200 focus:border-pink-400 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none resize-none"
              />
              <button
                onClick={() => removeText(idx)}
                className="mt-2 text-red-400 hover:text-red-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addText}
            className="w-full border-2 border-dashed border-gray-200 hover:border-pink-300 text-gray-400 hover:text-pink-500 font-bold py-2 rounded-xl transition-all text-sm"
          >
            + Add Text Bubble
          </button>

          {/* Shared drag canvas — all bubbles on one canvas */}
          {texts.length > 0 && (
            <SharedDragCanvas
              texts={texts}
              backgroundImageUrl={activeBackground}
              displayMode={displayMode}
              onMove={(idx, pos) => updateText(idx, { position: pos })}
            />
          )}

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

function SharedDragCanvas({ texts, backgroundImageUrl, displayMode = "mobile", onMove }: {
  texts: ITextSlot[];
  backgroundImageUrl?: string;
  displayMode?: "mobile" | "desktop";
  onMove: (idx: number, pos: { x: number; y: number }) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<number | null>(null);

  const toPercent = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: Math.round(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))),
      y: Math.round(Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))),
    };
  };

  const aspectRatio = displayMode === "desktop" ? "16 / 9" : "9 / 16";
  const MAX_H = 500;
  const maxWidth = displayMode === "desktop" ? Math.round(MAX_H * 16 / 9) : Math.round(MAX_H * 9 / 16);

  return (
    <div className="space-y-1">
      <p className="text-xs font-bold text-gray-500">Drag bubbles to position</p>
      <div
        ref={canvasRef}
        onMouseMove={(e) => {
          if (dragging.current === null) return;
          e.preventDefault();
          const p = toPercent(e);
          if (p) onMove(dragging.current, p);
        }}
        onMouseUp={() => { dragging.current = null; }}
        onMouseLeave={() => { dragging.current = null; }}
        onTouchMove={(e) => {
          if (dragging.current === null) return;
          e.preventDefault();
          const p = toPercent(e);
          if (p) onMove(dragging.current, p);
        }}
        onTouchEnd={() => { dragging.current = null; }}
        className="relative w-full rounded-xl overflow-hidden border-2 border-gray-200 select-none"
        style={{
          aspectRatio,
          maxHeight: MAX_H,
          maxWidth,
          margin: "0 auto",
          backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: backgroundImageUrl ? undefined : "#ede9fe",
        }}
      >
        {texts.map((slot, idx) => (
          <div
            key={idx}
            className="absolute cursor-grab active:cursor-grabbing bg-white rounded-2xl px-3 py-1.5 shadow-lg border-2 border-pink-200 text-xs font-bold text-gray-700 max-w-[150px] truncate"
            style={{
              left: `${slot.position.x}%`,
              top: `${slot.position.y}%`,
              transform: "translate(-50%, -50%)",
              touchAction: "none",
            }}
            onMouseDown={(e) => { e.preventDefault(); dragging.current = idx; }}
            onTouchStart={(e) => { e.preventDefault(); dragging.current = idx; }}
          >
            {slot.text || `💬 ${idx + 1}`}
          </div>
        ))}
      </div>
    </div>
  );
}
