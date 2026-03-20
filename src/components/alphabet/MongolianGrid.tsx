"use client";

import { KanaChar } from "@/types";
import CharacterCard from "./CharacterCard";

interface MongolianGridProps {
  chars: KanaChar[];
}

const SECTIONS = [
  {
    key: "vowels",
    label: "Эгшиг үсэг / Vowels",
    color: "text-green-500",
    divider: "bg-green-200",
    cols: "grid-cols-4 sm:grid-cols-6 md:grid-cols-8",
  },
  {
    key: "consonants1",
    label: "Гийгүүлэгч I / Consonants I",
    color: "text-blue-500",
    divider: "bg-blue-200",
    cols: "grid-cols-4 sm:grid-cols-5 md:grid-cols-10",
  },
  {
    key: "consonants2",
    label: "Гийгүүлэгч II / Consonants II",
    color: "text-purple-500",
    divider: "bg-purple-200",
    cols: "grid-cols-4 sm:grid-cols-5 md:grid-cols-10",
  },
  {
    key: "special",
    label: "Тусгай үсэг / Special Letters",
    color: "text-orange-500",
    divider: "bg-orange-200",
    cols: "grid-cols-4 sm:grid-cols-4",
  },
];

export default function MongolianGrid({ chars }: MongolianGridProps) {
  const grouped = SECTIONS.reduce<Record<string, KanaChar[]>>((acc, s) => {
    acc[s.key] = chars.filter((c) => c.row === s.key);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      <h2 className="text-3xl font-bold text-gray-700 text-center">
        Монгол Цагаан толгой
      </h2>
      <p className="text-center text-gray-500 -mt-6">
        Mongolian Cyrillic Alphabet · 35 үсэг (letters)
      </p>

      {SECTIONS.filter((s) => grouped[s.key]?.length > 0).map((section) => (
        <div key={section.key}>
          {/* Section divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex-1 h-px ${section.divider}`} />
            <span className={`text-sm font-bold uppercase tracking-wider px-2 ${section.color}`}>
              {section.label}
            </span>
            <div className={`flex-1 h-px ${section.divider}`} />
          </div>

          {/* Cards */}
          <div className={`grid ${section.cols} gap-3`}>
            {grouped[section.key].map((c) => (
              <CharacterCard key={c.char} kana={c} speakText={c.char.toLowerCase()} />
            ))}
          </div>
        </div>
      ))}

      {/* Info note */}
      <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-3 text-center">
        <p className="text-green-700 font-medium text-sm">
          🇲🇳 Монгол хэл нь 35 үсэгтэй Кирилл цагаан толгойг ашигладаг.
          <br />
          <span className="text-green-500">
            Mongolian uses a 35-letter Cyrillic alphabet.
          </span>
        </p>
      </div>
    </div>
  );
}
