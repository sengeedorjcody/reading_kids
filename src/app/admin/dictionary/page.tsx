export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import DictionaryWord from "@/lib/db/models/DictionaryWord";
import Book from "@/lib/db/models/Book";
import Conversation from "@/lib/db/models/Conversation";
import Link from "next/link";
import { IDictionaryWord } from "@/types";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteWord } from "./actions";
import ExcelImportForm from "@/components/admin/ExcelImportForm";
import DictionaryFilter from "@/components/admin/DictionaryFilter";

async function getData(bookId?: string, conversationId?: string) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (bookId) filter.bookId = bookId;
  if (conversationId) filter.conversationId = conversationId;

  const [words, books, conversations] = await Promise.all([
    DictionaryWord.find(filter).sort({ japanese_word: 1 }).limit(200).lean(),
    Book.find().sort({ title: 1 }).select("title").lean(),
    Conversation.find().sort({ title: 1 }).select("title").lean(),
  ]);
  return { words, books, conversations };
}

export default async function AdminDictionaryPage({
  searchParams,
}: {
  searchParams: { book?: string; conversation?: string };
}) {
  const { words, books, conversations } = await getData(searchParams.book, searchParams.conversation);
  const wordList = JSON.parse(JSON.stringify(words)) as IDictionaryWord[];
  const bookList = JSON.parse(JSON.stringify(books)) as { _id: string; title: string }[];
  const convList = JSON.parse(JSON.stringify(conversations)) as { _id: string; title: string }[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-800">📝 Dictionary</h1>
        <Link
          href="/admin/dictionary/new"
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-5 rounded-2xl transition-all"
        >
          ➕ Add Word
        </Link>
      </div>

      {/* Excel Import */}
      <ExcelImportForm />

      {/* Filters */}
      <DictionaryFilter books={bookList} conversations={convList} total={wordList.length} />

      {wordList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl text-gray-400 font-bold">No words found</p>
          {(searchParams.book || searchParams.conversation) && (
            <Link href="/admin/dictionary" className="text-purple-500 font-bold hover:underline mt-2 inline-block">
              Clear filter →
            </Link>
          )}
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
              {wordList.map((word, i) => (
                <tr key={word._id} className={i !== wordList.length - 1 ? "border-b border-gray-50" : ""}>
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
                      // eslint-disable-next-line @next/next/no-img-element
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
