export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import PictureBook from "@/lib/db/models/PictureBook";
import DictionaryWord from "@/lib/db/models/DictionaryWord"; // must import before PictureBookPage to register schema
import PictureBookPage from "@/lib/db/models/PictureBookPage";
import { IPictureBook, IPictureBookPage } from "@/types";
import PictureBookLayout from "@/components/picture-book/PictureBookLayout";
import { notFound } from "next/navigation";
import Link from "next/link";

async function getReadingData(id: string, pageNum: number) {
  await connectDB();
  void DictionaryWord.modelName;
  const [pictureBook, page, totalPages] = await Promise.all([
    PictureBook.findById(id).lean(),
    PictureBookPage.findOne({ pictureBookId: id, pageNumber: pageNum })
      .populate("sentences.words.dictionaryRef")
      .lean(),
    PictureBookPage.countDocuments({ pictureBookId: id }),
  ]);

  if (!pictureBook || !page) return null;

  return {
    pictureBook: JSON.parse(JSON.stringify(pictureBook)) as IPictureBook,
    page: JSON.parse(JSON.stringify(page)) as IPictureBookPage,
    totalPages,
  };
}

export default async function PictureBookReadingPage({
  params,
}: {
  params: { id: string; pageNum: string };
}) {
  const pageNum = parseInt(params.pageNum);
  if (isNaN(pageNum) || pageNum < 1) notFound();

  const data = await getReadingData(params.id, pageNum);
  if (!data) notFound();

  const { pictureBook, page, totalPages } = data;

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-amber-50 border-b border-amber-100">
        <Link href={`/picture-books`} className="text-amber-500 hover:text-amber-700 font-bold text-sm">
          ← {pictureBook.title}
        </Link>
        {pictureBook.titleJapanese && (
          <span className="text-amber-400 text-sm">{pictureBook.titleJapanese}</span>
        )}
      </div>

      <PictureBookLayout
        page={page}
        pictureBookId={params.id}
        currentPage={pageNum}
        totalPages={totalPages}
      />
    </div>
  );
}
