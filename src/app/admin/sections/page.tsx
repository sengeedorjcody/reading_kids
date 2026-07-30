"use client";

import { useEffect, useState } from "react";
import { SECTION_CATALOG } from "@/constants/sections";

export default function AdminSectionsPage() {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [savingHref, setSavingHref] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sections")
      .then((r) => r.json())
      .then((data) => setHidden(new Set(data.hidden ?? [])))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (href: string) => {
    const nextHidden = !hidden.has(href);
    setSavingHref(href);

    // Optimistic update
    setHidden((prev) => {
      const next = new Set(prev);
      if (nextHidden) next.add(href);
      else next.delete(href);
      return next;
    });

    try {
      await fetch("/api/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ href, isHidden: nextHidden }),
      });
    } catch {
      // Revert on failure
      setHidden((prev) => {
        const next = new Set(prev);
        if (nextHidden) next.delete(href);
        else next.add(href);
        return next;
      });
    } finally {
      setSavingHref(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-800">🗂️ Sections</h1>
        <p className="text-gray-500 font-medium">
          Hide sections you don&apos;t need — hidden sections disappear from the home screen and bottom nav for everyone.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <div className="bg-white rounded-3xl divide-y divide-gray-100 overflow-hidden">
          {SECTION_CATALOG.map((s) => {
            const isHidden = hidden.has(s.href);
            return (
              <div key={s.href} className="flex items-center gap-4 px-6 py-3">
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${s.bg} flex items-center justify-center text-xl flex-shrink-0 ${
                    isHidden ? "opacity-40 grayscale" : ""
                  }`}
                >
                  {s.iconSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.iconSrc} alt={s.label} className="w-6 h-6" />
                  ) : (
                    <span>{s.icon}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold ${isHidden ? "text-gray-400" : "text-gray-800"}`}>{s.label}</p>
                  <p className="text-xs text-gray-400">{s.href}</p>
                </div>
                <button
                  onClick={() => toggle(s.href)}
                  disabled={savingHref === s.href}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all active:scale-95 disabled:opacity-50 ${
                    isHidden
                      ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {isHidden ? "Hidden — show" : "Visible — hide"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
