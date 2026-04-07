"use client";

import { KanaChar } from "@/types";
import CharacterCard from "./CharacterCard";

interface AlphabetGridProps {
  kana: KanaChar[];
  title: string;
}

// Basic row order and labels
const BASIC_ROWS = ["a", "k", "s", "t", "n", "h", "m", "y", "r", "w", "n2"];
const VOICED_ROWS = ["g", "z", "d", "b", "p"];
const COMBO_ROW = "combo";

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
  g: "が行 (G)",
  z: "ざ行 (Z)",
  d: "だ行 (D)",
  b: "ば行 (B)",
  p: "ぱ行 (P)",
};

export default function AlphabetGrid({ kana, title }: AlphabetGridProps) {
  const grouped = [...BASIC_ROWS, ...VOICED_ROWS, COMBO_ROW].reduce<Record<string, KanaChar[]>>(
    (acc, row) => {
      acc[row] = kana.filter((k) => k.row === row);
      return acc;
    },
    {}
  );

  const hasVoiced = VOICED_ROWS.some((r) => grouped[r]?.length > 0);
  const hasCombos = grouped[COMBO_ROW]?.length > 0;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-700 text-center">{title}</h2>

      {/* Basic rows */}
      {BASIC_ROWS.filter((row) => grouped[row]?.length > 0).map((row) => (
        <div key={row}>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 pl-2">
            {ROW_LABELS[row]}
          </h3>
          <div className="grid grid-cols-5 sm:grid-cols-5 gap-3">
            {grouped[row].map((k) => (
              <CharacterCard key={k.char} kana={k} speakText={k.romaji} />
            ))}
          </div>
        </div>
      ))}

      {/* Voiced / dakuten section */}
      {hasVoiced && (
        <div>
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-orange-200" />
            <span className="text-sm font-bold text-orange-400 uppercase tracking-wider px-2">
              だくてん / Voiced
            </span>
            <div className="flex-1 h-px bg-orange-200" />
          </div>
          <div className="space-y-6">
            {VOICED_ROWS.filter((row) => grouped[row]?.length > 0).map((row) => (
              <div key={row}>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 pl-2">
                  {ROW_LABELS[row]}
                </h3>
                <div className="grid grid-cols-5 sm:grid-cols-5 gap-3">
                  {grouped[row].map((k) => (
                    <CharacterCard key={k.char} kana={k} speakText={k.romaji} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Combination characters */}
      {hasCombos && (
        <div>
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-purple-200" />
            <span className="text-sm font-bold text-purple-400 uppercase tracking-wider px-2">
              くみあわせ / Combinations
            </span>
            <div className="flex-1 h-px bg-purple-200" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {grouped[COMBO_ROW].map((k) => (
              <CharacterCard key={k.char} kana={k} speakText={k.romaji} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
