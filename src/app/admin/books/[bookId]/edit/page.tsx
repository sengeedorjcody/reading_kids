export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import Book from "@/lib/db/models/Book";
import Page from "@/lib/db/models/Page";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditBookForm from "@/components/admin/EditBookForm";

async function getBookWithPages(bookId: string) {
  await connectDB();
  const book = await Book.findById(bookId).lean();
  if (!book) return null;
  const pages = await Page.find({ bookId }).sort({ pageNumber: 1 }).lean();
  return { book: JSON.parse(JSON.stringify(book)), pages: JSON.parse(JSON.stringify(pages)) };
}

export default async function EditBookPage({ params }: { params: { bookId: string } }) {
  const data = await getBookWithPages(params.bookId);
  if (!data) notFound();

  const { book, pages } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/books" className="text-gray-400 hover:text-gray-600 font-bold text-sm">
          ← Back
        </Link>
        <h1 className="text-3xl font-black text-gray-800">✏️ Edit Book</h1>
      </div>

      <EditBookForm
        bookId={params.bookId}
        initialTitle={book.title}
        initialTitleJapanese={book.titleJapanese || ""}
        initialLevel={book.level}
        initialDescription={book.description || ""}
        initialPages={pages.map((p: { rawText?: string }) => p.rawText || "")}
      />
    </div>
  );
}
