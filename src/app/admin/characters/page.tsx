export const dynamic = "force-dynamic";

import Link from "next/link";
import { connectDB } from "@/lib/db/mongoose";
import Character from "@/lib/db/models/Character";
import { ICharacter } from "@/types";
import CharacterGrid from "@/components/admin/CharacterGrid";

async function getCharacters(): Promise<ICharacter[]> {
  try {
    await connectDB();
    const chars = await Character.find().sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(chars));
  } catch { return []; }
}

export default async function CharactersPage() {
  const characters = await getCharacters();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-700">🎭 Characters</h1>
        <Link href="/admin/characters/new" className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-2 rounded-xl transition-colors">
          + New Character
        </Link>
      </div>
      <CharacterGrid characters={characters} />
    </div>
  );
}
