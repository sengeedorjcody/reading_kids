export const dynamic = "force-dynamic";

import Link from "next/link";
import { connectDB } from "@/lib/db/mongoose";
import BellaReading from "@/lib/db/models/BellaReading";
import { BookLevel, IBellaReading } from "@/types";
import LevelBadge from "@/components/books/LevelBadge";
import { getSampleBellaReading } from "@/lib/bellaSample";

async function getReadings(): Promise<{ readings: IBellaReading[]; dbError: boolean }> {
  try {
    await connectDB();
    const readings = await BellaReading.find({ isPublished: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return { readings: JSON.parse(JSON.stringify(readings)), dbError: false };
  } catch (err) {
    console.error("BellaReadingPage DB error:", err);
    return { readings: [getSampleBellaReading()], dbError: true };
  }
}

export default async function BellaReadingPage() {
  const { readings, dbError } = await getReadings();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-28">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">
            🌸 Bella Reading · べら よみもの
          </h1>
          <p className="text-sm text-white/60 mt-1">
            ぶんしょうを よんで、ことばの いみを しらべて、しつもんに こたえよう！
          </p>
        </div>
      </div>

      {dbError && (
        <div className="mb-6 rounded-2xl bg-amber-500/20 border border-amber-400/40 px-4 py-3 text-sm text-amber-100">
          ⚠️ MongoDB-тэй холбогдож чадсангүй (<code className="font-mono">.env.local</code> дотор жинхэнэ <code className="font-mono">MONGODB_URI</code>-аа тохируулна уу). Одоогоор sample хичээлийг харуулж байна.
        </div>
      )}

      {readings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="text-7xl">🌸</div>
          <p className="text-xl font-bold text-white/60">
            No reading passages yet
          </p>
          <p className="text-sm text-white/40">
            Add new reading passages and questions from the Admin Panel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {readings.map((item) => (
            <Link
              key={item._id}
              href={`/bella-reading/${item._id}`}
              className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col border-2 border-pink-100"
            >
              {/* Cover / header banner */}
              <div className="relative h-36 bg-gradient-to-br from-pink-100 via-rose-50 to-amber-50 flex items-center justify-center overflow-hidden">
                {item.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-center px-4">
                    <div className="text-5xl mb-1 group-hover:scale-110 transition-transform">
                      🌸
                    </div>
                    <p className="text-xs font-bold text-pink-400 line-clamp-2 book-font">
                      {item.sentences?.[0]?.text || ""}
                    </p>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <LevelBadge level={(item.level || "beginner") as BookLevel} />
                </div>
                {item.questions && item.questions.length > 0 && (
                  <span className="absolute top-3 right-3 bg-pink-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
                    ❓ {item.questions.length}
                  </span>
                )}
              </div>

              {/* Card body */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-gray-800 group-hover:text-pink-600 transition-colors line-clamp-2">
                    {item.title}
                  </h2>
                  {item.titleJapanese && (
                    <p className="text-sm font-bold text-pink-400 mt-0.5 line-clamp-1">
                      {item.titleJapanese}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs font-bold text-gray-400">
                  <span>📄 {item.sentences?.length ?? 0} lines</span>
                  <span className="text-pink-500 group-hover:translate-x-0.5 transition-transform">
                    よむ →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
