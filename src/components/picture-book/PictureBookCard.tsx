"use client";

import Image from "next/image";
import Link from "next/link";
import { IPictureBook } from "@/types";

export default function PictureBookCard({ pictureBook }: { pictureBook: IPictureBook }) {
  return (
    <Link
      href={`/picture-books/${pictureBook._id}/read/1`}
      className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/20 hover:-translate-y-1 transition-all duration-200 active:scale-95 flex flex-col"
    >
      <div className="relative w-full h-32 bg-gradient-to-br from-amber-400/30 to-orange-500/30 flex items-center justify-center">
        {pictureBook.coverImageUrl ? (
          <Image
            src={pictureBook.coverImageUrl}
            alt={pictureBook.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <div className="text-5xl select-none">🖼️</div>
        )}
      </div>

      <div className="px-3 py-2 flex flex-col gap-0.5">
        <h3 className="text-sm font-bold text-white leading-tight line-clamp-1">
          {pictureBook.title}
        </h3>
        {pictureBook.titleJapanese && (
          <p className="text-xs text-amber-300 font-medium line-clamp-1">{pictureBook.titleJapanese}</p>
        )}
      </div>
    </Link>
  );
}
