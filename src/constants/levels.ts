import { BookLevel } from "@/types";

export const LEVEL_CONFIG: Record<
  BookLevel,
  { label: string; color: string; bg: string; emoji: string }
> = {
  hiragana: {
    label: "Hiragana",
    color: "text-pink-700",
    bg: "bg-pink-100",
    emoji: "🌸",
  },
  katakana: {
    label: "Katakana",
    color: "text-purple-700",
    bg: "bg-purple-100",
    emoji: "⭐",
  },
  beginner: {
    label: "Beginner",
    color: "text-green-700",
    bg: "bg-green-100",
    emoji: "🌱",
  },
  intermediate: {
    label: "Intermediate",
    color: "text-blue-700",
    bg: "bg-blue-100",
    emoji: "🌊",
  },
  advanced: {
    label: "Advanced",
    color: "text-orange-700",
    bg: "bg-orange-100",
    emoji: "🔥",
  },
  N5: { label: "JLPT N5", color: "text-teal-700", bg: "bg-teal-100", emoji: "🎯" },
  N4: { label: "JLPT N4", color: "text-cyan-700", bg: "bg-cyan-100", emoji: "🎯" },
  N3: { label: "JLPT N3", color: "text-indigo-700", bg: "bg-indigo-100", emoji: "🎯" },
};

export const BOOK_LEVELS: BookLevel[] = [
  "hiragana",
  "katakana",
  "beginner",
  "intermediate",
  "advanced",
  "N5",
  "N4",
  "N3",
];
