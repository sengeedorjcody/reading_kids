"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import HomeDateWidget from "@/components/HomeDateWidget";

interface AppMeta {
  href: string;
  icon?: string;
  iconSrc?: string;
  label: string;
  color: string;
  bg: string;
}

interface HomeItem {
  id: string;
  type: "app" | "folder";
  href?: string;
  name?: string;
  appHrefs?: string[];
}

const APPS: AppMeta[] = [
  // Row 1 — core learning
  { href: "/exam",       icon: "📝", label: "Exam",        color: "#f97316", bg: "from-orange-500 to-rose-500" },
  { href: "/flashcards", icon: "🃏", label: "Flashcards",  color: "#ec4899", bg: "from-pink-400 to-rose-500" },
  { href: "/alphabet",   icon: "あ", label: "Alphabet",    color: "#f97316", bg: "from-orange-400 to-amber-500" },
  { href: "/writing",    icon: "✍️", label: "Writing",     color: "#8b5cf6", bg: "from-violet-400 to-purple-500" },
  { href: "/games",      icon: "🎮", label: "Games",       color: "#14b8a6", bg: "from-teal-400 to-green-500" },
  { href: "/game",       icon: "🔍", label: "Find Letter", color: "#22c55e", bg: "from-green-400 to-emerald-500" },
  // Row 2 — vocabulary
  { href: "/animals",    icon: "🐾", label: "Animals",     color: "#f59e0b", bg: "from-amber-400 to-yellow-500" },
  { href: "/body",       icon: "🧑", label: "Body",        color: "#06b6d4", bg: "from-cyan-400 to-sky-500" },
  { href: "/home",       icon: "🏠", label: "Home",        color: "#10b981", bg: "from-emerald-400 to-teal-500" },
  { href: "/colors",     icon: "🎨", label: "Colors",      color: "#a855f7", bg: "from-purple-400 to-fuchsia-500" },
  // Row 3 — topics
  { href: "/directions", icon: "🧭", label: "Directions",  color: "#3b82f6", bg: "from-blue-400 to-indigo-500" },
  { href: "/youtube", iconSrc: "/youtube-icon.svg", label: "YouTube", color: "#ef4444", bg: "from-red-500 to-rose-600" },
  { href: "/family",     icon: "👨‍👩‍👧", label: "Family",    color: "#f43f5e", bg: "from-rose-400 to-pink-500" },
  { href: "/clock",      icon: "🕐", label: "Clock",       color: "#6366f1", bg: "from-indigo-400 to-violet-500" },
  { href: "/math",       icon: "🧮", label: "Math",        color: "#14b8a6", bg: "from-teal-400 to-cyan-500" },
  // Row 4 — themes & library
  { href: "/themes",     icon: "🗂️", label: "Themes",      color: "#f97316", bg: "from-orange-400 to-red-400" },
  { href: "/books",      icon: "📖", label: "Books",       color: "#0ea5e9", bg: "from-sky-400 to-blue-500" },
  { href: "/picture-books", icon: "🖼️", label: "Picture Books", color: "#f59e0b", bg: "from-amber-400 to-orange-500" },
  { href: "/conversations",icon:"💬", label: "Conversations", color: "#8b5cf6", bg: "from-violet-400 to-purple-500" },
  { href: "/dictionary", icon: "📝", label: "Dictionary",  color: "#ec4899", bg: "from-pink-400 to-fuchsia-500" },
  // Row 5 — creative
  { href: "/words",      icon: "🔤", label: "Words",       color: "#f59e0b", bg: "from-yellow-400 to-orange-500" },
  { href: "/draw",       icon: "🎨", label: "Draw",        color: "#a855f7", bg: "from-fuchsia-400 to-purple-600" },
  // Row 6 — sports & food
  { href: "/food",       icon: "🍽️", label: "Food",        color: "#f97316", bg: "from-orange-400 to-yellow-400" },
  { href: "/badminton",  icon: "🏸", label: "Badminton",   color: "#3b82f6", bg: "from-blue-400 to-cyan-500" },
  { href: "/swimming",   icon: "🏊", label: "Swimming",    color: "#06b6d4", bg: "from-cyan-400 to-blue-500" },
  { href: "/volleyball",    icon: "🏐", label: "Volleyball",  color: "#f59e0b", bg: "from-yellow-400 to-orange-400" },
  // Row 7 — English
  { href: "/english",       icon: "🇬🇧", label: "English",    color: "#6366f1", bg: "from-indigo-400 to-blue-500" },
  { href: "/english-tutor", icon: "🎙️", label: "AI Tutor",   color: "#6366f1", bg: "from-indigo-500 to-violet-600" },
  { href: "/words-english", icon: "⌨️",  label: "Words EN",   color: "#8b5cf6", bg: "from-violet-400 to-indigo-500" },
];

const APPS_BY_HREF = new Map(APPS.map((a) => [a.href, a]));
const DRAG_THRESHOLD = 8;

function defaultItems(): HomeItem[] {
  return APPS.map((a) => ({ id: a.href, type: "app", href: a.href }));
}

// Merge saved layout with the current APPS list: drop dead hrefs, append new ones.
function mergeWithDefaults(saved: HomeItem[]): HomeItem[] {
  const referenced = new Set<string>();
  const cleaned: HomeItem[] = [];

  for (const item of saved) {
    if (item.type === "app") {
      if (item.href && APPS_BY_HREF.has(item.href)) {
        referenced.add(item.href);
        cleaned.push(item);
      }
    } else {
      const appHrefs = (item.appHrefs ?? []).filter((h) => APPS_BY_HREF.has(h));
      appHrefs.forEach((h) => referenced.add(h));
      if (appHrefs.length > 0) cleaned.push({ ...item, appHrefs });
    }
  }

  for (const a of APPS) {
    if (!referenced.has(a.href)) cleaned.push({ id: a.href, type: "app", href: a.href });
  }

  return cleaned;
}

function mergeAppsIntoFolder(items: HomeItem[], targetId: string, draggedId: string): HomeItem[] {
  const dragged = items.find((i) => i.id === draggedId);
  const target = items.find((i) => i.id === targetId);
  if (!dragged?.href || !target?.href) return items;
  const folder: HomeItem = {
    id: `folder-${Date.now()}`,
    type: "folder",
    name: "New Folder",
    appHrefs: [target.href, dragged.href],
  };
  return items.filter((i) => i.id !== draggedId).map((i) => (i.id === targetId ? folder : i));
}

function addAppToFolder(items: HomeItem[], folderId: string, draggedId: string): HomeItem[] {
  const dragged = items.find((i) => i.id === draggedId);
  if (!dragged?.href) return items;
  return items
    .filter((i) => i.id !== draggedId)
    .map((i) => (i.id === folderId && i.type === "folder"
      ? { ...i, appHrefs: [...(i.appHrefs ?? []), dragged.href!] }
      : i));
}

function reorder(items: HomeItem[], draggedId: string, targetIndex: number): HomeItem[] {
  const fromIndex = items.findIndex((i) => i.id === draggedId);
  if (fromIndex === -1) return items;
  const copy = [...items];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(Math.min(targetIndex, copy.length), 0, moved);
  return copy;
}

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = Boolean(session?.user && (session.user as { role?: string }).role === "admin");

  const [items, setItems] = useState<HomeItem[]>(defaultItems());
  const [savedItems, setSavedItems] = useState<HomeItem[]>(defaultItems());
  const [editMode, setEditMode] = useState(false);
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  const itemsRef = useRef<HomeItem[]>(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const pointerStart = useRef<{ x: number; y: number; id: string } | null>(null);

  useEffect(() => {
    fetch("/api/home-layout")
      .then((r) => r.json())
      .then((data) => {
        const merged = data.items && data.items.length > 0 ? mergeWithDefaults(data.items) : defaultItems();
        setItems(merged);
        setSavedItems(merged);
      })
      .catch(() => {});
  }, []);

  const finishDrag = (draggedId: string, x: number, y: number) => {
    const dragged = itemsRef.current.find((i) => i.id === draggedId);
    if (!dragged) return;

    let targetId: string | null = null;
    itemRefs.current.forEach((el, id) => {
      if (id === draggedId || targetId) return;
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) targetId = id;
    });

    setItems((prev) => {
      if (targetId) {
        const target = prev.find((i) => i.id === targetId);
        if (target && dragged.type === "app") {
          if (target.type === "app") return mergeAppsIntoFolder(prev, targetId!, draggedId);
          if (target.type === "folder") return addAppToFolder(prev, targetId!, draggedId);
        }
        const targetIndex = prev.findIndex((i) => i.id === targetId);
        return reorder(prev, draggedId, targetIndex);
      }

      let nearestId: string | null = null;
      let nearestDist = Infinity;
      itemRefs.current.forEach((el, id) => {
        if (id === draggedId) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        const dist = Math.hypot(x - cx, y - cy);
        if (dist < nearestDist) { nearestDist = dist; nearestId = id; }
      });
      if (!nearestId) return prev;
      const targetIndex = prev.findIndex((i) => i.id === nearestId);
      return reorder(prev, draggedId, targetIndex);
    });
  };

  const handleTap = (id: string) => {
    const item = itemsRef.current.find((i) => i.id === id);
    if (!item) return;
    if (item.type === "folder") { setOpenFolderId(id); return; }
    if (item.type === "app" && !editMode) router.push(item.href!);
  };

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!pointerStart.current) return;
      const { x, y, id } = pointerStart.current;
      const dx = e.clientX - x, dy = e.clientY - y;
      if (!dragId && editMode && Math.hypot(dx, dy) > DRAG_THRESHOLD) setDragId(id);
      if (dragId) setDragPos({ x: e.clientX, y: e.clientY });
    };
    const handleUp = (e: PointerEvent) => {
      if (!pointerStart.current) return;
      const { x, y, id } = pointerStart.current;
      const moved = Math.hypot(e.clientX - x, e.clientY - y) > DRAG_THRESHOLD;
      if (dragId && moved) finishDrag(id, e.clientX, e.clientY);
      else if (!moved) handleTap(id);
      pointerStart.current = null;
      setDragId(null);
      setDragPos(null);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragId, editMode]);

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    if (editMode) e.preventDefault();
    pointerStart.current = { x: e.clientX, y: e.clientY, id };
  };

  const saveLayout = async () => {
    setSaving(true);
    try {
      await fetch("/api/home-layout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      setSavedItems(items);
    } finally {
      setSaving(false);
      setEditMode(false);
    }
  };

  const cancelEdit = () => {
    setItems(savedItems);
    setEditMode(false);
  };

  const renameFolder = (folderId: string, currentName: string) => {
    const name = window.prompt("Folder name", currentName);
    if (name && name.trim()) {
      setItems((prev) => prev.map((i) => (i.id === folderId ? { ...i, name: name.trim() } : i)));
    }
  };

  const removeFromFolder = (folderId: string, href: string) => {
    setItems((prev) => {
      const folder = prev.find((i) => i.id === folderId);
      if (!folder) return prev;
      const remaining = (folder.appHrefs ?? []).filter((h) => h !== href);
      const rest = prev.filter((i) => i.id !== folderId || remaining.length > 0)
        .map((i) => (i.id === folderId ? { ...i, appHrefs: remaining } : i));
      return [...rest, { id: href, type: "app", href }];
    });
  };

  const dissolveFolder = (folderId: string) => {
    setItems((prev) => {
      const folder = prev.find((i) => i.id === folderId);
      if (!folder) return prev;
      const appItems: HomeItem[] = (folder.appHrefs ?? []).map((href) => ({ id: href, type: "app", href }));
      return [...prev.filter((i) => i.id !== folderId), ...appItems];
    });
    setOpenFolderId(null);
  };

  const registerRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  };

  const openFolder = items.find((i) => i.id === openFolderId);
  const draggedItem = dragId ? items.find((i) => i.id === dragId) : null;

  return (
    <div
      className="min-h-screen flex flex-col pb-28"
      style={{ background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)" }}
    >
      {/* ── Date / Week widget ── */}
      <div className="px-5 pt-3 mb-4 max-w-xl mx-auto w-full flex items-center gap-3">
        <div className="flex-1"><HomeDateWidget /></div>
        {isAdmin && !editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="text-white/60 text-xs font-bold px-3 py-2 rounded-xl bg-white/5 active:scale-95"
          >
            ✏️ Edit
          </button>
        )}
        {editMode && (
          <div className="flex gap-2">
            <button onClick={cancelEdit} className="text-white/60 text-xs font-bold px-3 py-2 rounded-xl bg-white/5 active:scale-95">
              Cancel
            </button>
            <button
              onClick={saveLayout}
              disabled={saving}
              className="text-white text-xs font-bold px-3 py-2 rounded-xl bg-blue-500 active:scale-95 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      {editMode && (
        <p className="text-center text-white/40 text-xs mb-2">
          Drag an icon onto another to make a folder · drag onto a folder to add it in
        </p>
      )}

      {/* ── App grid ── */}
      <div className="flex-1 px-5">
        <div className="grid grid-cols-4 gap-x-4 gap-y-6 max-w-xl mx-auto">
          {items.map((item) => {
            const isDragging = dragId === item.id;
            return (
              <div
                key={item.id}
                ref={registerRef(item.id)}
                onPointerDown={(e) => handlePointerDown(e, item.id)}
                className={editMode && !isDragging ? "home-icon-wiggle" : ""}
                style={{ touchAction: editMode ? "none" : "auto", opacity: isDragging ? 0.25 : 1, cursor: editMode ? "grab" : "pointer" }}
              >
                {item.type === "folder" ? (
                  <FolderIcon item={item} />
                ) : (
                  <AppIconView meta={APPS_BY_HREF.get(item.href!)} suppressNav={editMode} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Floating dragged icon ── */}
      {draggedItem && dragPos && (
        <div
          className="fixed pointer-events-none z-50"
          style={{ left: dragPos.x - 32, top: dragPos.y - 32, transform: "scale(1.15)" }}
        >
          {draggedItem.type === "folder"
            ? <FolderIcon item={draggedItem} />
            : <AppIconView meta={APPS_BY_HREF.get(draggedItem.href!)} suppressNav />}
        </div>
      )}

      {/* ── Folder modal ── */}
      {openFolder && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setOpenFolderId(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-5"
            style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              {editMode ? (
                <button
                  onClick={() => renameFolder(openFolder.id, openFolder.name ?? "")}
                  className="text-white font-black text-lg flex items-center gap-1"
                >
                  {openFolder.name} ✏️
                </button>
              ) : (
                <span className="text-white font-black text-lg">{openFolder.name}</span>
              )}
              <button onClick={() => setOpenFolderId(null)} className="text-white/50 text-xl px-2">✕</button>
            </div>

            <div className="grid grid-cols-4 gap-x-4 gap-y-5">
              {(openFolder.appHrefs ?? []).map((href) => {
                const meta = APPS_BY_HREF.get(href);
                if (!meta) return null;
                return (
                  <div key={href} className="relative">
                    {editMode && (
                      <button
                        onClick={() => removeFromFolder(openFolder.id, href)}
                        className="absolute -top-2 -left-2 z-10 w-5 h-5 rounded-full bg-gray-600 text-white text-xs flex items-center justify-center"
                      >
                        ✕
                      </button>
                    )}
                    <AppIconView
                      meta={meta}
                      suppressNav={editMode}
                      onNavigate={() => setOpenFolderId(null)}
                    />
                  </div>
                );
              })}
            </div>

            {editMode && (
              <button
                onClick={() => dissolveFolder(openFolder.id)}
                className="w-full mt-5 py-2.5 rounded-2xl text-red-300 text-xs font-bold bg-red-500/10 active:scale-95"
              >
                Dissolve folder
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AppIconView({
  meta,
  suppressNav,
  onNavigate,
}: {
  meta?: AppMeta;
  suppressNav?: boolean;
  onNavigate?: () => void;
}) {
  if (!meta) return null;
  const content = (
    <div className="flex flex-col items-center gap-2 select-none">
      <div
        className={`w-16 h-16 rounded-[22px] bg-gradient-to-br ${meta.bg} flex items-center justify-center text-3xl shadow-lg`}
        style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)" }}
      >
        {meta.iconSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={meta.iconSrc} alt={meta.label} className="w-9 h-9 drop-shadow-md" draggable={false} />
        ) : (
          <span className="drop-shadow-md leading-none">{meta.icon}</span>
        )}
      </div>
      <span className="text-white text-[11px] font-bold text-center leading-tight" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
        {meta.label}
      </span>
    </div>
  );

  if (suppressNav) return content;

  return (
    <a href={meta.href} onClick={onNavigate} className="active:scale-90 transition-transform block">
      {content}
    </a>
  );
}

function FolderIcon({ item }: { item: HomeItem }) {
  const previewHrefs = (item.appHrefs ?? []).slice(0, 4);
  return (
    <div className="flex flex-col items-center gap-2 select-none active:scale-90 transition-transform">
      <div
        className="w-16 h-16 rounded-[22px] grid grid-cols-2 gap-1 p-2"
        style={{ background: "rgba(255,255,255,0.12)", boxShadow: "0 4px 15px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)" }}
      >
        {previewHrefs.map((href) => {
          const meta = APPS_BY_HREF.get(href);
          return (
            <div key={href} className={`rounded-md bg-gradient-to-br ${meta?.bg ?? "from-gray-400 to-gray-500"} flex items-center justify-center text-[10px]`}>
              {meta?.iconSrc
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={meta.iconSrc} alt="" className="w-3 h-3" draggable={false} />
                : <span>{meta?.icon}</span>}
            </div>
          );
        })}
      </div>
      <span className="text-white text-[11px] font-bold text-center leading-tight" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
        {item.name}
      </span>
    </div>
  );
}
