"use client";

import { IPage } from "@/types";
import SentenceReader from "./SentenceReader";
import Link from "next/link";

interface TextPanelProps {
  page: IPage;
  bookId: string;
  currentPage: number;
  totalPages: number;
  showDict?: boolean;
  onToggleDict?: () => void;
}

export default function TextPanel({ page, bookId, currentPage, totalPages, showDict, onToggleDict }: TextPanelProps) {
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex flex-col h-full book-font">
      {/* Page header — top of paper page */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#d4b87a]/40 gap-2">
        {/* Prev page or Back */}
        {hasPrev ? (
          <Link
            href={`/books/${bookId}/read/${currentPage - 1}`}
            className="flex items-center gap-1.5 bg-[#f5ecd4] hover:bg-[#ead5a8] text-[#6b4423] font-bold py-1.5 px-3 rounded-xl text-sm transition-colors border border-[#d4b87a]/60 active:scale-95 whitespace-nowrap"
          >
            ◀ まえ
          </Link>
        ) : (
          <Link
            href={`/books/${bookId}`}
            className="flex items-center gap-1.5 bg-[#f5ecd4] hover:bg-[#ead5a8] text-[#6b4423] font-bold py-1.5 px-3 rounded-xl text-sm transition-colors border border-[#d4b87a]/60 whitespace-nowrap"
          >
            ← もどる
          </Link>
        )}

        {/* Page dots */}
        <div className="flex gap-1.5 items-center flex-1 justify-center">
          {[...Array(Math.min(totalPages, 12))].map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i + 1 === currentPage
                  ? "w-2.5 h-2.5 bg-[#c8783c]"
                  : "w-1.5 h-1.5 bg-[#d4b87a]/40 mt-0.5"
              }`}
            />
          ))}
          {totalPages > 12 && <span className="text-xs text-[#a07840]">…</span>}
        </div>

        {/* Right side: Next/Finish + Dict toggle */}
        <div className="flex items-center gap-2">
          {hasNext ? (
            <Link
              href={`/books/${bookId}/read/${currentPage + 1}`}
              className="flex items-center gap-1.5 bg-[#c8783c] hover:bg-[#b5652b] text-white font-bold py-1.5 px-3 rounded-xl text-sm transition-colors active:scale-95 shadow-md shadow-[#c8783c]/30 whitespace-nowrap"
            >
              つぎ ▶
            </Link>
          ) : (
            <Link
              href="/books"
              className="flex items-center gap-1.5 bg-[#4a7c59] hover:bg-[#3d6649] text-white font-bold py-1.5 px-3 rounded-xl text-sm transition-colors shadow-md shadow-[#4a7c59]/30 whitespace-nowrap"
            >
              よみおわり 🎉
            </Link>
          )}

          {/* Dictionary toggle */}
          {onToggleDict && (
            <button
              onClick={onToggleDict}
              className="text-lg bg-[#1e140a] hover:bg-[#2d1f0e] text-[#c8a96e] font-bold py-1.5 px-2.5 rounded-xl transition-colors border border-[#5a3e28]"
              title={showDict ? "Close dictionary" : "Open dictionary"}
            >
              📖
            </button>
          )}
        </div>
      </div>

      {/* Reading area */}
      <div className="flex-1 overflow-hidden px-6 md:px-12 py-4 flex flex-col">
        <SentenceReader sentences={page.sentences} rawText={page.rawText} />
      </div>
    </div>
  );
}
