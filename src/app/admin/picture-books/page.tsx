export const dynamic = "force-dynamic";

import Link from "next/link";
import { connectDB } from "@/lib/db/mongoose";
import PictureBook from "@/lib/db/models/PictureBook";
import { IPictureBook } from "@/types";
import DeletePictureBookButton from "@/components/admin/DeletePictureBookButton";

async function getPictureBooks(): Promise<IPictureBook[]> {
  try {
    await connectDB();
    const books = await PictureBook.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(books));
  } catch { return []; }
}

export default async function AdminPictureBooksPage() {
  const pictureBooks = await getPictureBooks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-700">🖼️ Picture Books</h1>
        <Link href="/admin/picture-books/create" className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-xl transition-colors">
          + New Picture Book
        </Link>
      </div>

      {pictureBooks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🖼️</div>
          <p className="font-bold">No picture books yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pictureBooks.map((pb) => (
            <div key={pb._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
              {pb.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pb.coverImageUrl} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-3xl flex-shrink-0">
                  🖼️
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-gray-700 truncate">{pb.title}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pb.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {pb.isPublished ? "Published" : "Draft"}
                  </span>
                  <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">{pb.level}</span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{pb.totalPages} pages</p>
              </div>
              <Link
                href={`/admin/picture-books/${pb._id}`}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-4 py-2 rounded-xl text-sm transition-colors flex-shrink-0"
              >
                Edit →
              </Link>
              <DeletePictureBookButton pictureBookId={pb._id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
