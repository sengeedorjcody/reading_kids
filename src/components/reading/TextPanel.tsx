import { IPage } from "@/types";
import SentenceReader from "./SentenceReader";
import Link from "next/link";

interface TextPanelProps {
  page: IPage;
  bookId: string;
  currentPage: number;
  totalPages: number;
}

export default function TextPanel({ page, bookId, currentPage, totalPages }: TextPanelProps) {
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex flex-col h-full book-font">
      {/* Page header — top of paper page */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#d4b87a]/40">
        <span className="text-sm font-bold text-[#a07840]">
          {currentPage} ページ
        </span>
        {/* Page dots */}
        <div className="flex gap-1.5">
          {[...Array(Math.min(totalPages, 12))].map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i + 1 === currentPage
                  ? "w-3 h-3 bg-[#c8783c]"
                  : "w-2 h-2 bg-[#d4b87a]/40 mt-0.5"
              }`}
            />
          ))}
          {totalPages > 12 && <span className="text-xs text-[#a07840]">…</span>}
        </div>
        <span className="text-sm text-[#a07840]/60">
          {totalPages} ページ
        </span>
      </div>

      {/* Reading area with side navigation buttons */}
      <div className="flex-1 overflow-hidden relative flex items-center">
        {/* Left / Prev button */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center">
          {hasPrev ? (
            <Link
              href={`/books/${bookId}/read/${currentPage - 1}`}
              className="flex items-center justify-center w-10 h-16 bg-[#f5ecd4] hover:bg-[#ead5a8] text-[#6b4423] font-black text-xl rounded-r-2xl border border-l-0 border-[#d4b87a]/60 transition-colors active:scale-95 shadow-md"
            >
              ◀
            </Link>
          ) : (
            <Link
              href={`/books/${bookId}`}
              className="flex items-center justify-center w-10 h-16 bg-[#f5ecd4] hover:bg-[#ead5a8] text-[#6b4423] font-black text-xl rounded-r-2xl border border-l-0 border-[#d4b87a]/60 transition-colors shadow-md"
            >
              ←
            </Link>
          )}
        </div>

        {/* Reading content */}
        <div className="flex-1 overflow-hidden px-14 md:px-16 py-6 flex flex-col h-full">
          <SentenceReader sentences={page.sentences} rawText={page.rawText} />
        </div>

        {/* Right / Next button */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center">
          {hasNext ? (
            <Link
              href={`/books/${bookId}/read/${currentPage + 1}`}
              className="flex items-center justify-center w-10 h-16 bg-[#c8783c] hover:bg-[#b5652b] text-white font-black text-xl rounded-l-2xl transition-colors active:scale-95 shadow-md shadow-[#c8783c]/30"
            >
              ▶
            </Link>
          ) : (
            <Link
              href="/books"
              className="flex items-center justify-center w-10 h-16 bg-[#4a7c59] hover:bg-[#3d6649] text-white font-black text-lg rounded-l-2xl transition-colors shadow-md shadow-[#4a7c59]/30"
            >
              🎉
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
