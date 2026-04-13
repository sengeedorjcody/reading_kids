"use client";

import Link from "next/link";
import {
  IConversation,
  IConversationPage,
  IConversationCharacterSlot,
  ICharacter,
  ITextSlot,
} from "@/types";
import { useReadingStore } from "@/store/readingStore";
import { useSpeech } from "@/hooks/useSpeech";

interface ConversationSceneProps {
  conversation: IConversation;
  page: IConversationPage | null;
  currentPage: number;
}

export default function ConversationScene({
  conversation,
  page,
  currentPage,
}: ConversationSceneProps) {
  const totalPages = conversation.totalPages;
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;
  const baseUrl = `/conversations/${conversation._id}/read`;

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      {/* Background — page-level overrides conversation-level */}
      {page?.backgroundImageUrl ?? conversation.backgroundImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={(page?.backgroundImageUrl ?? conversation.backgroundImageUrl)!}
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-indigo-900 to-pink-900" />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 " />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-sm gap-2">
        <Link
          href="/conversations"
          className="text-white/80 hover:text-white font-bold text-sm flex items-center gap-1 flex-shrink-0"
        >
          ← Back
        </Link>
        <p className="text-white font-black text-sm truncate flex-1 text-center">
          {conversation.title}
        </p>
        <span className="text-white/60 text-xs font-bold flex-shrink-0">
          {currentPage}/{totalPages}
        </span>
      </div>

      {/* Page dots */}
      <div className="relative z-10 flex justify-center gap-1.5 py-2">
        {Array.from({ length: Math.min(totalPages, 20) }).map((_, i) => {
          const p = i + 1;
          return (
            <Link
              key={p}
              href={`${baseUrl}/${p}`}
              className={`rounded-full transition-all ${
                p === currentPage
                  ? "w-5 h-2.5 bg-white"
                  : "w-2.5 h-2.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          );
        })}
      </div>

      {/* Stage — positioned absolutely */}
      <div className="relative flex-1">
        {page?.characters?.map((slot, idx) => (
          <CharacterSlotView
            key={idx}
            slot={slot as unknown as IConversationCharacterSlot}
          />
        ))}
        {page?.texts?.map((slot, idx) => (
          <TextSlotView key={idx} slot={slot as unknown as ITextSlot} />
        ))}

        {/* Empty page message */}
        {(!page || (!page.characters?.length && !page.texts?.length)) && (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/40 font-bold text-lg">
              ページ {currentPage}
            </p>
          </div>
        )}

        {/* Left / Prev button */}
        {!isFirst && (
          <Link
            href={`${baseUrl}/${currentPage - 1}`}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-16 bg-white/20 hover:bg-white/40 text-white font-black text-xl rounded-r-2xl backdrop-blur-sm transition-all active:scale-95"
          >
            ←
          </Link>
        )}

        {/* Right / Next button */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20">
          {!isLast ? (
            <Link
              href={`${baseUrl}/${currentPage + 1}`}
              className="flex items-center justify-center w-10 h-16 bg-pink-500 hover:bg-pink-600 text-white font-black text-xl rounded-l-2xl transition-all active:scale-95 shadow-lg"
            >
              →
            </Link>
          ) : (
            <Link
              href="/conversations"
              className="flex items-center justify-center w-10 h-16 bg-green-500 hover:bg-green-600 text-white font-black text-xl rounded-l-2xl transition-all active:scale-95 shadow-lg"
            >
              ✓
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function CharacterSlotView({ slot }: { slot: IConversationCharacterSlot }) {
  const char = slot.characterId as unknown as ICharacter;
  const { setSelectedWord } = useReadingStore();
  const { speak } = useSpeech();

  return (
    <>
      {/* Character image */}
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${slot.characterPosition.x}%`,
          top: `${slot.characterPosition.y}%`,
        }}
      >
        {char?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={char.imageUrl}
            alt={char.name ?? "character"}
            className="h-36 w-auto object-contain"
            style={{
              mixBlendMode: "multiply",
              filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.5))",
            }}
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl">
            🧑
          </div>
        )}
        {char?.name && (
          <p className="text-center text-white text-xs font-bold mt-1 bg-black/50 rounded-full px-2 py-0.5 backdrop-blur-sm">
            {char.name}
          </p>
        )}
      </div>

      {/* Text bubble */}
      {slot.text && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 max-w-[200px]"
          style={{
            left: `${slot.textPosition.x}%`,
            top: `${slot.textPosition.y}%`,
          }}
        >
          <div className="bg-white rounded-2xl px-4 py-2 shadow-xl border-2 border-pink-200">
            <DialogueText
              text={slot.text}
              setSelectedWord={setSelectedWord}
              speak={speak}
            />
            <button
              onClick={() => speak(slot.text)}
              className="mt-1 w-full flex items-center justify-center gap-1 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-500 text-xs font-bold transition-colors active:scale-95"
            >
              🔊 全部読む
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function TextSlotView({ slot }: { slot: ITextSlot }) {
  const { setSelectedWord } = useReadingStore();
  const { speak } = useSpeech();

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 max-w-[220px]"
      style={{ left: `${slot.position.x}%`, top: `${slot.position.y}%` }}
    >
      <div className="bg-white rounded-2xl px-4 py-2 shadow-xl border-2 border-pink-200">
        <DialogueText
          text={slot.text}
          setSelectedWord={setSelectedWord}
          speak={speak}
        />
        <button
          onClick={() => speak(slot.text)}
          className="mt-1 w-full flex items-center justify-center gap-1 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-500 text-xs font-bold transition-colors active:scale-95"
        >
          🔊 全部読む
        </button>
      </div>
    </div>
  );
}

function DialogueText({
  text,
  setSelectedWord,
  speak,
}: {
  text: string;
  setSelectedWord: (word: null, surface?: string) => void;
  speak: (text: string) => void;
}) {
  const tokens = tokenize(text);

  return (
    <p className="text-gray-800 font-bold text-base leading-relaxed">
      {tokens.map((token, i) =>
        token.isJapanese ? (
          <button
            key={i}
            onClick={() => {
              setSelectedWord(null, token.text);
              speak(token.text);
            }}
            className="hover:bg-pink-100 hover:text-pink-700 rounded px-0.5 transition-colors cursor-pointer"
          >
            {token.text}
          </button>
        ) : (
          <span key={i}>{token.text}</span>
        )
      )}
    </p>
  );
}

function tokenize(text: string): Array<{ text: string; isJapanese: boolean }> {
  const result: Array<{ text: string; isJapanese: boolean }> = [];
  let current = "";
  let currentIsJapanese = false;

  for (const ch of text) {
    const isJP = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]/.test(
      ch
    );
    if (result.length === 0 && current === "") {
      current = ch;
      currentIsJapanese = isJP;
    } else if (isJP === currentIsJapanese) {
      current += ch;
    } else {
      result.push({ text: current, isJapanese: currentIsJapanese });
      current = ch;
      currentIsJapanese = isJP;
    }
  }
  if (current) result.push({ text: current, isJapanese: currentIsJapanese });
  return result;
}
