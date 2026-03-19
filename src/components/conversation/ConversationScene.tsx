"use client";

import Link from "next/link";
import { IConversation, IConversationPage, IConversationCharacterSlot, ICharacter } from "@/types";
import { useReadingStore } from "@/store/readingStore";
import { useSpeech } from "@/hooks/useSpeech";

interface ConversationSceneProps {
  conversation: IConversation;
  page: IConversationPage | null;
  currentPage: number;
}

export default function ConversationScene({ conversation, page, currentPage }: ConversationSceneProps) {
  const totalPages = conversation.totalPages;
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;
  const baseUrl = `/conversations/${conversation._id}/read`;

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 flex flex-col">
      {/* Background */}
      {conversation.backgroundImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={conversation.backgroundImageUrl}
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-indigo-900 to-pink-900" />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-sm">
        <Link href="/conversations" className="text-white/80 hover:text-white font-bold text-sm flex items-center gap-1">
          ← Back
        </Link>
        <div className="text-center">
          <p className="text-white font-black text-sm">{conversation.title}</p>
        </div>
        <div className="text-white/60 text-xs font-bold">{currentPage}/{totalPages}</div>
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
                p === currentPage ? "w-5 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          );
        })}
      </div>

      {/* Characters stage — positioned absolutely */}
      <div className="relative flex-1">
        {page?.characters?.map((slot, idx) => (
          <CharacterSlotView key={idx} slot={slot as unknown as IConversationCharacterSlot} />
        ))}

        {/* Empty page message */}
        {(!page || !page.characters || page.characters.length === 0) && (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/40 font-bold text-lg">ページ {currentPage}</p>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-sm">
        {isFirst ? (
          <div />
        ) : (
          <Link
            href={`${baseUrl}/${currentPage - 1}`}
            className="bg-white/20 hover:bg-white/30 text-white font-black px-5 py-2.5 rounded-2xl text-sm transition-all"
          >
            ← まえ
          </Link>
        )}

        {isLast ? (
          <Link
            href="/conversations"
            className="bg-green-500 hover:bg-green-600 text-white font-black px-5 py-2.5 rounded-2xl text-sm transition-all"
          >
            ✅ おわり
          </Link>
        ) : (
          <Link
            href={`${baseUrl}/${currentPage + 1}`}
            className="bg-pink-500 hover:bg-pink-600 text-white font-black px-5 py-2.5 rounded-2xl text-sm transition-all"
          >
            つぎ →
          </Link>
        )}
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
            style={{ mixBlendMode: "multiply", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.5))" }}
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
            <DialogueText text={slot.text} setSelectedWord={setSelectedWord} speak={speak} />
          </div>
        </div>
      )}
    </>
  );
}

function DialogueText({ text, setSelectedWord, speak }: {
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
    const isJP = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]/.test(ch);
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
