"use client";

import { IConversation, IConversationPage } from "@/types";
import DictionaryPanel from "@/components/reading/DictionaryPanel";
import ConversationScene from "./ConversationScene";

interface ConversationLayoutProps {
  conversation: IConversation;
  page: IConversationPage | null;
  currentPage: number;
}

export default function ConversationLayout({ conversation, page, currentPage }: ConversationLayoutProps) {
  const isMobile = conversation.displayMode === 'mobile';
  const sceneWidth = isMobile ? 'max-w-sm' : 'max-w-4xl';

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#1a0a2e]">
      {/* Left: Dictionary Panel */}
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
      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center p-4">
        <div className={`w-full ${sceneWidth} h-full`}>
          <ConversationScene
            conversation={conversation}
            page={page}
            currentPage={currentPage}
          />
        </div>
      </div>

      {/* Mobile Dictionary at bottom */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 bg-[#1e140a] border-t-2 border-[#c8a96e] rounded-t-3xl shadow-2xl z-10 max-h-64 overflow-y-auto">
        <div className="w-12 h-1 bg-[#5a3e28] rounded-full mx-auto mt-3 mb-2" />
        <DictionaryPanel />
      </div>
    </div>
  );
}
