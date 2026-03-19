"use client";

import { IPage } from "@/types";
import DictionaryPanel from "./DictionaryPanel";
import TextPanel from "./TextPanel";
import { useReadingStore } from "@/store/readingStore";

interface ReadingLayoutProps {
  page: IPage;
  bookId: string;
  currentPage: number;
  totalPages: number;
}

export default function ReadingLayout({ page, bookId, currentPage, totalPages }: ReadingLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#2d1f0e]">
      {/* Left: Dictionary Panel — dark warm sidebar */}
      <div className="w-80 flex-shrink-0 hidden md:flex flex-col bg-[#1e140a] border-r border-[#5a3e28]">
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
      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl h-full flex flex-col book-page rounded-2xl overflow-hidden">
          <TextPanel
            page={page}
            bookId={bookId}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      </div>

      {/* Mobile: Dictionary drawer */}
      <MobileDictionaryDrawer />
    </div>
  );
}

function MobileDictionaryDrawer() {
  const { selectedSurface, clearSelection } = useReadingStore();
  if (!selectedSurface) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1e140a] border-t-2 border-[#c8a96e] rounded-t-3xl shadow-2xl z-30 max-h-72 overflow-y-auto">
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="w-12 h-1 bg-[#5a3e28] rounded-full" />
        <button
          onClick={clearSelection}
          className="text-[#c8a96e]/60 hover:text-[#c8a96e] text-lg font-bold leading-none"
        >
          ✕
        </button>
      </div>
      <DictionaryPanel />
    </div>
  );
}
