"use client";

import { IConversation, IConversationPage } from "@/types";
import DictionaryPanel from "@/components/reading/DictionaryPanel";
import ConversationScene from "./ConversationScene";
import { useReadingStore } from "@/store/readingStore";

interface ConversationLayoutProps {
  conversation: IConversation;
  page: IConversationPage | null;
  currentPage: number;
}

export default function ConversationLayout({ conversation, page, currentPage }: ConversationLayoutProps) {
  const isMobile = conversation.displayMode === "mobile";

  return (
    <div className="flex h-screen bg-[#1a0a2e]">
      {/* Left: Dictionary Panel — desktop only */}
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

      {/* Right: Scene */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start p-4 gap-2">
        <div
          className="w-full relative"
          style={{ aspectRatio: isMobile ? "3 / 4" : "16 / 9" }}
        >
          <div className="absolute inset-0">
            <ConversationScene
              conversation={conversation}
              page={page}
              currentPage={currentPage}
            />
          </div>
        </div>
      </div>

      {/* Mobile: collapsible dictionary — only visible when a word is selected */}
      <MobileDictionary />
    </div>
  );
}

function MobileDictionary() {
  const { selectedSurface, clearSelection } = useReadingStore();

  if (!selectedSurface) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#1e140a] border-t-2 border-[#c8a96e] rounded-t-3xl shadow-2xl max-h-72 overflow-y-auto">
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
