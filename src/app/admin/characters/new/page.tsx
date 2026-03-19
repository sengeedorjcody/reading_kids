import CharacterForm from "@/components/admin/CharacterForm";

export default function NewCharacterPage() {
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-black text-gray-700">🎭 New Character</h1>
      <CharacterForm />
    </div>
  );
}
