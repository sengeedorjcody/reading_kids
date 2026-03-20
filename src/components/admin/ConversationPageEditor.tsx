"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IConversationPage, IConversationCharacterSlot, ICharacter } from "@/types";

interface Props {
  page: IConversationPage;
  characters: ICharacter[];
  conversationId: string;
  backgroundImageUrl?: string;
  displayMode?: "mobile" | "desktop";
}

export default function ConversationPageEditor({ page, characters, conversationId, backgroundImageUrl, displayMode = "mobile" }: Props) {
  const router = useRouter();
  const [slots, setSlots] = useState<IConversationCharacterSlot[]>(() =>
    (page.characters ?? []).map((slot) => ({
      characterId: slot.characterId && typeof slot.characterId === "object" ? (slot.characterId as ICharacter)._id : slot.characterId,
      text: slot.text ?? "",
      characterPosition: slot.characterPosition ?? { x: 50, y: 50 },
      textPosition: slot.textPosition ?? { x: 50, y: 80 },
    }))
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const addSlot = () => {
    setSlots([...slots, {
      characterId: characters[0]?._id ?? "",
      text: "",
      characterPosition: { x: 30 + slots.length * 20, y: 50 },
      textPosition: { x: 30 + slots.length * 20, y: 80 },
    }]);
  };

  const removeSlot = (idx: number) => setSlots(slots.filter((_, i) => i !== idx));

  const updateSlot = (idx: number, updates: Partial<IConversationCharacterSlot>) => {
    setSlots(slots.map((s, i) => i === idx ? { ...s, ...updates } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/conversations/${conversationId}/pages/${page.pageNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characters: slots }),
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
          <span className="font-bold text-gray-600 text-sm">
            {slots.length === 0 ? "No characters" : `${slots.length} character${slots.length > 1 ? "s" : ""}`}
            {slots.length > 0 && `: ${slots.map(s => {
              const ch = characters.find(c => c._id === s.characterId);
              return ch?.name ?? "?";
            }).join(", ")}`}
          </span>
        </div>
        <span className="text-gray-400 text-sm">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 space-y-4">
          {slots.map((slot, idx) => (
            <SlotEditor
              key={idx}
              idx={idx}
              slot={slot}
              characters={characters}
              backgroundImageUrl={backgroundImageUrl}
              displayMode={displayMode}
              onChange={(updates) => updateSlot(idx, updates)}
              onRemove={() => removeSlot(idx)}
            />
          ))}

          <button
            type="button"
            onClick={addSlot}
            className="w-full border-2 border-dashed border-gray-200 hover:border-pink-300 text-gray-400 hover:text-pink-500 font-bold py-2.5 rounded-xl transition-all text-sm"
          >
            + Add Character
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

function SlotEditor({ idx, slot, characters, backgroundImageUrl, displayMode, onChange, onRemove }: {
  idx: number;
  slot: IConversationCharacterSlot;
  characters: ICharacter[];
  backgroundImageUrl?: string;
  displayMode?: "mobile" | "desktop";
  onChange: (updates: Partial<IConversationCharacterSlot>) => void;
  onRemove: () => void;
}) {
  const selectedChar = characters.find(c => c._id === slot.characterId);

  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Character {idx + 1}</span>
        <button onClick={onRemove} className="text-red-400 hover:text-red-600 text-xs font-bold">Remove</button>
      </div>

      {/* Character selector */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">Character</label>
        <div className="flex items-center gap-2">
          {selectedChar?.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selectedChar.imageUrl} alt={selectedChar.name} className="w-10 h-10 object-contain rounded-xl bg-white border" />
          )}
          <select
            value={typeof slot.characterId === 'string' ? slot.characterId : (slot.characterId as ICharacter)._id}
            onChange={(e) => onChange({ characterId: e.target.value })}
            className="flex-1 border-2 border-gray-200 focus:border-pink-400 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 outline-none bg-white"
          >
            <option value="">— Select —</option>
            {characters.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dialogue text */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">Dialogue Text</label>
        <textarea
          value={slot.text}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={2}
          placeholder="What does this character say?"
          className="w-full border-2 border-gray-200 focus:border-pink-400 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none resize-none"
        />
      </div>

      {/* Drag canvas */}
      <DragCanvas
        slot={slot}
        character={selectedChar}
        backgroundImageUrl={backgroundImageUrl}
        displayMode={displayMode}
        onCharacterMove={(pos) => onChange({ characterPosition: pos })}
        onTextMove={(pos) => onChange({ textPosition: pos })}
      />
    </div>
  );
}

function DragCanvas({ slot, character, backgroundImageUrl, displayMode = "mobile", onCharacterMove, onTextMove }: {
  slot: IConversationCharacterSlot;
  character: ICharacter | undefined;
  backgroundImageUrl?: string;
  displayMode?: "mobile" | "desktop";
  onCharacterMove: (pos: { x: number; y: number }) => void;
  onTextMove: (pos: { x: number; y: number }) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"char" | "text" | null>(null);

  const toPercent = (e: React.MouseEvent | MouseEvent | React.TouchEvent | TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    return {
      x: Math.round(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))),
      y: Math.round(Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))),
    };
  };

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging.current) return;
    e.preventDefault();
    const pos = toPercent(e);
    if (!pos) return;
    if (dragging.current === "char") onCharacterMove(pos);
    else onTextMove(pos);
  };

  const stopDrag = () => { dragging.current = null; };

  const charHeight = (character as ICharacter & { height?: number })?.height ?? 80;

  // mobile = 9:16 portrait, desktop = 16:9 landscape
  const aspectRatio = displayMode === "desktop" ? "16 / 9" : "9 / 16";

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <p className="text-xs font-bold text-gray-500">Drag to position</p>
        <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">
          {displayMode === "desktop" ? "🖥️ Desktop" : "📱 Mobile"}
        </span>
      </div>
      <div
        ref={canvasRef}
        onMouseMove={onMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onTouchMove={onMove}
        onTouchEnd={stopDrag}
        className="relative w-full rounded-xl overflow-hidden border-2 border-gray-200 select-none"
        style={{
          aspectRatio,
          maxHeight: 320,
          backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: backgroundImageUrl ? undefined : "#ede9fe",
        }}
      >
        {/* Character — draggable */}
        <div
          className="absolute cursor-grab active:cursor-grabbing"
          style={{
            left: `${slot.characterPosition.x}%`,
            top: `${slot.characterPosition.y}%`,
            transform: "translate(-50%, -50%)",
            height: Math.round(charHeight * 0.5),
            touchAction: "none",
          }}
          onMouseDown={(e) => { e.preventDefault(); dragging.current = "char"; }}
          onTouchStart={(e) => { e.preventDefault(); dragging.current = "char"; }}
        >
          {character?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={character.imageUrl}
              alt=""
              draggable={false}
              style={{ height: Math.round(charHeight * 0.5), width: "auto" }}
              className="object-contain pointer-events-none"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-pink-400 flex items-center justify-center text-white text-sm">🧑</div>
          )}
        </div>

        {/* Text bubble — draggable */}
        <div
          className="absolute cursor-grab active:cursor-grabbing bg-white rounded-lg px-2 py-1 shadow border border-pink-200 text-xs font-bold text-gray-700 max-w-[120px] truncate"
          style={{
            left: `${slot.textPosition.x}%`,
            top: `${slot.textPosition.y}%`,
            transform: "translate(-50%, -50%)",
            touchAction: "none",
          }}
          onMouseDown={(e) => { e.preventDefault(); dragging.current = "text"; }}
          onTouchStart={(e) => { e.preventDefault(); dragging.current = "text"; }}
        >
          {slot.text || "💬"}
        </div>

        <p className="absolute bottom-1 right-2 text-xs text-gray-400 font-bold pointer-events-none">drag to move</p>
      </div>
    </div>
  );
}
