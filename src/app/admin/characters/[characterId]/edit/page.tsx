export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db/mongoose";
import Character from "@/lib/db/models/Character";
import EditCharacterForm from "@/components/admin/EditCharacterForm";

async function getCharacter(id: string) {
  await connectDB();
  const char = await Character.findById(id).lean();
  return char ? JSON.parse(JSON.stringify(char)) : null;
}

export default async function EditCharacterPage({ params }: { params: { characterId: string } }) {
  const character = await getCharacter(params.characterId);
  if (!character) notFound();

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/characters" className="text-gray-400 hover:text-gray-600 font-bold text-sm">
          ← Back
        </Link>
        <h1 className="text-2xl font-black text-gray-700">✏️ Edit Character</h1>
      </div>
      <EditCharacterForm character={character} />
    </div>
  );
}
