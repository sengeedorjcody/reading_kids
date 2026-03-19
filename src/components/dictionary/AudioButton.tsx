"use client";

import { useSpeech } from "@/hooks/useSpeech";

interface AudioButtonProps {
  text: string;
  audioUrl?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

const sizeMap = {
  xs: "text-base px-2 py-1",
  sm: "text-xl px-3 py-2",
  md: "text-2xl px-4 py-3",
  lg: "text-4xl px-6 py-4",
};

export default function AudioButton({ text, audioUrl, size = "md" }: AudioButtonProps) {
  const { speak } = useSpeech();

  return (
    <button
      onClick={(e) => { e.stopPropagation(); speak(text, audioUrl); }}
      className={`${sizeMap[size]} bg-yellow-400 hover:bg-yellow-500 rounded-2xl font-bold transition-all duration-200 active:scale-90 shadow-md`}
      title="Click to hear pronunciation"
    >
      🔊
    </button>
  );
}
