"use client";

import { useEffect } from "react";

interface StrokeOrderModalProps {
  char: string;
  romaji: string;
  onClose: () => void;
}

export default function StrokeOrderModal({ char, romaji, onClose }: StrokeOrderModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const strokeOrderUrl = `https://jisho.org/search/${encodeURIComponent(char)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-pink-100 bg-gradient-to-r from-yellow-50 to-orange-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-orange-200 flex items-center justify-center shadow-sm">
              <span className="text-4xl font-black text-gray-800">{char}</span>
            </div>
            <div>
              <p className="text-2xl font-black text-orange-500">{romaji}</p>
              <p className="text-sm text-gray-400">Stroke order</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-2xl bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors text-lg font-black shadow-sm border border-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Practice grid */}
        <div className="flex flex-col items-center gap-6 px-6 py-8">
          {/* 田字格 practice grid */}
          <div className="relative">
            <svg width="160" height="160" viewBox="0 0 160 160" className="border-2 border-orange-200 rounded-2xl">
              {/* Outer border filled */}
              <rect x="0" y="0" width="160" height="160" fill="#fff9f0" />
              {/* Center cross guides (dashed) */}
              <line x1="80" y1="0" x2="80" y2="160" stroke="#f97316" strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
              <line x1="0" y1="80" x2="160" y2="80" stroke="#f97316" strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
              {/* Diagonal guides (dashed) */}
              <line x1="0" y1="0" x2="160" y2="160" stroke="#f97316" strokeWidth="1" strokeDasharray="4,4" opacity="0.2" />
              <line x1="160" y1="0" x2="0" y2="160" stroke="#f97316" strokeWidth="1" strokeDasharray="4,4" opacity="0.2" />
            </svg>
            {/* Large character overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-8xl font-black text-gray-200 select-none">{char}</span>
            </div>
          </div>

          <p className="text-sm text-center text-gray-400">
            Trace the character in the grid above to practice writing.
          </p>

          {/* External stroke order link */}
          <a
            href={strokeOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-orange-400 hover:bg-orange-500 text-white font-bold text-base transition-colors shadow-md active:scale-95"
          >
            ✏️ View Stroke Order Guide
          </a>
        </div>
      </div>
    </div>
  );
}
