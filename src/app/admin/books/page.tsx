export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import Book from "@/lib/db/models/Book";
import Link from "next/link";
import { IBook, BookLevel } from "@/types";
import LevelBadge from "@/components/books/LevelBadge";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteBook } from "./actions";

async function getBooks(): Promise<IBook[]> {
  await connectDB();
  const books = await Book.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(books));
}

export default async function AdminBooksPage() {
  const books = await getBooks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-800">📚 Books</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/books/create"
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-5 rounded-2xl transition-all"
          >
            ✍️ Text Book
          </Link>
          <Link
            href="/admin/books/upload"
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-5 rounded-2xl transition-all"
          >
            📤 Upload PDF
          </Link>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl text-gray-400 font-bold">No books yet</p>
          <Link href="/admin/books/upload" className="text-pink-500 font-bold hover:underline mt-2 inline-block">
            Upload your first book →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-sm font-bold text-gray-400">Title</th>
                <th className="text-left p-4 text-sm font-bold text-gray-400">Level</th>
                <th className="text-left p-4 text-sm font-bold text-gray-400">Pages</th>
                <th className="text-left p-4 text-sm font-bold text-gray-400">Date</th>
                <th className="text-left p-4 text-sm font-bold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book, i) => (
                <tr key={book._id} className={i !== books.length - 1 ? "border-b border-gray-50" : ""}>
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{book.title}</p>
                    {book.titleJapanese && (
                      <p className="text-sm text-pink-400">{book.titleJapanese}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <LevelBadge level={book.level as BookLevel} size="sm" />
                  </td>
                  <td className="p-4 text-gray-500">{book.totalPages}</td>
                  <td className="p-4 text-gray-400 text-sm">
                    {new Date(book.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/books/${book._id}/read/1`}
                        className="text-pink-500 font-bold text-sm hover:underline"
                      >
                        Read
                      </Link>
                      <DeleteButton
                        action={deleteBook.bind(null, book._id)}
                        confirmMessage="Delete this book?"
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

