"use client";

import { useState, useEffect } from "react";
import { IGame } from "@/lib/db/models/Game";

export default function GamesPage() {
  const [games, setGames] = useState<IGame[]>([]);
  const [active, setActive] = useState<IGame | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/games")
      .then((r) => r.json())
      .then((data) => { setGames(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black pb-28">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-3xl font-black text-white">🎮 Games</h1>
        <p className="text-sm text-gray-400 mt-1">Тоглоом сонгоорой · Pick a game to play</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <span className="text-4xl animate-spin">🎮</span>
        </div>
      )}

      {!loading && games.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">🎮</div>
          <p className="font-bold">Тоглоом байхгүй байна</p>
          <p className="text-sm mt-1">Admin хэсгээс нэмнэ үү</p>
        </div>
      )}

      {/* Game grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-4">
        {games.map((game) => (
          <button
            key={game._id}
            onClick={() => setActive(game)}
            className="flex flex-col rounded-3xl overflow-hidden shadow-xl active:scale-95 transition-all hover:shadow-2xl text-left"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {/* Thumbnail */}
            <div className={`w-full aspect-video bg-gradient-to-br ${game.bg} flex items-center justify-center relative`}>
              <span className="text-6xl drop-shadow-lg">{game.emoji}</span>
              <div className="absolute bottom-2 right-2 flex gap-1 flex-wrap justify-end">
                {game.tags?.map((t) => (
                  <span key={t} className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-black/40 text-white/80">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h2 className="text-sm font-black text-white leading-tight">{game.title}</h2>
              <p className="text-[11px] text-gray-400 mt-1 leading-snug line-clamp-2">{game.description}</p>
              <div
                className="mt-2.5 py-1.5 rounded-xl text-center text-xs font-black text-white"
                style={{ background: game.color }}
              >
                ▶ Play
              </div>
            </div>
          </button>
        ))}

        {/* Coming soon placeholder */}
        {!loading && (
          <div
            className="flex flex-col rounded-3xl overflow-hidden opacity-40"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.15)" }}
          >
            <div className="w-full aspect-video flex items-center justify-center">
              <span className="text-5xl">🔜</span>
            </div>
            <div className="p-3">
              <h2 className="text-sm font-black text-white">Coming Soon</h2>
              <p className="text-[11px] text-gray-500 mt-1">More games coming…</p>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen game overlay */}
      {active && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-black/80 border-b border-white/10">
            <button
              onClick={() => setActive(null)}
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-black text-lg active:scale-90 transition-all"
              style={{ background: "rgba(239,68,68,0.3)", border: "1px solid rgba(239,68,68,0.5)" }}
            >
              ✕
            </button>
            <span className="text-lg">{active.emoji}</span>
            <h2 className="text-white font-black text-base flex-1">{active.title}</h2>
            <div className="flex gap-1">
              {active.tags?.map((t) => (
                <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <iframe
            src={active.iframeSrc}
            className="flex-1 w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-pointer-lock"
            allow="camera; microphone; pointer-lock; fullscreen"
            referrerPolicy="no-referrer"
            allowFullScreen
            title={active.title}
          />
        </div>
      )}
    </div>
  );
}
