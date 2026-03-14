import Image from "next/image";
import { IDictionaryWord } from "@/types";
import AudioButton from "./AudioButton";

interface WordCardProps {
  word: IDictionaryWord;
  compact?: boolean;
}

export default function WordCard({ word, compact = false }: WordCardProps) {
  if (compact) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-100 flex items-center gap-4">
        {word.example_image_url && (
          <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
            <Image src={word.example_image_url} alt={word.japanese_word} fill className="object-cover" sizes="48px" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-800">{word.japanese_word}</span>
            {word.hiragana && word.hiragana !== word.japanese_word && (
              <span className="text-sm text-gray-400">{word.hiragana}</span>
            )}
          </div>
          {word.romaji && <p className="text-sm text-blue-500 font-medium">{word.romaji}</p>}
          {word.english_meaning && <p className="text-sm text-gray-600">{word.english_meaning}</p>}
        </div>
        <AudioButton text={word.japanese_word} audioUrl={word.pronunciation_audio_url} size="sm" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-pink-50">
      {/* Image */}
      {word.example_image_url && (
        <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4">
          <Image
            src={word.example_image_url}
            alt={word.japanese_word}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      )}

      {/* Main word */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h2 className="text-5xl font-bold text-gray-800">{word.japanese_word}</h2>
          {word.hiragana && word.hiragana !== word.japanese_word && (
            <p className="text-2xl text-pink-400 mt-1">{word.hiragana}</p>
          )}
        </div>
        <AudioButton text={word.japanese_word} audioUrl={word.pronunciation_audio_url} size="lg" />
      </div>

      {/* Romaji */}
      {word.romaji && (
        <p className="text-xl text-blue-500 font-bold mb-4 italic">{word.romaji}</p>
      )}

      {/* Meanings */}
      <div className="space-y-2">
        {word.english_meaning && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇬🇧</span>
            <span className="text-xl font-medium text-gray-700">{word.english_meaning}</span>
          </div>
        )}
        {word.mongolian_meaning && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇲🇳</span>
            <span className="text-xl font-medium text-gray-700">{word.mongolian_meaning}</span>
          </div>
        )}
      </div>

      {/* Example sentence */}
      {word.example_sentence && (
        <div className="mt-4 p-3 bg-pink-50 rounded-2xl">
          <p className="text-xs text-gray-500 font-medium mb-1">Example:</p>
          <p className="text-lg text-gray-700">{word.example_sentence}</p>
          {word.example_sentence_reading && (
            <p className="text-sm text-gray-400 mt-1">{word.example_sentence_reading}</p>
          )}
        </div>
      )}
    </div>
  );
}
