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
    <Link
      href={`/books/${book._id}/read/1`}
      className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/20 hover:-translate-y-1 transition-all duration-200 active:scale-95 flex flex-col"
    >
      {/* Cover image */}
      <div className="relative w-full h-32 bg-gradient-to-br from-pink-400/30 to-purple-500/30 flex items-center justify-center">
        {book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <div className="text-5xl select-none">📚</div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2 flex flex-col gap-1">
        <LevelBadge level={book.level as BookLevel} />
        <h3 className="text-sm font-bold text-white leading-tight line-clamp-1">
          {book.title}
        </h3>
        {book.titleJapanese && (
          <p className="text-xs text-pink-300 font-medium line-clamp-1">{book.titleJapanese}</p>
        )}
      </div>
    </Link>
  );
}
