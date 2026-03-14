export const dynamic = "force-dynamic";

import Link from "next/link";
import { connectDB } from "@/lib/db/mongoose";
import Book from "@/lib/db/models/Book";
import { IBook } from "@/types";
import BookCard from "@/components/books/BookCard";

async function getRecentBooks(): Promise<IBook[]> {
  try {
    await connectDB();
    const books = await Book.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();
    return JSON.parse(JSON.stringify(books));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const books = await getRecentBooks();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
      {/* Hero */}
      <section className="text-center py-12 space-y-6">
        <div className="flex justify-center gap-4 text-6xl mb-4">
          {["あ", "い", "う", "え", "お"].map((char, i) => (
            <span
              key={char}
              className="animate-bounce font-black text-pink-500"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {char}
            </span>
          ))}
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-800">
          にほんご を <span className="text-pink-500">よもう</span>！
        </h1>
        <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto">
          Learn to read Japanese step by step with fun books and interactive lessons!
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/books"
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-8 rounded-3xl text-xl transition-all hover:-translate-y-1 shadow-lg shadow-pink-200 active:scale-95"
          >
            📖 Start Reading
          </Link>
          <Link
            href="/alphabet"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-3xl text-xl transition-all hover:-translate-y-1 shadow-lg shadow-blue-200 active:scale-95"
          >
            あ Learn Alphabet
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            emoji="📚"
            title="Read Books"
            titleJa="ほん を よむ"
            description="Click any word to see its meaning instantly!"
            href="/books"
            color="from-pink-100 to-pink-50"
            border="border-pink-200"
          />
          <FeatureCard
            emoji="あ"
            title="Learn Alphabet"
            titleJa="もじ を まなぶ"
            description="Master hiragana and katakana step by step."
            href="/alphabet"
            color="from-blue-100 to-blue-50"
            border="border-blue-200"
          />
          <FeatureCard
            emoji="📝"
            title="Dictionary"
            titleJa="じしょ を みる"
            description="Search thousands of Japanese words with images."
            href="/dictionary"
            color="from-purple-100 to-purple-50"
            border="border-purple-200"
          />
        </div>
      </section>

      {/* Recent Books */}
      {books.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-gray-700">📚 New Books</h2>
            <Link href="/books" className="text-pink-500 font-bold hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  titleJa,
  description,
  href,
  color,
  border,
}: {
  emoji: string;
  title: string;
  titleJa: string;
  description: string;
  href: string;
  color: string;
  border: string;
}) {
  return (
    <Link
      href={href}
      className={`bg-gradient-to-br ${color} border-2 ${border} rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 hover:shadow-xl block`}
    >
      <div className="text-6xl mb-4">{emoji}</div>
      <h3 className="text-2xl font-black text-gray-800">{title}</h3>
      <p className="text-lg text-gray-500 font-medium">{titleJa}</p>
      <p className="text-sm text-gray-500 mt-2">{description}</p>
    </Link>
  );
}
