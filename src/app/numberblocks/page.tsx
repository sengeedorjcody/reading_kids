"use client";

import { useState, useEffect, useCallback } from "react";
import { useSpeech } from "@/hooks/useSpeech";

// ── Japanese number words (for TTS) ─────────────────────────────────────────
const JP = [
  "ぜろ","いち","に","さん","よん","ご","ろく","なな","はち","きゅう","じゅう",
  "じゅういち","じゅうに","じゅうさん","じゅうよん","じゅうご",
  "じゅうろく","じゅうなな","じゅうはち","じゅうきゅう","にじゅう",
];

// Each number has its own signature color, just like the Numberblocks show.
const NUMBER_COLORS = [
  "#94a3b8", "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#64748b", "#d946ef", "#f59e0b",
  "#06b6d4", "#a855f7", "#84cc16", "#f43f5e", "#0ea5e9",
  "#c026d3", "#65a30d", "#e11d48", "#0d9488", "#facc15",
];

function colorFor(n: number) {
  return NUMBER_COLORS[Math.min(n, NUMBER_COLORS.length - 1)];
}

function BlockChar({ n, dim, size = 26 }: { n: number; dim?: boolean; size?: number }) {
  if (n === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed flex items-center justify-center flex-shrink-0"
        style={{ width: size + 8, height: size + 8, borderColor: "#cbd5e1" }}>
        <span className="text-gray-300 font-black text-sm">0</span>
      </div>
    );
  }
  const color = colorFor(n);
  return (
    <div className="flex flex-wrap justify-center gap-1" style={{ maxWidth: (size + 4) * 5 }}>
      {Array.from({ length: n }).map((_, i) => {
        const isFace = i === n - 1;
        return (
          <div key={i}
            className="rounded-md flex items-center justify-center transition-all"
            style={{
              width: size, height: size,
              backgroundColor: dim ? "#e2e8f0" : color,
              opacity: dim ? 0.5 : 1,
              boxShadow: dim ? "none" : `0 2px 5px ${color}55`,
            }}
          >
            {isFace && !dim && (
              <div className="flex flex-col items-center">
                <div className="flex gap-1 mb-0.5">
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff" }} />
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff" }} />
                </div>
                <span className="text-white font-black" style={{ fontSize: 11, lineHeight: 1 }}>{n}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface Tile {
  id: number;
  value: number;
}

function levelConfig(level: number) {
  return {
    targetMax: Math.min(6 + level, 20),
    tileCount: Math.min(6 + Math.floor(level / 3), 9),
    seconds: Math.max(15, 30 - level),
  };
}

function makeRound(level: number): { target: number; tiles: Tile[] } {
  const cfg = levelConfig(level);
  const target = Math.floor(Math.random() * (cfg.targetMax - 1)) + 2; // 2..targetMax

  // Build a guaranteed solution (2-3 tiles summing to target)
  const solution: number[] = [];
  let remaining = target;
  while (remaining > 0) {
    const piece = remaining <= 9 && (solution.length >= 1 || remaining <= 9)
      ? Math.min(remaining, Math.floor(Math.random() * Math.min(remaining, 9)) + 1)
      : Math.floor(Math.random() * 9) + 1;
    solution.push(piece);
    remaining -= piece;
    if (solution.length >= 3) { solution[solution.length - 1] += remaining; remaining = 0; }
  }

  const values = [...solution];
  while (values.length < cfg.tileCount) {
    values.push(Math.floor(Math.random() * 9) + 1);
  }

  const tiles: Tile[] = values
    .sort(() => Math.random() - 0.5)
    .map((value, i) => ({ id: i, value }));

  return { target, tiles };
}

export default function NumberBlocksGame() {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(() => makeRound(1));
  const [selected, setSelected] = useState<number[]>([]);
  const [status, setStatus] = useState<"play" | "won" | "timeout">("play");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => levelConfig(1).seconds);
  const [shake, setShake] = useState(false);
  const { speak } = useSpeech();

  const cfg = levelConfig(level);
  const sum = selected.reduce((s, id) => {
    const tile = round.tiles.find((t) => t.id === id);
    return s + (tile?.value ?? 0);
  }, 0);

  const newRound = useCallback((lvl: number) => {
    const r = makeRound(lvl);
    setRound(r);
    setSelected([]);
    setStatus("play");
    setTimeLeft(levelConfig(lvl).seconds);
    speak(`${JP[r.target] ?? r.target}を つくろう！`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    speak(`${JP[round.target] ?? round.target}を つくろう！`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown
  useEffect(() => {
    if (status !== "play") return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) { setStatus("timeout"); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  const tapTile = (id: number) => {
    if (status !== "play") return;
    setSelected((sel) => {
      if (sel.includes(id)) return sel.filter((x) => x !== id);
      const next = [...sel, id];
      const nextSum = next.reduce((s, tid) => s + (round.tiles.find((t) => t.id === tid)?.value ?? 0), 0);

      if (nextSum === round.target) {
        setScore((s) => s + 10 + level);
        setStatus("won");
        speak("せいかい！");
      } else if (nextSum > round.target) {
        setShake(true);
        setTimeout(() => { setShake(false); setSelected([]); }, 400);
        return sel; // ignore this tap's selection, shake shows the mistake
      }
      return next;
    });
  };

  const nextLevel = () => {
    const l = level + 1;
    setLevel(l);
    newRound(l);
  };

  const retry = () => newRound(level);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg,#fef9c3,#fde68a 40%,#fdba74)" }}>

      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h1 className="text-xl font-black text-gray-800">🧱 ナンバーブロックス</h1>
          <p className="text-xs text-gray-600 font-bold">Level {level} · ⏱ {timeLeft}s</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/70 shadow">
          <span className="text-sm font-black text-orange-600">⭐ {score}</span>
        </div>
      </div>

      {/* Target */}
      <div className="flex-shrink-0 flex flex-col items-center gap-2 py-3">
        <p className="text-xs font-black text-gray-600">この数字をつくろう！ Build this number:</p>
        <BlockChar n={round.target} size={30} />
      </div>

      {/* Running sum */}
      <div className={`flex-shrink-0 flex items-center justify-center gap-2 py-2 transition-transform ${shake ? "animate-pulse" : ""}`}>
        <span className="text-sm font-black text-gray-500">=</span>
        {sum > 0
          ? <BlockChar n={sum} size={24} dim={sum > round.target} />
          : <span className="text-gray-400 font-black text-sm">0</span>
        }
      </div>

      {/* Tile palette */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="grid grid-cols-3 gap-4 max-w-xs w-full">
          {round.tiles.map((tile) => {
            const isSelected = selected.includes(tile.id);
            return (
              <button
                key={tile.id}
                onClick={() => tapTile(tile.id)}
                disabled={status !== "play"}
                className="aspect-square rounded-2xl flex items-center justify-center transition-all active:scale-90"
                style={{
                  background: isSelected ? colorFor(tile.value) : "#fff",
                  border: `3px solid ${isSelected ? colorFor(tile.value) : "rgba(0,0,0,0.08)"}`,
                  boxShadow: isSelected ? `0 4px 14px ${colorFor(tile.value)}66` : "0 2px 8px rgba(0,0,0,0.06)",
                  transform: isSelected ? "scale(1.05)" : undefined,
                }}
              >
                <span className="font-black text-2xl" style={{ color: isSelected ? "#fff" : "#1e293b" }}>
                  {tile.value}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 text-center pb-6 px-4">
        <p className="text-gray-600/70 text-xs font-bold">Tap blocks whose sum equals the target number</p>
      </div>

      {/* Win / Timeout overlay */}
      {(status === "won" || status === "timeout") && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl p-6 text-center shadow-2xl mx-6 max-w-xs">
            <div className="text-5xl mb-2">{status === "won" ? "🎉" : "⏰"}</div>
            <h2 className="text-xl font-black text-gray-800 mb-1">
              {status === "won" ? "よくできました！" : "Time's Up!"}
            </h2>
            <p className="text-sm text-gray-500 mb-4">Score: {score}</p>
            <button
              onClick={status === "won" ? nextLevel : retry}
              className="w-full py-3 rounded-2xl font-black text-white active:scale-95"
              style={{ background: status === "won" ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#f97316,#ea580c)" }}
            >
              {status === "won" ? `▶ Level ${level + 1}` : "🔄 Retry"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
