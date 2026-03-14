export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import Book from "@/lib/db/models/Book";
import DictionaryWord from "@/lib/db/models/DictionaryWord"; // must import before Page to register schema
import Page from "@/lib/db/models/Page";
import { IBook, IPage } from "@/types";
import ReadingLayout from "@/components/reading/ReadingLayout";
import { notFound } from "next/navigation";
import Link from "next/link";

async function getReadingData(bookId: string, pageNum: number) {
  await connectDB();
  // Reference DictionaryWord so Mongoose registers the schema before populate() runs
  void DictionaryWord.modelName;
  const [book, page, totalPages] = await Promise.all([
    Book.findById(bookId).lean(),
    Page.findOne({ bookId, pageNumber: pageNum })
      .populate("sentences.words.dictionaryRef")
      .lean(),
    Page.countDocuments({ bookId }),
  ]);

  if (!book || !page) return null;

  return {
    book: JSON.parse(JSON.stringify(book)) as IBook,
    page: JSON.parse(JSON.stringify(page)) as IPage,
    totalPages,
  };
}

export default async function ReadingPage({
  params,
}: {
  params: { bookId: string; pageNum: string };
}) {
  const pageNum = parseInt(params.pageNum);
  if (isNaN(pageNum) || pageNum < 1) notFound();

  const data = await getReadingData(params.bookId, pageNum);
  if (!data) notFound();

  const { book, page, totalPages } = data;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Book title bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-pink-50 border-b border-pink-100">
        <Link href={`/books/${book._id}`} className="text-pink-400 hover:text-pink-600 font-bold text-sm">
          ← {book.title}
        </Link>
        {book.titleJapanese && (
          <span className="text-pink-300 text-sm">{book.titleJapanese}</span>
        )}
      </div>

      <ReadingLayout
        page={page}
        bookId={params.bookId}
        currentPage={pageNum}
        totalPages={totalPages}
      />
    </div>
  );
}
