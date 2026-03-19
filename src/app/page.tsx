export const dynamic = "force-dynamic";

import Link from "next/link";
import { connectDB } from "@/lib/db/mongoose";
import Book from "@/lib/db/models/Book";
import Conversation from "@/lib/db/models/Conversation";
import { IBook, IConversation } from "@/types";
import BookCard from "@/components/books/BookCard";
import ConversationCard from "@/components/conversation/ConversationCard";

async function getData() {
  try {
    await connectDB();
    const [books, conversations] = await Promise.all([
      Book.find({ isPublished: true }).sort({ createdAt: -1 }).lean(),
      Conversation.find({ isPublished: true }).sort({ createdAt: -1 }).lean(),
    ]);
    return {
      books: JSON.parse(JSON.stringify(books)) as IBook[],
      conversations: JSON.parse(JSON.stringify(conversations)) as IConversation[],
    };
  } catch {
    return { books: [], conversations: [] };
  }
}

export default async function HomePage() {
  const { books, conversations } = await getData();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Header */}
      <div className="text-center pt-6 pb-2">
        <div className="flex justify-center gap-3 text-5xl mb-3">
          {["あ", "い", "う", "え", "お"].map((char, i) => (
            <span key={char} className="animate-bounce font-black text-pink-500" style={{ animationDelay: `${i * 0.1}s` }}>
              {char}
            </span>
          ))}
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-gray-800">
          にほんご を <span className="text-pink-500">よもう</span>！
        </h1>
      </div>

      {/* Books Section */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-black text-gray-700 flex items-center gap-2">
            <span className="text-3xl">📚</span> Books
          </h2>
          <Link href="/books" className="text-pink-500 font-bold hover:underline text-sm">
            See all →
          </Link>
        </div>
        {books.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white/60 rounded-3xl">
            <div className="text-5xl mb-3">📚</div>
            <p className="font-bold">No books yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* Conversations Section */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-black text-gray-700 flex items-center gap-2">
            <span className="text-3xl">💬</span> Conversations
          </h2>
          <Link href="/conversations" className="text-pink-500 font-bold hover:underline text-sm">
            See all →
          </Link>
        </div>
        {conversations.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white/60 rounded-3xl">
            <div className="text-5xl mb-3">💬</div>
            <p className="font-bold">No conversations yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {conversations.map((conv) => (
              <ConversationCard key={conv._id} conversation={conv} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
