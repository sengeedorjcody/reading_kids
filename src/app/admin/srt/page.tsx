export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import Book from "@/lib/db/models/Book";
import Conversation from "@/lib/db/models/Conversation";
import Link from "next/link";
import SrtImportForm from "@/components/admin/SrtImportForm";

async function getData() {
  await connectDB();
  const [books, conversations] = await Promise.all([
    Book.find().sort({ title: 1 }).select("title").lean(),
    Conversation.find().sort({ title: 1 }).select("title").lean(),
  ]);
  return { books, conversations };
}

export default async function AdminSrtPage() {
  const { books, conversations } = await getData();
  const bookList = JSON.parse(JSON.stringify(books)) as { _id: string; title: string }[];
  const convList = JSON.parse(JSON.stringify(conversations)) as { _id: string; title: string }[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-800">🎬 SRT Import</h1>
        <Link
          href="/admin/dictionary"
          className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-2 px-5 rounded-2xl transition-all"
        >
          📝 Dictionary →
        </Link>
      </div>

      <p className="text-gray-500 font-medium">
        SRT файлыг оруулаад <span className="font-bold text-gray-700">分かち書き</span>{" "}
        (үг хооронд зай)-аар засаж, цэвэрлэсэн хувилбарыг татаж авна. Watermark болон{" "}
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">[音楽]</code> тэмдгүүд автоматаар устана.
      </p>

      <SrtImportForm />

      {/* For later: attach the imported subtitles to a book / conversation */}
      <div className="bg-white rounded-3xl p-6">
        <h2 className="text-lg font-black text-gray-800 mb-3">🔗 Attach to</h2>
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <p className="font-bold text-gray-400 uppercase tracking-wide text-xs mb-1">
              Books ({bookList.length})
            </p>
            <ul className="space-y-1">
              {bookList.slice(0, 5).map((b) => (
                <li key={b._id} className="text-gray-700 font-medium">📚 {b.title}</li>
              ))}
              {bookList.length === 0 && <li className="text-gray-300">—</li>}
            </ul>
          </div>
          <div>
            <p className="font-bold text-gray-400 uppercase tracking-wide text-xs mb-1">
              Conversations ({convList.length})
            </p>
            <ul className="space-y-1">
              {convList.slice(0, 5).map((c) => (
                <li key={c._id} className="text-gray-700 font-medium">💬 {c.title}</li>
              ))}
              {convList.length === 0 && <li className="text-gray-300">—</li>}
            </ul>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Хадгалах бол <code className="bg-gray-100 px-1.5 py-0.5 rounded">SrtImportForm</code>-д
          сонгосон conversationId-тай нэг API route (жишээ:{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded">POST /api/admin/srt</code>) залгаад
          cue-үүдийг DB-д бичнэ.
        </p>
      </div>
    </div>
  );
}
