"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { IPictureBookPage } from "@/types";
import WordToken from "@/components/reading/WordToken";

interface Props {
  page: IPictureBookPage;
  pictureBookId: string;
  currentPage: number;
  totalPages: number;
}

// Where the caption sits, matching wherever the illustration reserved blank space.
const OVERLAY_STYLE: Record<string, React.CSSProperties> = {
  bottom: { bottom: "3%",  left: "50%", transform: "translateX(-50%)",              width: "50%", textAlign: "center" },
  top:    { top: "3%",     left: "50%", transform: "translateX(-50%)",              width: "50%", textAlign: "center" },
  left:   { left: "4%",    top: "50%",  transform: "translateY(-50%)",              width: "42%", textAlign: "left" },
  right:  { right: "4%",   top: "50%",  transform: "translateY(-50%)",              width: "42%", textAlign: "left" },
};

export default function PictureBookPanel({ page, pictureBookId, currentPage, totalPages }: Props) {
  const router = useRouter();
  const sentences = page.sentences ?? [];
  const overlayStyle = OVERLAY_STYLE[page.textPosition ?? "bottom"];

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const goPrev = () => router.push(hasPrev ? `/picture-books/${pictureBookId}/read/${currentPage - 1}` : `/picture-books`);
  const goNext = () => router.push(hasNext ? `/picture-books/${pictureBookId}/read/${currentPage + 1}` : `/picture-books`);

  return (
    <div className="flex flex-col h-full book-font">
      {/* Page header */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-[#d4b87a]/40">
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

      {/* Full-page illustration with text overlaid on its built-in caption area */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-[#efe2c0]">
        {/* Prev */}
        <button
          onClick={goPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-16 bg-[#f5ecd4] hover:bg-[#ead5a8] text-[#6b4423] font-black text-xl rounded-r-2xl border border-l-0 border-[#d4b87a]/60 transition-colors active:scale-95 shadow-md"
        >
          ◀
        </button>

        {page.imageUrl ? (
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={page.imageUrl} alt="" className="w-full h-full object-contain" />

            {/* Caption text — sits over the blank area baked into the illustration */}
            <div
              className="absolute flex flex-wrap items-center gap-1"
              style={{ ...overlayStyle, justifyContent: overlayStyle.textAlign === "center" ? "center" : "flex-start" }}
            >
              {sentences.length === 0 ? (
                <p className="text-base text-[#a07840]/60 italic" style={{ textAlign: overlayStyle.textAlign, width: "100%" }}>{page.rawText}</p>
              ) : (
                sentences.map((s, si) => (
                  <div
                    key={s._id ?? si}
                    className={`flex flex-wrap items-end w-full ${overlayStyle.textAlign === "center" ? "justify-center" : "justify-start"}`}
                  >
                    {s.words.map((w, wi) => (
                      <WordToken key={wi} word={w} />
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <span className="text-6xl opacity-30">🖼️</span>
            {sentences.length > 0 && (
              <div className="flex flex-wrap items-end justify-center px-8">
                {sentences.map((s, si) => (
                  <div key={s._id ?? si} className="flex flex-wrap items-end justify-center w-full">
                    {s.words.map((w, wi) => (
                      <WordToken key={wi} word={w} />
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
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-16 bg-[#c8783c] hover:bg-[#b5652b] text-white font-black text-xl rounded-l-2xl transition-colors active:scale-95 shadow-md shadow-[#c8783c]/30"
        >
          ▶
        </button>
      </div>

      {/* Back to library link when out of pages */}
      {!hasNext && (
        <div className="flex-shrink-0 text-center pb-2">
          <Link href="/picture-books" className="text-xs text-[#a07840]/50 hover:text-[#a07840] font-bold">
            ← えほんの たな
          </Link>
        </div>
      )}
    </div>
  );
}
