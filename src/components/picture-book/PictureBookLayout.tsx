"use client";

import { useEffect, useState } from "react";
import { IPictureBookPage } from "@/types";
import DictionaryPanel from "@/components/reading/DictionaryPanel";
import PictureBookPanel from "./PictureBookPanel";
import { useReadingStore } from "@/store/readingStore";

interface Props {
  page: IPictureBookPage;
  pictureBookId: string;
  currentPage: number;
  totalPages: number;
}

export default function PictureBookLayout({ page, pictureBookId, currentPage, totalPages }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [landscapeRead, setLandscapeRead] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 899px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="flex flex-1 bg-[#2d1f0e] overflow-hidden relative">
      {/* Left: Dictionary Panel — dark warm sidebar (desktop) */}
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

      {/* Landscape-read toggle (mobile only) */}
      {isMobile && (
        <button
          onClick={() => setLandscapeRead((v) => !v)}
          className="absolute top-3 right-3 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg active:scale-95 transition-all"
          style={{ background: landscapeRead ? "#c8783c" : "rgba(255,255,255,0.15)", color: "#fff" }}
        >
          🔄 {landscapeRead ? "たてに もどす" : "よこに して よむ"}
        </button>
      )}

      {/* Right: Picture book spread */}
      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center p-2 md:p-8">
        <LandscapeWrapper active={isMobile && landscapeRead}>
          <div className="w-full max-w-4xl h-full flex flex-col book-page rounded-2xl overflow-hidden">
            <PictureBookPanel
              page={page}
              pictureBookId={pictureBookId}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        </LandscapeWrapper>
      </div>

      {/* Mobile: Dictionary drawer */}
      <MobileDictionaryDrawer />
    </div>
  );
}

// Rotates its children 90° to fill the viewport landscape-style — works on iOS
// Safari too, unlike the Screen Orientation Lock API which it doesn't support.
function LandscapeWrapper({ active, children }: { active: boolean; children: React.ReactNode }) {
  if (!active) return <>{children}</>;
  return (
    <div
      className="fixed z-30"
      style={{
        top: "50%",
        left: "50%",
        width: "100vh",
        height: "100vw",
        transform: "translate(-50%, -50%) rotate(90deg)",
      }}
    >
      {children}
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
