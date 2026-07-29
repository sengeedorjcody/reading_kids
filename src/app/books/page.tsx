export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import Book from "@/lib/db/models/Book";
import { IBook } from "@/types";
import BookCard from "@/components/books/BookCard";

async function getBooks(): Promise<IBook[]> {
  await connectDB();
  const books = await Book.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(books));
}

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-black text-white mb-4">📚 Books · ほんだな</h1>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="text-8xl">📭</div>
          <p className="text-xl font-bold text-white/50">No books yet</p>
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
