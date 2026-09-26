export interface ScatterSlot {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  rotate: number; // degrees
}

// Distributes `count` items across a grid sized so it always has at least
// `count` cells (cols = ceil(sqrt(count)), rows = ceil(count/cols) — always
// rows*cols >= count), then jitters each item within its cell so the
// layout still reads as "randomly scattered" rather than a rigid grid.
export function buildScatterLayout(count: number): ScatterSlot[] {
  if (count <= 0) return [];
  const cols = Math.max(3, Math.ceil(Math.sqrt(count)));
  const rows = Math.ceil(count / cols);
  const cellW = 88 / cols;
  const cellH = 80 / rows;

  const cells: ScatterSlot[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        x: 6 + c * cellW + cellW * 0.15 + Math.random() * cellW * 0.7,
        y: 10 + r * cellH + cellH * 0.15 + Math.random() * cellH * 0.7,
        rotate: (Math.random() - 0.5) * 14,
      });
    }
  }

  return cells.sort(() => Math.random() - 0.5).slice(0, count);
}
