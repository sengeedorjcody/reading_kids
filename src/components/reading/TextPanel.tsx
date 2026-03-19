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

      {/* Reading area */}
      <div className="flex-1 overflow-hidden px-6 md:px-12 py-6 flex flex-col">
        <SentenceReader sentences={page.sentences} rawText={page.rawText} />
      </div>

      {/* Page navigation — bottom of paper */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-[#d4b87a]/40">
        {hasPrev ? (
          <Link
            href={`/books/${bookId}/read/${currentPage - 1}`}
            className="flex items-center gap-2 bg-[#f5ecd4] hover:bg-[#ead5a8] text-[#6b4423] font-bold py-2.5 px-5 rounded-xl text-base transition-colors border border-[#d4b87a]/60 active:scale-95"
          >
            ◀ まえのページ
          </Link>
        ) : (
          <Link
            href={`/books/${bookId}`}
            className="flex items-center gap-2 bg-[#f5ecd4] hover:bg-[#ead5a8] text-[#6b4423] font-bold py-2.5 px-5 rounded-xl text-base transition-colors border border-[#d4b87a]/60"
          >
            ← もどる
          </Link>
        )}

        {/* Current page kanji number */}
        <div className="text-center">
          <div className="text-2xl font-black text-[#8b5e2e]">{currentPage}</div>
          <div className="text-xs text-[#a07840]/60">ページ</div>
        </div>

        {hasNext ? (
          <Link
            href={`/books/${bookId}/read/${currentPage + 1}`}
            className="flex items-center gap-2 bg-[#c8783c] hover:bg-[#b5652b] text-white font-bold py-2.5 px-5 rounded-xl text-base transition-colors active:scale-95 shadow-md shadow-[#c8783c]/30"
          >
            つぎのページ ▶
          </Link>
        ) : (
          <Link
            href="/books"
            className="flex items-center gap-2 bg-[#4a7c59] hover:bg-[#3d6649] text-white font-bold py-2.5 px-5 rounded-xl text-base transition-colors shadow-md shadow-[#4a7c59]/30"
          >
            よみおわり 🎉
          </Link>
        )}
      </div>
    </div>
  );
}
