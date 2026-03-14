import { connectDB } from "@/lib/db/mongoose";
import DictionaryWord from "@/lib/db/models/DictionaryWord";
import WordForm from "@/components/admin/WordForm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IDictionaryWord } from "@/types";

async function getWord(wordId: string): Promise<IDictionaryWord | null> {
  await connectDB();
  const word = await DictionaryWord.findById(wordId).lean();
  if (!word) return null;
  return JSON.parse(JSON.stringify(word));
}

export default async function EditWordPage({
  params,
}: {
  params: { wordId: string };
}) {
  const word = await getWord(params.wordId);
  if (!word) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dictionary" className="text-gray-400 hover:text-gray-600 font-bold">
          ← Dictionary
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-3xl font-black text-gray-800">
          ✏️ Edit: {word.japanese_word}
        </h1>
      </div>
      <div className="bg-white rounded-3xl shadow-sm p-8">
        <WordForm initial={word} wordId={word._id} />
      </div>
    </div>
  );
}
