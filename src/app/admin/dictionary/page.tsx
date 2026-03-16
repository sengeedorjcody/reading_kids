export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import DictionaryWord from "@/lib/db/models/DictionaryWord";
import Book from "@/lib/db/models/Book";
import Link from "next/link";
import { IDictionaryWord, IBook } from "@/types";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteWord } from "./actions";
import ExcelImportForm from "@/components/admin/ExcelImportForm";

async function getData(bookId?: string): Promise<{ words: IDictionaryWord[]; books: IBook[] }> {
  await connectDB();

  const query: Record<string, unknown> = {};
  if (bookId && bookId !== "all") query.book_ids = bookId;

  const [words, books] = await Promise.all([
    DictionaryWord.find(query).sort({ japanese_word: 1 }).limit(100).lean(),
    Book.find().sort({ title: 1 }).lean(),
  ]);

  return {
    words: JSON.parse(JSON.stringify(words)),
    books: JSON.parse(JSON.stringify(books)),
  };
}

interface PageProps {
  searchParams: Promise<{ bookId?: string }>;
}

export default async function AdminDictionaryPage({ searchParams }: PageProps) {
  const { bookId } = await searchParams;
  const { words, books } = await getData(bookId);

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
      <ExcelImportForm books={books} />

      {/* Book filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-bold text-gray-500">Filter by book:</span>
        <Link
          href="/admin/dictionary"
          className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
            !bookId || bookId === "all"
              ? "bg-purple-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All words
        </Link>
        {books.map((b) => (
          <Link
            key={b._id}
            href={`/admin/dictionary?bookId=${b._id}`}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
              bookId === b._id
                ? "bg-purple-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {b.title}
          </Link>
        ))}
      </div>

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
