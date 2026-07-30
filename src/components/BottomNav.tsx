"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTION_CATALOG } from "@/constants/sections";

const HIDDEN_PATTERNS = [/^\/$/, /^\/draw/, /^\/books\/[^/]+\/read\//, /^\/conversations\/[^/]+\/read\//, /^\/picture-books\/[^/]+\/read\//, /^\/games\/.+/, /^\/animal-match/, /^\/left-right/, /^\/memory-hands/, /^\/minemind-connect/, /^\/numberblocks/, /^\/youtube\/[^/]+/];

export default function BottomNav() {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ widthPct: 100, leftPct: 0 });
  const [hiddenHrefs, setHiddenHrefs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/sections")
      .then((r) => r.json())
      .then((data) => setHiddenHrefs(new Set(data.hidden ?? [])))
      .catch(() => {});
  }, []);

  // Always-visible custom scroll indicator — native scrollbars are OS-controlled
  // overlays on iOS/mobile Safari and fade out even with scrollbar CSS applied,
  // so we track scroll position ourselves instead of relying on them.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const { scrollWidth, clientWidth, scrollLeft } = el;
      if (scrollWidth <= clientWidth) {
        setThumb({ widthPct: 100, leftPct: 0 });
        return;
      }
      const widthPct = (clientWidth / scrollWidth) * 100;
      const leftPct = (scrollLeft / scrollWidth) * 100;
      setThumb({ widthPct, leftPct });
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  // Dragging the track (or its thumb) scrolls the icon row proportionally,
  // same as dragging a real scrollbar.
  const scrollToPointer = (clientX: number) => {
    const scrollEl = scrollRef.current;
    const track = trackRef.current;
    if (!scrollEl || !track) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
    scrollEl.scrollLeft = pct * maxScroll;
  };

  const startTrackDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    scrollToPointer(e.clientX);
    const onMove = (ev: PointerEvent) => scrollToPointer(ev.clientX);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  if (HIDDEN_PATTERNS.some((re) => re.test(pathname))) return null;

  return (
    <>
      {/* Spacer so page content isn't hidden behind the fixed nav */}
      <div className="h-24" />
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-pink-100 shadow-2xl shadow-pink-100/50">
        <div ref={scrollRef} className="scrollbar-none flex items-center gap-1 px-2 pt-2 pb-1 overflow-x-auto">
          <BottomNavLink href="/" icon="🏠" label="Home" />
          {SECTION_CATALOG.filter((s) => !hiddenHrefs.has(s.href)).map((s) => (
            <BottomNavLink key={s.href} href={s.href} icon={s.icon} iconSrc={s.iconSrc} label={s.label} />
          ))}
          <BottomNavLink href="/admin" icon="⚙️" label="Admin" isAdmin />
        </div>

        {/* Custom always-visible, draggable scroll indicator track */}
        <div
          onPointerDown={startTrackDrag}
          className="px-2 py-2 cursor-pointer touch-none"
        >
          <div ref={trackRef} className="h-1.5 rounded-full bg-pink-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-pink-400 transition-all pointer-events-none"
              style={{ width: `${thumb.widthPct}%`, marginLeft: `${thumb.leftPct}%` }}
            />
          </div>
        </div>
      </nav>
    </>
  );
}

function BottomNavLink({ href, icon, iconSrc, label, isAdmin }: {
  href: string; icon?: string; iconSrc?: string; label: string; isAdmin?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all active:scale-95 ${
        isAdmin
          ? "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          : "text-gray-500 hover:text-pink-600 hover:bg-pink-50"
      }`}
    >
      {iconSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={iconSrc} alt={label} className="w-7 h-7" />
      ) : (
        <span className="text-3xl leading-none">{icon}</span>
      )}
      <span className="text-xs font-bold">{label}</span>
    </Link>
  );
}
