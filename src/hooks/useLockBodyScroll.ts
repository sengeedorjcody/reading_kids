"use client";

import { useEffect } from "react";

/**
 * Locks page scroll while mounted. BottomNav renders a fixed-height spacer
 * div in normal document flow (to keep its own fixed nav from covering
 * scrollable pages) — on pages that are already sized to exactly 100dvh
 * (flashcards, exam), that spacer pushes the document taller than the
 * viewport, causing a few pixels of scroll/bounce on mobile. Locking the
 * scroll here removes that slack without touching BottomNav itself.
 */
export function useLockBodyScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [enabled]);
}
