"use client";

import { IPage } from "@/types";
import DictionaryPanel from "./DictionaryPanel";
import TextPanel from "./TextPanel";
import MobileTextPanel from "./MobileTextPanel";

interface ReadingLayoutProps {
  page: IPage;
  bookId: string;
  currentPage: number;
  totalPages: number;
}

export default function ReadingLayout({ page, bookId, currentPage, totalPages }: ReadingLayoutProps) {
  return (
    <>
      {/* ── Desktop layout ── */}
      <div className="hidden md:flex h-[calc(100vh-64px)] bg-[#2d1f0e]">
        {/* Left: Dictionary sidebar */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-[#1e140a] border-r border-[#5a3e28]">
          <div className="px-5 py-4 border-b border-[#5a3e28]">
            <h2 className="text-sm font-bold text-[#c8a96e] uppercase tracking-wider">
              📖 じしょ · Dictionary
            </h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <DictionaryPanel />
          </div>
        </div>

        {/* Right: Book page */}
        <div className="flex-1 overflow-hidden flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-3xl h-full flex flex-col book-page rounded-2xl overflow-hidden">
            <TextPanel
              page={page}
              bookId={bookId}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="md:hidden flex flex-col min-h-[calc(100vh-64px)] bg-[#2d1f0e]">
        <MobileTextPanel
          page={page}
          bookId={bookId}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </>
  );
}
