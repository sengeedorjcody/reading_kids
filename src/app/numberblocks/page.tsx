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

// Interactive stack for subtraction rounds — tapping it pops off the last block.
function PoppableStack({ visible, onPop, size = 30 }: { visible: number; onPop: () => void; size?: number }) {
  if (visible <= 0) {
    return (
      <div className="rounded-lg border-2 border-dashed flex items-center justify-center"
        style={{ width: size + 8, height: size + 8, borderColor: "#cbd5e1" }}>
        <span className="text-gray-300 font-black text-sm">0</span>
      </div>
    );
  }
  const color = colorFor(visible);
  return (
    <button
      onClick={onPop}
      className="flex flex-wrap justify-center gap-1 active:scale-95 transition-all"
      style={{ maxWidth: (size + 4) * 5 }}
    >
      {Array.from({ length: visible }).map((_, i) => {
        const isFace = i === visible - 1;
        return (
          <div key={i}
            className="rounded-md flex items-center justify-center"
            style={{ width: size, height: size, backgroundColor: color, boxShadow: `0 2px 5px ${color}55` }}
          >
            {isFace && (
              <div className="flex flex-col items-center">
                <div className="flex gap-1 mb-0.5">
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff" }} />
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff" }} />
                </div>
                <span className="text-white font-black" style={{ fontSize: 11, lineHeight: 1 }}>{visible}</span>
              </div>
            )}
          </div>
        );
      })}
    </button>
  );
}

interface Tile {
  id: number;
  value: number;
}

type Round =
  | { mode: "add"; target: number; tiles: Tile[] }
  | { mode: "subtract"; start: number; target: number };

function levelConfig(level: number) {
  return {
    targetMax: Math.min(6 + level, 20),
    tileCount: Math.min(6 + Math.floor(level / 3), 9),
    seconds: Math.max(15, 30 - level),
  };
}

function makeAddRound(level: number): Round {
  const cfg = levelConfig(level);
  const target = Math.floor(Math.random() * (cfg.targetMax - 1)) + 2; // 2..targetMax

  const solution: number[] = [];
  let remaining = target;
  while (remaining > 0) {
    const piece = Math.min(remaining, Math.floor(Math.random() * Math.min(remaining, 9)) + 1);
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

  return { mode: "add", target, tiles };
}

function makeSubtractRound(level: number): Round {
  const cfg = levelConfig(level);
  const start = Math.floor(Math.random() * (cfg.targetMax - 2)) + 3; // 3..targetMax
  const removeCount = Math.floor(Math.random() * Math.min(start, 6)) + 1;
  const target = Math.max(start - removeCount, 0);
  return { mode: "subtract", start, target };
}

function makeRound(level: number): Round {
  return Math.random() < 0.5 ? makeAddRound(level) : makeSubtractRound(level);
}

export default function NumberBlocksGame() {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState<Round>(() => makeRound(1));
  const [selected, setSelected] = useState<number[]>([]);
  const [removed, setRemoved] = useState(0);
  const [status, setStatus] = useState<"play" | "won" | "timeout">("play");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => levelConfig(1).seconds);
  const [shake, setShake] = useState(false);
  const { speak } = useSpeech();

  const cfg = levelConfig(level);

  const speakRound = useCallback((r: Round) => {
    if (r.mode === "add") {
      speak(`${JP[r.target] ?? r.target}を つくろう！`);
    } else {
      speak(`${JP[r.start] ?? r.start} から ${JP[r.target] ?? r.target}に しよう`);
    }
  }, [speak]);

  const newRound = useCallback((lvl: number) => {
    const r = makeRound(lvl);
    setRound(r);
    setSelected([]);
    setRemoved(0);
    setStatus("play");
    setTimeLeft(levelConfig(lvl).seconds);
    speakRound(r);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    speakRound(round);
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

  const sum = round.mode === "add"
    ? selected.reduce((s, id) => s + (round.tiles.find((t) => t.id === id)?.value ?? 0), 0)
    : 0;

  const tapTile = (id: number) => {
    if (status !== "play" || round.mode !== "add") return;
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
        return sel;
      }
      return next;
    });
  };

  const popBlock = () => {
    if (status !== "play" || round.mode !== "subtract") return;
    setRemoved((r) => {
      const next = r + 1;
      const visible = round.start - next;
      if (visible === round.target) {
        setScore((s) => s + 10 + level);
        setStatus("won");
        speak("せいかい！");
        return next;
      }
      if (visible < round.target) {
        setShake(true);
        setTimeout(() => { setShake(false); setRemoved(0); }, 400);
        return r;
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

  const visibleCount = round.mode === "subtract" ? round.start - removed : 0;

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg,#fef9c3,#fde68a 40%,#fdba74)" }}>

      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h1 className="text-xl font-black text-gray-800">🧱 Numberblocks · ナンバーブロックス</h1>
          <p className="text-xs text-gray-600 font-bold">
            Level {level} · {round.mode === "add" ? "➕ Add" : "➖ Subtract"} · ⏱ {timeLeft}s
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/70 shadow">
          <span className="text-sm font-black text-orange-600">⭐ {score}</span>
        </div>
      </div>

      {round.mode === "add" ? (
        <>
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
        </>
      ) : (
        <>
          {/* Subtraction: shrink the tower down to the target */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1 py-3">
            <p className="text-xs font-black text-gray-600">たたいて {round.target}こに しよう！ Shrink it to:</p>
            <BlockChar n={round.target} size={22} />
          </div>

          <div className={`flex-1 flex items-center justify-center px-6 ${shake ? "animate-pulse" : ""}`}>
            <PoppableStack visible={visibleCount} onPop={popBlock} size={32} />
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 text-center pb-6 px-4">
            <p className="text-gray-700 font-black text-lg mb-1">{visibleCount}</p>
            <p className="text-gray-600/70 text-xs font-bold">Tap the tower to pop off a block, one at a time</p>
          </div>
        </>
      )}

      {/* Win / Timeout overlay */}
      {(status === "won" || status === "timeout") && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl p-6 text-center shadow-2xl mx-6 max-w-xs">
            <div className="text-5xl mb-2">{status === "won" ? "🎉" : "⏰"}</div>
            <h2 className="text-xl font-black text-gray-800 mb-1">
              {status === "won" ? "Well done!" : "Time's Up!"}
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
