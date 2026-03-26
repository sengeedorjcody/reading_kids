export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import DictionaryWord from "@/lib/db/models/DictionaryWord";
import Book from "@/lib/db/models/Book";
import Conversation from "@/lib/db/models/Conversation";
import Link from "next/link";
import { IDictionaryWord } from "@/types";
import ExcelImportForm from "@/components/admin/ExcelImportForm";
import DictionaryFilter from "@/components/admin/DictionaryFilter";
import DictionaryTable from "@/components/admin/DictionaryTable";

async function getData(bookId?: string, conversationId?: string, q?: string) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (bookId) filter.bookId = bookId;
  if (conversationId) filter.conversationId = conversationId;
  if (q?.trim()) {
    const re = { $regex: q.trim(), $options: "i" };
    filter.$or = [
      { japanese_word: re },
      { hiragana: re },
      { romaji: re },
      { english_meaning: re },
      { mongolian_meaning: re },
    ];
  }

  const [words, books, conversations] = await Promise.all([
    DictionaryWord.find(filter).sort({ example_image_url: 1, createdAt: -1 }).limit(200).lean(),
    Book.find().sort({ title: 1 }).select("title").lean(),
    Conversation.find().sort({ title: 1 }).select("title").lean(),
  ]);
  return { words, books, conversations };
}

export default async function AdminDictionaryPage({
  searchParams,
}: {
  searchParams: { book?: string; conversation?: string; q?: string };
}) {
  const { words, books, conversations } = await getData(searchParams.book, searchParams.conversation, searchParams.q);
  const wordList = JSON.parse(JSON.stringify(words)) as IDictionaryWord[];
  const bookList = JSON.parse(JSON.stringify(books)) as { _id: string; title: string }[];
  const convList = JSON.parse(JSON.stringify(conversations)) as { _id: string; title: string }[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-800">📝 Dictionary</h1>
        <div className="flex items-center gap-3">
          <ExcelImportForm />
          <Link
            href="/admin/dictionary/new"
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-5 rounded-2xl transition-all"
          >
            ➕ Add Word
          </Link>
        </div>
      </div>

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
        <DictionaryTable words={wordList} />
      )}
    </div>
  );
}
