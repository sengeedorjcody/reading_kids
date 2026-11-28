export const dynamic = "force-dynamic";

import Link from "next/link";
import { connectDB } from "@/lib/db/mongoose";
import BellaReading from "@/lib/db/models/BellaReading";
import { IBellaReading } from "@/types";
import {
  DeleteBellaReadingButton,
  PublishBellaReadingToggle,
  SeedSampleBellaReadingButton,
} from "@/components/admin/BellaReadingAdminActions";

async function getAllReadings(): Promise<{ readings: IBellaReading[]; dbError: boolean }> {
  try {
    await connectDB();
    const docs = await BellaReading.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return { readings: JSON.parse(JSON.stringify(docs)), dbError: false };
  } catch (err) {
    console.error("AdminBellaReadingPage DB error:", err);
    return { readings: [], dbError: true };
  }
}

export default async function AdminBellaReadingPage() {
  const { readings, dbError } = await getAllReadings();

  return (
    <div className="space-y-6">
      {dbError && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-bold text-rose-700">
          ⚠️ MongoDB-тэй холбогдож чадсангүй. <code className="font-mono">.env.local</code> дотор жинхэнэ <code className="font-mono">MONGODB_URI</code>-аа оруулаад dev server-ээ дахин асаана уу.
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800">
            🌸 Bella Reading
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage reading passages (tap-to-translate words) and comprehension questions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SeedSampleBellaReadingButton />
          <Link
            href="/admin/bella-reading/create"
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2.5 px-5 rounded-2xl text-sm shadow-md transition-all hover:-translate-y-0.5"
          >
            ＋ Add New Reading
          </Link>
        </div>
      </div>

      {readings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm space-y-3">
          <div className="text-5xl">🌸</div>
          <p className="text-lg font-bold text-gray-600">
            No Bella Reading passages yet
          </p>
          <p className="text-sm text-gray-400">
            Click &ldquo;Add New Reading&rdquo; or &ldquo;Insert Sample&rdquo; above to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {readings.map((item, i) => (
            <div
              key={item._id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 ${
                i !== readings.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-black text-gray-800 text-lg truncate">
                    {item.title}
                  </h2>
                  <span className="text-xs font-bold bg-pink-50 text-pink-600 px-2.5 py-0.5 rounded-full">
                    {item.level}
                  </span>
                  <PublishBellaReadingToggle
                    id={item._id}
                    isPublished={item.isPublished}
                  />
                </div>
                {item.titleJapanese && (
                  <p className="text-sm text-gray-500">{item.titleJapanese}</p>
                )}
                <p className="text-xs text-gray-400">
                  📄 {item.sentences?.length ?? 0} lines · ❓{" "}
                  {item.questions?.length ?? 0} questions · Order: {item.order}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/bella-reading/${item._id}`}
                  target="_blank"
                  className="text-blue-500 hover:text-blue-700 font-bold text-xs"
                >
                  View ↗
                </Link>
                <Link
                  href={`/admin/bella-reading/${item._id}`}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors"
                >
                  ✏️ Edit
                </Link>
                <DeleteBellaReadingButton id={item._id} title={item.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
