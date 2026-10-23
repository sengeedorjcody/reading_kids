import { ISentence } from "@/types";
import WordToken from "./WordToken";

interface SentenceDisplayProps {
  sentence: ISentence;
  index: number;
}

export default function SentenceDisplay({ sentence }: SentenceDisplayProps) {
  // Plain text fallback (no words)
  if (!sentence.words || sentence.words.length === 0) {
    return (
      <p className="text-lg md:text-2xl leading-relaxed text-[#2d1f0e] text-center py-1 book-font font-bold">
        {sentence.text}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-end justify-center gap-0 py-1">
      {sentence.words.map((word, i) => (
        <WordToken key={`${word.surface}-${i}`} word={word} />
      ))}
    </div>
  );
}
