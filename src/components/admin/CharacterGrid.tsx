"use client";

import { useRouter } from "next/navigation";
import { ICharacter } from "@/types";

export default function CharacterGrid({ characters }: { characters: ICharacter[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this character?")) return;
    await fetch(`/api/characters/${id}`, { method: "DELETE" });
    router.refresh();
  };

  if (characters.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-5xl mb-3">🎭</div>
        <p className="font-bold">No characters yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {characters.map((char) => (
        <div key={char._id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="h-36 bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center overflow-hidden">
            {char.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={char.imageUrl} alt={char.name} className="h-full w-full object-contain group-hover:scale-105 transition-transform" />
            ) : (
              <span className="text-5xl">🧑</span>
            )}
          </div>
          <div className="p-3 flex items-center justify-between">
            <p className="font-black text-gray-700 text-sm truncate">{char.name}</p>
            <button
              onClick={() => handleDelete(char._id)}
              className="text-xs text-red-400 hover:text-red-600 font-bold ml-2 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
