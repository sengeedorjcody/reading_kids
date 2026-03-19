export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import DictionaryWord from "@/lib/db/models/DictionaryWord";
import Link from "next/link";
import { IDictionaryWord } from "@/types";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteWord } from "./actions";
import ExcelImportForm from "@/components/admin/ExcelImportForm";

async function getWords(): Promise<IDictionaryWord[]> {
  await connectDB();
  const words = await DictionaryWord.find().sort({ japanese_word: 1 }).limit(100).lean();
  return JSON.parse(JSON.stringify(words));
}

export default async function AdminDictionaryPage() {
  const words = await getWords();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-800">📝 Dictionary</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/dictionary/new"
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-5 rounded-2xl transition-all"
          >
            ➕ Add Word
          </Link>
        </div>
      </div>

      {/* Excel Import Section */}
      <ExcelImportForm />

      <p className="text-gray-400 text-sm">{words.length} words (showing up to 100)</p>

      {words.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl text-gray-400 font-bold">No words yet</p>
          <Link href="/admin/dictionary/new" className="text-purple-500 font-bold hover:underline mt-2 inline-block">
            Add your first word →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-sm font-bold text-gray-400">Word</th>
                <th className="text-left p-4 text-sm font-bold text-gray-400">Romaji</th>
                <th className="text-left p-4 text-sm font-bold text-gray-400">English</th>
                <th className="text-left p-4 text-sm font-bold text-gray-400">Mongolian</th>
                <th className="text-left p-4 text-sm font-bold text-gray-400">Image</th>
                <th className="text-left p-4 text-sm font-bold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {words.map((word, i) => (
                <tr key={word._id} className={i !== words.length - 1 ? "border-b border-gray-50" : ""}>
                  <td className="p-4">
                    <div className="text-2xl font-bold text-gray-800">{word.japanese_word}</div>
                    {word.hiragana && word.hiragana !== word.japanese_word && (
                      <div className="text-sm text-pink-400">{word.hiragana}</div>
                    )}
                  </td>
                  <td className="p-4 text-blue-400 italic">{word.romaji}</td>
                  <td className="p-4 text-gray-600">{word.english_meaning}</td>
                  <td className="p-4 text-gray-600">{word.mongolian_meaning}</td>
                  <td className="p-4">
                    {word.example_image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={word.example_image_url}
                        alt={word.japanese_word}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                      />
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/dictionary/${word._id}/edit`}
                        className="text-purple-500 font-bold text-sm hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteWord.bind(null, word._id)}
                        confirmMessage="Delete this word?"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
