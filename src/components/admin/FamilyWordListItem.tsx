"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IFamilyTalkWord } from "@/types";
import { deleteFamilyWord } from "@/app/admin/family-talk/actions";

export default function FamilyWordListItem({ topicId, word }: { topicId: string; word: IFamilyTalkWord }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Remove "${word.japanese}" from this topic?`)) return;
    setDeleting(true);
    await deleteFamilyWord(topicId, word._id);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
      <div className="w-14 h-14 shrink-0 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center">
        {word.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={word.imageUrl} alt="" className="w-full h-full object-contain p-1" />
        ) : (
          <span className="text-xl">🔤</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="font-black text-gray-700 truncate">{word.japanese}</p>
          {word.hiragana && word.hiragana !== word.japanese && (
            <span className="text-xs text-gray-400 truncate">{word.hiragana}</span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">
          {[word.romaji, word.english_meaning, word.mongolian_meaning].filter(Boolean).join(" · ")}
        </p>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex-shrink-0 text-red-400 hover:text-red-600 font-bold text-sm disabled:opacity-50"
      >
        {deleting ? "…" : "🗑️"}
      </button>
    </div>
  );
}
