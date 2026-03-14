"use client";

import Image from "next/image";
import Link from "next/link";
import { IBook } from "@/types";
import LevelBadge from "./LevelBadge";
import { BookLevel } from "@/types";

interface BookCardProps {
  book: IBook;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Cover image */}
      <div className="relative w-full h-52 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        {book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        ) : (
          <div className="text-8xl select-none">📚</div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <LevelBadge level={book.level as BookLevel} />
        <h3 className="text-xl font-bold text-gray-800 leading-tight">
          {book.title}
        </h3>
        {book.titleJapanese && (
          <p className="text-lg text-pink-600 font-medium">{book.titleJapanese}</p>
        )}
        {book.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{book.description}</p>
        )}
        <div className="mt-auto pt-2">
          <Link
            href={`/books/${book._id}/read/1`}
            className="block w-full text-center bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-2xl text-lg transition-colors duration-200 active:scale-95"
          >
            📖 よむ (Start Reading)
          </Link>
        </div>
      </div>
    </div>
  );
}
