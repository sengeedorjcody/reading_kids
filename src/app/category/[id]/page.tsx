"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { CATEGORY_BY_ID } from "@/constants/categories";
import { SECTION_CATALOG_BY_HREF, type SectionMeta } from "@/constants/sections";

export default function CategoryPage({ params }: { params: { id: string } }) {
  const category = CATEGORY_BY_ID.get(params.id);
  const [hiddenHrefs, setHiddenHrefs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/sections")
      .then((r) => r.json())
      .then((data) => setHiddenHrefs(new Set(data.hidden ?? [])))
      .catch(() => {});
  }, []);

  if (!category) notFound();

  const items = category.hrefs
    .map((href) => SECTION_CATALOG_BY_HREF.get(href))
    .filter((s): s is SectionMeta => s !== undefined && !hiddenHrefs.has(s.href));

  return (
    <div
      className="min-h-screen flex flex-col pb-28"
      style={{ background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)" }}
    >
      <div className="px-5 pt-6 pb-4 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <span>{category.icon}</span> {category.label}
        </h1>
      </div>

      <div className="flex-1 px-5">
        <div className="grid grid-cols-4 gap-x-4 gap-y-6 max-w-4xl mx-auto">
          {items.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="flex flex-col items-center gap-2 active:scale-90 transition-transform"
            >
              <div
                className={`w-16 h-16 rounded-[22px] bg-gradient-to-br ${s.bg} flex items-center justify-center text-3xl shadow-lg`}
                style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)" }}
              >
                {s.iconSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.iconSrc} alt={s.label} className="w-9 h-9 drop-shadow-md" />
                ) : (
                  <span className="drop-shadow-md leading-none">{s.icon}</span>
                )}
              </div>
              <span
                className="text-white text-[11px] font-bold text-center leading-tight"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
              >
                {s.label}
              </span>
            </a>
          ))}
        </div>

        {items.length === 0 && (
          <p className="text-white/40 text-center mt-10">Nothing here right now.</p>
        )}
      </div>
    </div>
  );
}
