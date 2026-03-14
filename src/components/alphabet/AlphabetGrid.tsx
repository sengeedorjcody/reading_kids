"use client";

import { KanaChar } from "@/types";
import CharacterCard from "./CharacterCard";

interface AlphabetGridProps {
  kana: KanaChar[];
  title: string;
}

// Row order for display
const ROW_ORDER = ["a", "k", "s", "t", "n", "h", "m", "y", "r", "w", "n2"];
const ROW_LABELS: Record<string, string> = {
  a: "あ行 (A)",
  k: "か行 (K)",
  s: "さ行 (S)",
  t: "た行 (T)",
  n: "な行 (N)",
  h: "は行 (H)",
  m: "ま行 (M)",
  y: "や行 (Y)",
  r: "ら行 (R)",
  w: "わ行 (W)",
  n2: "ん (N)",
};

export default function AlphabetGrid({ kana, title }: AlphabetGridProps) {
  const grouped = ROW_ORDER.reduce<Record<string, KanaChar[]>>((acc, row) => {
    acc[row] = kana.filter((k) => k.row === row);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-700 text-center">{title}</h2>
      {ROW_ORDER.filter((row) => grouped[row]?.length > 0).map((row) => (
        <div key={row}>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 pl-2">
            {ROW_LABELS[row]}
          </h3>
          <div className="grid grid-cols-5 sm:grid-cols-5 gap-3">
            {grouped[row].map((k) => (
              <CharacterCard key={k.char} kana={k} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
