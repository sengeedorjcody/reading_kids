export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import PictureBook from "@/lib/db/models/PictureBook";
import { IPictureBook } from "@/types";
import PictureBookCard from "@/components/picture-book/PictureBookCard";

async function getPictureBooks(): Promise<IPictureBook[]> {
  await connectDB();
  const books = await PictureBook.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(books));
}

export default async function PictureBooksPage() {
  const pictureBooks = await getPictureBooks();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-28">
      <h1 className="text-3xl font-black text-white mb-4">🖼️ Picture Books</h1>

      {pictureBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="text-8xl">📭</div>
          <p className="text-xl font-bold text-white/50">No picture books yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {pictureBooks.map((pb) => (
            <PictureBookCard key={pb._id} pictureBook={pb} />
          ))}
        </div>
      )}
    </div>
  );
}
