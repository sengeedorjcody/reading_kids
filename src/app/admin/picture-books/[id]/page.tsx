export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import PictureBook from "@/lib/db/models/PictureBook";
import PictureBookPage from "@/lib/db/models/PictureBookPage";
import Background from "@/lib/db/models/Background";
import { IPictureBook, IPictureBookPage } from "@/types";
import PictureBookPageEditor from "@/components/admin/PictureBookPageEditor";
import PictureBookPublishToggle from "@/components/admin/PictureBookPublishToggle";

async function getData(id: string) {
  try {
    await connectDB();
    const [pb, pages, backgrounds] = await Promise.all([
      PictureBook.findById(id).lean(),
      PictureBookPage.find({ pictureBookId: id }).sort({ pageNumber: 1 }).lean(),
      Background.find().sort({ createdAt: -1 }).lean(),
    ]);
    return { pb, pages, backgrounds };
  } catch { return { pb: null, pages: [], backgrounds: [] }; }
}

export default async function AdminPictureBookDetailPage({ params }: { params: { id: string } }) {
  const { pb, pages, backgrounds } = await getData(params.id);
  if (!pb) notFound();

  const pictureBook = JSON.parse(JSON.stringify(pb)) as IPictureBook;
  const pbPages = JSON.parse(JSON.stringify(pages)) as IPictureBookPage[];
  const bgList = JSON.parse(JSON.stringify(backgrounds)) as { _id: string; name: string; imageUrl: string }[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/picture-books" className="text-gray-400 hover:text-gray-600 text-sm font-bold">← Picture Books</Link>
          <h1 className="text-2xl font-black text-gray-700 flex items-center gap-2 mt-1">
            🖼️ {pictureBook.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pictureBook.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {pictureBook.isPublished ? "Published" : "Draft"}
            </span>
            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">{pictureBook.level}</span>
            <span className="text-xs text-gray-400">{pbPages.length} pages</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PictureBookPublishToggle pictureBookId={pictureBook._id} isPublished={pictureBook.isPublished} />
          <Link
            href={`/picture-books/${pictureBook._id}/read/1`}
            target="_blank"
            className="bg-amber-50 hover:bg-amber-100 text-amber-600 font-bold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            👁 Preview →
          </Link>
        </div>
      </div>

      {/* Pages */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-gray-600">📄 Pages ({pbPages.length})</h2>

        {pbPages.map((page) => (
          <PictureBookPageEditor
            key={page._id}
            page={page}
            backgrounds={bgList}
            pictureBookId={params.id}
          />
        ))}

        <AddPageButton pictureBookId={params.id} />
      </div>
    </div>
  );
}

function AddPageButton({ pictureBookId }: { pictureBookId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        const { connectDB } = await import("@/lib/db/mongoose");
        const PBPage = (await import("@/lib/db/models/PictureBookPage")).default;
        const PB = (await import("@/lib/db/models/PictureBook")).default;
        await connectDB();
        const last = await PBPage.findOne({ pictureBookId }).sort({ pageNumber: -1 });
        const pageNumber = (last?.pageNumber ?? 0) + 1;
        await PBPage.create({ pictureBookId, pageNumber, rawText: "", sentences: [] });
        const total = await PBPage.countDocuments({ pictureBookId });
        await PB.findByIdAndUpdate(pictureBookId, { totalPages: total });
        const { revalidatePath } = await import("next/cache");
        revalidatePath(`/admin/picture-books/${pictureBookId}`);
      }}
    >
      <button
        type="submit"
        className="w-full border-2 border-dashed border-gray-200 hover:border-amber-300 text-gray-400 hover:text-amber-500 font-bold py-4 rounded-2xl transition-all hover:bg-amber-50"
      >
        + Add Page
      </button>
    </form>
  );
}
