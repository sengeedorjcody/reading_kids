export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import Book from "@/lib/db/models/Book";
import Page from "@/lib/db/models/Page";
import { IBook } from "@/types";
import { BookLevel } from "@/types";
import LevelBadge from "@/components/books/LevelBadge";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getBookData(bookId: string) {
  await connectDB();
  const [book, pages] = await Promise.all([
    Book.findById(bookId).lean(),
    Page.find({ bookId }).select("pageNumber").sort({ pageNumber: 1 }).lean(),
  ]);
  if (!book) return null;
  return {
    book: JSON.parse(JSON.stringify(book)) as IBook,
    pageCount: pages.length,
  };
}

export default async function BookDetailPage({
  params,
}: {
  params: { bookId: string };
}) {
  const data = await getBookData(params.bookId);
  if (!data) notFound();
  const { book, pageCount } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href="/books" className="text-pink-500 font-bold hover:underline mb-6 inline-flex items-center gap-1">
        ← Back to Books
      </Link>

      {/* Book info */}
      <div className="bg-white rounded-3xl shadow-md p-8 mt-4">
        <LevelBadge level={book.level as BookLevel} />
        <h1 className="text-4xl font-black text-gray-800 mt-3">{book.title}</h1>
        {book.titleJapanese && (
          <p className="text-3xl text-pink-400 font-bold mt-1">{book.titleJapanese}</p>
        )}
        {book.description && (
          <p className="text-lg text-gray-500 mt-4">{book.description}</p>
        )}
        <p className="text-base text-gray-400 mt-2">{pageCount} pages</p>

        <Link
          href={`/books/${book._id}/read/1`}
          className="mt-6 inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-10 rounded-3xl text-xl transition-all hover:-translate-y-1 shadow-lg shadow-pink-200 active:scale-95"
        >
          📖 Start Reading
        </Link>
      </div>

      {/* Page list */}
      {pageCount > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-black text-gray-700 mb-4">Pages</h2>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={`/books/${book._id}/read/${n}`}
                className="aspect-square flex items-center justify-center bg-white rounded-2xl border-2 border-pink-100 text-lg font-bold text-gray-700 hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all"
              >
                {n}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
