"use client";

import { IPage } from "@/types";
import Link from "next/link";
import SentenceReader from "./SentenceReader";
import DictionaryPanel from "./DictionaryPanel";
import { useReadingStore } from "@/store/readingStore";

interface MobileTextPanelProps {
  page: IPage;
  bookId: string;
  currentPage: number;
  totalPages: number;
}

export default function MobileTextPanel({ page, bookId, currentPage, totalPages }: MobileTextPanelProps) {
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const { selectedSurface } = useReadingStore();

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Nav buttons — always visible at top */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1e140a] border-b border-[#5a3e28]">
        {hasPrev ? (
          <Link
            href={`/books/${bookId}/read/${currentPage - 1}`}
            className="flex items-center gap-1.5 bg-[#3d2a18] hover:bg-[#5a3e28] text-[#c8a96e] font-bold py-2 px-4 rounded-xl text-sm transition-colors border border-[#5a3e28] active:scale-95"
          >
            ◀ まえ
          </Link>
        ) : (
          <Link
            href={`/books/${bookId}`}
            className="flex items-center gap-1.5 bg-[#3d2a18] hover:bg-[#5a3e28] text-[#c8a96e] font-bold py-2 px-4 rounded-xl text-sm transition-colors border border-[#5a3e28]"
          >
            ← もどる
          </Link>
        )}

        {/* Page indicator */}
        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            {[...Array(Math.min(totalPages, 9))].map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i + 1 === currentPage
                    ? "w-2.5 h-2.5 bg-[#c8783c]"
                    : "w-1.5 h-1.5 bg-[#5a3e28] mt-0.5"
                }`}
              />
            ))}
            {totalPages > 9 && <span className="text-xs text-[#c8a96e]/40">…</span>}
          </div>
          <span className="text-xs text-[#c8a96e]/50 mt-0.5">{currentPage}/{totalPages}</span>
        </div>

        {hasNext ? (
          <Link
            href={`/books/${bookId}/read/${currentPage + 1}`}
            className="flex items-center gap-1.5 bg-[#c8783c] hover:bg-[#b5652b] text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors active:scale-95 shadow-md shadow-[#c8783c]/30"
          >
            つぎ ▶
          </Link>
        ) : (
          <Link
            href="/books"
            className="flex items-center gap-1.5 bg-[#4a7c59] hover:bg-[#3d6649] text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors shadow-md"
          >
            おわり 🎉
          </Link>
        )}
      </div>

      {/* Book text — paper card */}
      <div className="mx-3 mt-3 book-page rounded-2xl overflow-hidden book-font">
        <div className="px-6 py-6">
          <SentenceReader sentences={page.sentences} rawText={page.rawText} />
        </div>
      </div>

      {/* Dictionary — inline below text, only when word selected */}
      {selectedSurface ? (
        <div className="mx-3 mt-3 mb-4 bg-[#1e140a] rounded-2xl border border-[#5a3e28] overflow-hidden">
          <div className="px-4 pt-3 pb-1 border-b border-[#5a3e28] flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#c8a96e] uppercase tracking-wider">📖 じしょ</h2>
          </div>
          <DictionaryPanel />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
          <div className="text-3xl">👆</div>
          <p className="text-xs font-bold text-[#c8a96e]/60">ことばをクリックしてね</p>
          <p className="text-xs text-[#c8a96e]/30">Click any word to look up</p>
        </div>
      )}
    </div>
  );
}
