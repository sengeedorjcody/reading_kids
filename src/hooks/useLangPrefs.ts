"use client";

import { useEffect, useState } from "react";

const KEY = "drivingTestLang.v1";

/** JP / MN / EN visibility toggles, remembered in localStorage (shared by the quiz and hazard pages). */
export function useLangPrefs() {
  const [showJa, setShowJa] = useState(true);
  const [showMn, setShowMn] = useState(true);
  const [showEn, setShowEn] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Read after mount so server and first client render match.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const v = JSON.parse(raw) as { ja?: boolean; mn?: boolean; en?: boolean };
        if (typeof v.ja === "boolean") setShowJa(v.ja);
        if (typeof v.mn === "boolean") setShowMn(v.mn);
        if (typeof v.en === "boolean") setShowEn(v.en);
      }
    } catch {
      /* storage unavailable: keep defaults */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ ja: showJa, mn: showMn, en: showEn }));
    } catch {
      /* ignore */
    }
  }, [loaded, showJa, showMn, showEn]);

  return { showJa, setShowJa, showMn, setShowMn, showEn, setShowEn };
}
