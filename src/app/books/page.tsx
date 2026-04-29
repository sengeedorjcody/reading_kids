export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import Book from "@/lib/db/models/Book";
import { IBook, BookLevel } from "@/types";
import BookCard from "@/components/books/BookCard";
import { BOOK_LEVELS, LEVEL_CONFIG } from "@/constants/levels";
import Link from "next/link";

async function getBooks(level?: string): Promise<IBook[]> {
  await connectDB();
  const query: Record<string, unknown> = { isPublished: true };
  if (level && level !== "all") query.level = level;
  const books = await Book.find(query).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(books));
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: { level?: string };
}) {
  const level = searchParams.level ?? "all";
  const books = await getBooks(level);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">📚 Book Library</h1>
        <p className="text-xl text-white/60">ほん を えらんで よみましょう！</p>
      </div>

      {/* Level filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/books"
          className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all ${
            level === "all"
              ? "bg-pink-500 text-white shadow-lg"
              : "bg-white/10 text-white/70 border border-white/20 hover:bg-white/20"
          }`}
        >
          📚 All
        </Link>
        {BOOK_LEVELS.map((lvl) => {
          const cfg = LEVEL_CONFIG[lvl];
          return (
            <Link
              key={lvl}
              href={`/books?level=${lvl}`}
              className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all ${
                level === lvl
                  ? `${cfg.bg} ${cfg.color} shadow-lg`
                  : "bg-white/10 text-white/70 border border-white/20 hover:bg-white/20"
              }`}
            >
              {cfg.emoji} {cfg.label}
            </Link>
          );
        })}
      </div>

      {/* Books grid */}
      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="text-8xl">📭</div>
          <p className="text-2xl font-bold text-gray-400">No books in this level yet!</p>
          <Link href="/books" className="text-pink-500 font-bold hover:underline">
            See all books →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
