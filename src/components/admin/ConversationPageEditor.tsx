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
            <div className={`grid gap-2 ${displayMode === "desktop" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-3 sm:grid-cols-4"}`}>
              <button
                type="button"
                onClick={() => setPageBackground(undefined)}
                className={`rounded-xl border-2 flex items-center justify-center text-xs font-bold transition-all ${
                  pageBackground === undefined
                    ? "border-rose-400 bg-rose-50 text-rose-600"
                    : "border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
                style={{ aspectRatio: displayMode === "desktop" ? "16 / 9" : "9 / 16" }}
              >
                {fallbackBackgroundImageUrl ? "Default" : "None"}
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
                  style={{ aspectRatio: displayMode === "desktop" ? "16 / 9" : "9 / 16" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bg.imageUrl} alt={bg.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Text slots */}
          {texts.map((slot, idx) => (
            <TextSlotEditor
              key={idx}
              idx={idx}
              slot={slot}
              backgroundImageUrl={activeBackground}
              displayMode={displayMode}
              onChange={(updates) => updateText(idx, updates)}
              onRemove={() => removeText(idx)}
            />
          ))}

          <button
            type="button"
            onClick={addText}
            className="w-full border-2 border-dashed border-gray-200 hover:border-pink-300 text-gray-400 hover:text-pink-500 font-bold py-2.5 rounded-xl transition-all text-sm"
          >
            + Add Text Bubble
          </button>

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

function TextSlotEditor({ idx, slot, backgroundImageUrl, displayMode = "mobile", onChange, onRemove }: {
  idx: number;
  slot: ITextSlot;
  backgroundImageUrl?: string;
  displayMode?: "mobile" | "desktop";
  onChange: (updates: Partial<ITextSlot>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Text {idx + 1}</span>
        <button onClick={onRemove} className="text-red-400 hover:text-red-600 text-xs font-bold">Remove</button>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">Text</label>
        <textarea
          value={slot.text}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={2}
          placeholder="Enter dialogue text…"
          className="w-full border-2 border-gray-200 focus:border-pink-400 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none resize-none"
        />
      </div>

      <DragCanvas
        slot={slot}
        backgroundImageUrl={backgroundImageUrl}
        displayMode={displayMode}
        onMove={(pos) => onChange({ position: pos })}
      />
    </div>
  );
}

function DragCanvas({ slot, backgroundImageUrl, displayMode = "mobile", onMove }: {
  slot: ITextSlot;
  backgroundImageUrl?: string;
  displayMode?: "mobile" | "desktop";
  onMove: (pos: { x: number; y: number }) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

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
  const MAX_H = 400;
  const maxWidth = displayMode === "desktop" ? Math.round(MAX_H * 16 / 9) : Math.round(MAX_H * 9 / 16);

  return (
    <div className="space-y-1">
      <p className="text-xs font-bold text-gray-500">Drag bubble to position</p>
      <div
        ref={canvasRef}
        onMouseMove={(e) => { if (dragging.current) { e.preventDefault(); const p = toPercent(e); if (p) onMove(p); } }}
        onMouseUp={() => { dragging.current = false; }}
        onMouseLeave={() => { dragging.current = false; }}
        onTouchMove={(e) => { if (dragging.current) { e.preventDefault(); const p = toPercent(e); if (p) onMove(p); } }}
        onTouchEnd={() => { dragging.current = false; }}
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
        <div
          className="absolute cursor-grab active:cursor-grabbing bg-white rounded-2xl px-3 py-1.5 shadow-lg border-2 border-pink-200 text-xs font-bold text-gray-700 max-w-[140px] truncate"
          style={{
            left: `${slot.position.x}%`,
            top: `${slot.position.y}%`,
            transform: "translate(-50%, -50%)",
            touchAction: "none",
          }}
          onMouseDown={(e) => { e.preventDefault(); dragging.current = true; }}
          onTouchStart={(e) => { e.preventDefault(); dragging.current = true; }}
        >
          {slot.text || "💬 text"}
        </div>
      </div>
    </div>
  );
}
