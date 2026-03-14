export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import Book from "@/lib/db/models/Book";
import DictionaryWord from "@/lib/db/models/DictionaryWord";
import Link from "next/link";

async function getStats() {
  try {
    await connectDB();
    const [bookCount, wordCount] = await Promise.all([
      Book.countDocuments(),
      DictionaryWord.countDocuments(),
    ]);
    const recentBooks = await Book.find().sort({ createdAt: -1 }).limit(5).lean();
    return { bookCount, wordCount, recentBooks: JSON.parse(JSON.stringify(recentBooks)) };
  } catch {
    return { bookCount: 0, wordCount: 0, recentBooks: [] };
  }
}

export default async function AdminDashboard() {
  const { bookCount, wordCount, recentBooks } = await getStats();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-gray-800">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard icon="📚" label="Total Books" value={bookCount} color="bg-pink-50 border-pink-200" href="/admin/books" />
        <StatCard icon="📝" label="Dictionary Words" value={wordCount} color="bg-purple-50 border-purple-200" href="/admin/dictionary" />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xl font-black text-gray-700 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/books/upload" className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-2xl transition-all hover:-translate-y-0.5 shadow-md">
            📤 Upload Book
          </Link>
          <Link href="/admin/dictionary/new" className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-2xl transition-all hover:-translate-y-0.5 shadow-md">
            ➕ Add Word
          </Link>
          <Link href="/books" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-2xl transition-all">
            👁 View Site
          </Link>
        </div>
      </div>

      {/* Recent books */}
      {recentBooks.length > 0 && (
        <div>
          <h2 className="text-xl font-black text-gray-700 mb-4">Recent Books</h2>
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            {recentBooks.map((book: { _id: string; title: string; level: string; isPublished: boolean; createdAt: string }, i: number) => (
              <div
                key={book._id}
                className={`flex items-center justify-between p-4 ${i !== recentBooks.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <div>
                  <p className="font-bold text-gray-800">{book.title}</p>
                  <p className="text-sm text-gray-400">{book.level} · {new Date(book.createdAt).toLocaleDateString()}</p>
                </div>
                <Link
                  href={`/books/${book._id}`}
                  className="text-pink-500 font-bold text-sm hover:underline"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon, label, value, color, href,
}: {
  icon: string; label: string; value: number; color: string; href: string;
}) {
  return (
    <Link href={href} className={`${color} border-2 rounded-3xl p-6 hover:-translate-y-1 transition-all hover:shadow-md block`}>
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-4xl font-black text-gray-800">{value}</div>
      <div className="text-gray-500 font-medium mt-1">{label}</div>
    </Link>
  );
}
