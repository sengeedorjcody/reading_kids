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
  forceRow?: boolean;
}

export default function PictureBookPanel({ page, pictureBookId, currentPage, totalPages, forceRow }: Props) {
  const router = useRouter();
  const sentences = page.sentences ?? [];

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

      {/* Two-page spread */}
      <div className="flex-1 overflow-hidden relative flex items-center">
        {/* Prev */}
        <button
          onClick={goPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-16 bg-[#f5ecd4] hover:bg-[#ead5a8] text-[#6b4423] font-black text-xl rounded-r-2xl border border-l-0 border-[#d4b87a]/60 transition-colors active:scale-95 shadow-md"
        >
          ◀
        </button>

        <div className={`flex-1 h-full flex ${forceRow ? "flex-row" : "flex-col md:flex-row"}`}>
          {/* Left/top: text page */}
          <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-wrap content-center items-start justify-center bg-[#faf3e0]">
            {sentences.length === 0 ? (
              <p className="text-lg text-[#a07840]/50 italic">{page.rawText || "このページはからです。"}</p>
            ) : (
              sentences.map((s, si) => (
                <div key={s._id ?? si} className="flex flex-wrap items-end w-full justify-center">
                  {s.words.map((w, wi) => (
                    <WordToken key={wi} word={w} />
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Right/bottom: illustration */}
          <div className="flex-1 relative bg-[#efe2c0] min-h-[40%]">
            {page.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={page.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">🖼️</div>
            )}
          </div>
        </div>

        {/* Next */}
        <button
          onClick={goNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-16 bg-[#c8783c] hover:bg-[#b5652b] text-white font-black text-xl rounded-l-2xl transition-colors active:scale-95 shadow-md shadow-[#c8783c]/30"
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
