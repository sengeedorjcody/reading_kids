"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { IPictureBookPage, PictureBookTextPosition } from "@/types";
import PictureBookWord from "./PictureBookWord";

interface Props {
  page: IPictureBookPage;
  pictureBookId: string;
  currentPage: number;
  totalPages: number;
}

interface Box { left: number; top: number; width: number; height: number }

// The region (within the rendered image box) where the illustration left blank
// space for the caption, as fractions of the image box.
const REGION: Record<PictureBookTextPosition, { left: number; top: number; width: number; height: number; align: "center" | "left" }> = {
  left:   { left: 0.02, top: 0.06, width: 0.44, height: 0.88, align: "left" },
  right:  { left: 0.54, top: 0.06, width: 0.44, height: 0.88, align: "left" },
  bottom: { left: 0.08, top: 0.70, width: 0.84, height: 0.28, align: "center" },
  top:    { left: 0.08, top: 0.02, width: 0.84, height: 0.28, align: "center" },
};

export default function PictureBookPanel({ page, pictureBookId, currentPage, totalPages }: Props) {
  const router = useRouter();
  const sentences = page.sentences ?? [];
  const pos = page.textPosition ?? "left";
  const region = REGION[pos];

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgBox, setImgBox] = useState<Box | null>(null);

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const goPrev = () => router.push(hasPrev ? `/picture-books/${pictureBookId}/read/${currentPage - 1}` : `/picture-books`);
  const goNext = () => router.push(hasNext ? `/picture-books/${pictureBookId}/read/${currentPage + 1}` : `/picture-books`);

  // Compute the actual rendered image box inside its container (object-contain
  // letterboxes, so the box is smaller than the container). Overlaying text
  // relative to this box keeps it aligned to the image's real blank area.
  const measure = useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img || !img.naturalWidth) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
    const width = img.naturalWidth * scale;
    const height = img.naturalHeight * scale;
    setImgBox({ left: (cw - width) / 2, top: (ch - height) / 2, width, height });
  }, []);

  useEffect(() => {
    measure();
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [measure, page._id]);

  // Font size scales to the image box so text always fits its blank region.
  const fontPx = imgBox ? Math.max(11, Math.min(imgBox.width, imgBox.height) * 0.045) : 16;

  const overlay = imgBox && (
    <div
      className="absolute overflow-hidden flex flex-wrap content-center"
      style={{
        left: imgBox.left + region.left * imgBox.width,
        top: imgBox.top + region.top * imgBox.height,
        width: region.width * imgBox.width,
        height: region.height * imgBox.height,
        justifyContent: region.align === "center" ? "center" : "flex-start",
      }}
    >
      {sentences.length === 0 ? (
        <p className="italic text-[#a07840]/60 w-full" style={{ fontSize: fontPx, textAlign: region.align }}>{page.rawText}</p>
      ) : (
        sentences.map((s, si) => (
          <div key={s._id ?? si} className={`flex flex-wrap items-end w-full ${region.align === "center" ? "justify-center" : "justify-start"}`}>
            {s.words.map((w, wi) => (
              <PictureBookWord key={wi} word={w} fontPx={fontPx} />
            ))}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full book-font">
      {/* Page header */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-2 border-b border-[#d4b87a]/40">
        <span className="text-sm font-bold text-[#a07840]">{currentPage} ページ</span>
        <div className="flex gap-1.5">
          {[...Array(Math.min(totalPages, 12))].map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i + 1 === currentPage ? "w-3 h-3 bg-[#c8783c]" : "w-2 h-2 bg-[#d4b87a]/40 mt-0.5"
              }`}
            />
          ))}
          {totalPages > 12 && <span className="text-xs text-[#a07840]">…</span>}
        </div>
        <span className="text-sm text-[#a07840]/60">{totalPages} ページ</span>
      </div>

      {/* Full illustration with caption overlaid on its blank area */}
      <div ref={containerRef} className="flex-1 overflow-hidden relative bg-[#efe2c0]">
        {/* Prev */}
        <button
          onClick={goPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-14 bg-[#f5ecd4] hover:bg-[#ead5a8] text-[#6b4423] font-black text-lg rounded-r-2xl border border-l-0 border-[#d4b87a]/60 transition-colors active:scale-95 shadow-md"
        >
          ◀
        </button>

        {page.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={page.imageUrl}
              alt=""
              onLoad={measure}
              className="absolute inset-0 w-full h-full object-contain"
            />
            {overlay}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <span className="text-6xl opacity-30">🖼️</span>
            {sentences.length > 0 && (
              <div className="flex flex-wrap items-end justify-center px-8 max-w-md">
                {sentences.map((s, si) => (
                  <div key={s._id ?? si} className="flex flex-wrap items-end justify-center w-full">
                    {s.words.map((w, wi) => (
                      <PictureBookWord key={wi} word={w} fontPx={20} />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Next */}
        <button
          onClick={goNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-14 bg-[#c8783c] hover:bg-[#b5652b] text-white font-black text-lg rounded-l-2xl transition-colors active:scale-95 shadow-md shadow-[#c8783c]/30"
        >
          ▶
        </button>
      </div>

      {/* Back to library link when out of pages */}
      {!hasNext && (
        <div className="flex-shrink-0 text-center py-1">
          <Link href="/picture-books" className="text-xs text-[#a07840]/50 hover:text-[#a07840] font-bold">
            ← えほんの たな
          </Link>
        </div>
      )}
    </div>
  );
}
