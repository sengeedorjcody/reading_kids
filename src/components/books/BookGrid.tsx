"use client";

import { IBook } from "@/types";
import BookCard from "./BookCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface BookGridProps {
  books: IBook[];
  loading?: boolean;
}

export default function BookGrid({ books, loading }: BookGridProps) {
  if (loading) return <LoadingSpinner />;

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="text-8xl">📭</div>
        <p className="text-2xl font-bold text-gray-400">No books yet!</p>
        <p className="text-gray-400">Ask your teacher to add some books.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard key={book._id} book={book} />
      ))}
    </div>
  );
}
