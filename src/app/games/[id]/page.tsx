"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IGame } from "@/lib/db/models/Game";

export default function GamePlayPage({ params }: { params: { id: string } }) {
  const [game, setGame] = useState<IGame | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/games")
      .then((r) => r.json())
      .then((games: IGame[]) => {
        const found = games.find((g) => g._id === params.id);
        if (found) setGame(found);
        else router.replace("/games");
      });
  }, [params.id, router]);

  if (!game) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <span className="text-4xl animate-spin">🎮</span>
      </div>
    );
  }

  // Internal games are our own same-origin pages — either a relative path
  // ("/animal-match") or a full URL that happens to point at this same site
  // (some were added via admin by pasting the whole address). Sandboxing them
  // provides no real security benefit and is known to silently break the Web
  // Speech API (no sound, no error) inside sandboxed iframes on iOS Safari —
  // only sandbox truly external content (e.g. Higgsfield's absolute URLs).
  const isInternal =
    game.iframeSrc.startsWith("/") ||
    (typeof window !== "undefined" && game.iframeSrc.startsWith(window.location.origin));

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-black/80 border-b border-white/10">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-black text-lg active:scale-90 transition-all"
          style={{ background: "rgba(239,68,68,0.3)", border: "1px solid rgba(239,68,68,0.5)" }}
        >
          ✕
        </button>
        <span className="text-lg">{game.emoji}</span>
        <h2 className="text-white font-black text-base flex-1">{game.title}</h2>
        <div className="flex gap-1">
          {game.tags?.map((t) => (
            <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/60">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Game iframe */}
      <iframe
        src={game.iframeSrc}
        className="flex-1 w-full border-0 bg-white"
        {...(isInternal ? {} : { sandbox: "allow-scripts allow-same-origin allow-pointer-lock" })}
        allow="camera; microphone; pointer-lock; fullscreen; autoplay"
        referrerPolicy="no-referrer"
        allowFullScreen
        title={game.title}
      />
    </div>
  );
}
