"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const SIZE = 4;
const MIN_DISTANCE = 3;

type Status = "memorize" | "draw" | "won" | "lost" | "timeout";
type Cell = [number, number];

function key(c: Cell) {
  return `${c[0]},${c[1]}`;
}

function manhattan(a: Cell, b: Cell) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function levelConfig(level: number) {
  return {
    mineCount: Math.min(3 + Math.floor((level - 1) / 2), 8),
    memorizeMs: Math.max(1200, 3000 - (level - 1) * 150),
    drawSeconds: Math.max(15, 40 - (level - 1) * 2),
  };
}

function randomCell(): Cell {
  return [Math.floor(Math.random() * SIZE), Math.floor(Math.random() * SIZE)];
}

function pathExists(start: Cell, finish: Cell, mines: Set<string>): boolean {
  const visited = new Set<string>([key(start)]);
  const queue: Cell[] = [start];
  while (queue.length) {
    const [r, c] = queue.shift()!;
    if (r === finish[0] && c === finish[1]) return true;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= SIZE || nc >= SIZE) continue;
      const k = key([nr, nc]);
      if (visited.has(k) || mines.has(k)) continue;
      visited.add(k);
      queue.push([nr, nc]);
    }
  }
  return false;
}

interface Board {
  start: Cell;
  finish: Cell;
  mines: Set<string>;
}

function generateBoard(mineCount: number): Board {
  for (let attempt = 0; attempt < 300; attempt++) {
    const start = randomCell();
    const finish = randomCell();
    if (key(start) === key(finish)) continue;
    if (manhattan(start, finish) < MIN_DISTANCE) continue;

    const mines = new Set<string>();
    let tries = 0;
    while (mines.size < mineCount && tries < 200) {
      const cell = randomCell();
      const k = key(cell);
      if (k !== key(start) && k !== key(finish)) mines.add(k);
      tries++;
    }
    if (pathExists(start, finish, mines)) return { start, finish, mines };
  }
  return { start: [0, 0], finish: [SIZE - 1, SIZE - 1], mines: new Set() };
}

export default function MineMindConnect() {
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState<Board>(() => generateBoard(levelConfig(1).mineCount));
  const [status, setStatus] = useState<Status>("memorize");
  const [path, setPath] = useState<Cell[]>([board.start]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => levelConfig(1).drawSeconds);
  const [hitMine, setHitMine] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const cfg = levelConfig(level);
  const { start, finish, mines } = board;

  const startLevel = useCallback((lvl: number) => {
    const c = levelConfig(lvl);
    const nextBoard = generateBoard(c.mineCount);
    setBoard(nextBoard);
    setStatus("memorize");
    setPath([nextBoard.start]);
    setTimeLeft(c.drawSeconds);
    setHitMine(null);
  }, []);

  // Memorize → draw phase transition
  useEffect(() => {
    if (status !== "memorize") return;
    const t = setTimeout(() => setStatus("draw"), cfg.memorizeMs);
    return () => clearTimeout(t);
  }, [status, cfg.memorizeMs]);

  // Countdown timer during draw phase
  useEffect(() => {
    if (status !== "draw") return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          setStatus("timeout");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  const cellFromPoint = (clientX: number, clientY: number): Cell | null => {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const cellSize = rect.width / SIZE;
    const col = Math.floor((clientX - rect.left) / cellSize);
    const row = Math.floor((clientY - rect.top) / cellSize);
    if (row < 0 || col < 0 || row >= SIZE || col >= SIZE) return null;
    return [row, col];
  };

  const extendPath = useCallback((cell: Cell) => {
    setPath((p) => {
      const last = p[p.length - 1];
      if (last[0] === cell[0] && last[1] === cell[1]) return p;

      // backtrack to previous cell
      if (p.length >= 2) {
        const prev = p[p.length - 2];
        if (prev[0] === cell[0] && prev[1] === cell[1]) return p.slice(0, -1);
      }

      const isAdjacent = Math.abs(last[0] - cell[0]) + Math.abs(last[1] - cell[1]) === 1;
      if (!isAdjacent) return p;
      if (p.some((c) => c[0] === cell[0] && c[1] === cell[1])) return p;

      const k = key(cell);
      if (mines.has(k)) {
        setHitMine(k);
        setStatus("lost");
        return [...p, cell];
      }

      const next = [...p, cell];
      setScore((s) => s + 10);

      if (cell[0] === finish[0] && cell[1] === finish[1]) {
        setStatus("won");
      }
      return next;
    });
  }, [mines, finish]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (status !== "draw") return;
    const cell = cellFromPoint(e.clientX, e.clientY);
    if (!cell || cell[0] !== start[0] || cell[1] !== start[1]) return;
    setPath([start]);
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const cell = cellFromPoint(e.clientX, e.clientY);
      if (cell) extendPath(cell);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, extendPath]);

  const nextLevel = () => {
    setLevel((l) => l + 1);
    startLevel(level + 1);
  };

  const retry = () => startLevel(level);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  const cellCenter = (r: number, c: number, rect: { width: number }) => {
    const cs = rect.width / SIZE;
    return { x: c * cs + cs / 2, y: r * cs + cs / 2 };
  };
  const rect = gridRef.current?.getBoundingClientRect() ?? { width: 300 };

  return (
    <div className="fixed inset-0 flex flex-col items-center overflow-hidden"
      style={{ background: "radial-gradient(circle at 50% 0%, #1e1b4b, #0f172a 70%)" }}>

      {/* Header */}
      <div className="flex-shrink-0 text-center pt-4 pb-2 px-4">
        <h1 className="text-white font-black text-base tracking-widest">MINEMIND CONNECT</h1>
        <p className="text-cyan-300/70 text-xs font-bold mt-0.5">
          LEVEL {level} {status === "draw" && `| TIMER: ${mm}:${ss}`}
          {status === "memorize" && "| MEMORIZE!"}
        </p>
      </div>

      {/* Grid */}
      <div className="flex-1 flex items-center justify-center w-full px-4">
        <div
          ref={gridRef}
          onPointerDown={onPointerDown}
          className="relative aspect-square w-full max-w-sm touch-none select-none rounded-2xl overflow-hidden"
          style={{ background: "rgba(30,41,59,0.6)", border: "2px solid rgba(56,189,248,0.4)", boxShadow: "0 0 30px rgba(56,189,248,0.15)" }}
        >
          {/* Cells */}
          <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gridTemplateRows: `repeat(${SIZE}, 1fr)` }}>
            {Array.from({ length: SIZE * SIZE }).map((_, i) => {
              const r = Math.floor(i / SIZE), c = i % SIZE;
              const k = `${r},${c}`;
              const isStart = r === start[0] && c === start[1];
              const isFinish = r === finish[0] && c === finish[1];
              const isMine = mines.has(k);
              const showMine = isMine && (status === "memorize" || (status === "lost" && hitMine));
              const inPath = path.some((p) => p[0] === r && p[1] === c);

              return (
                <div
                  key={k}
                  className="flex items-center justify-center"
                  style={{
                    border: "1px solid rgba(56,189,248,0.15)",
                    background: inPath ? "rgba(250,204,21,0.12)" : "transparent",
                  }}
                >
                  {isStart && (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{ background: "#22c55e", boxShadow: "0 0 14px #22c55e" }}>A</div>
                  )}
                  {isFinish && (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{ background: "#f97316", boxShadow: "0 0 14px #f97316" }}>B</div>
                  )}
                  {showMine && <span className="text-2xl opacity-80">💣</span>}
                </div>
              );
            })}
          </div>

          {/* Path line overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {path.slice(1).map((c, i) => {
              const from = cellCenter(path[i][0], path[i][1], rect);
              const to = cellCenter(c[0], c[1], rect);
              return (
                <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={status === "lost" ? "#ef4444" : "#facc15"} strokeWidth={8} strokeLinecap="round" />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 text-center pb-6 px-4">
        <p className="text-white/50 text-xs font-bold">Avoid Hidden Mines! Memorize them first!</p>
        <p className="text-yellow-300 font-black text-sm mt-1">SCORE: {score}</p>
      </div>

      {/* Win / Lose overlay */}
      {(status === "won" || status === "lost" || status === "timeout") && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-3xl p-6 text-center shadow-2xl mx-6 max-w-xs">
            <div className="text-5xl mb-2">
              {status === "won" ? "🎉" : status === "timeout" ? "⏰" : "💥"}
            </div>
            <h2 className="text-xl font-black text-gray-800 mb-1">
              {status === "won" ? "Level Complete!" : status === "timeout" ? "Time's Up!" : "Boom! Hit a mine"}
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
