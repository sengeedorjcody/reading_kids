export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import BellaReading from "@/lib/db/models/BellaReading";
import { IBellaReading } from "@/types";
import BellaReadingForm from "@/components/admin/BellaReadingForm";

async function getReading(id: string): Promise<IBellaReading | null> {
  try {
    await connectDB();
    const doc = await BellaReading.findById(id).lean();
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc)) as IBellaReading;
  } catch {
    return null;
  }
}

export default async function EditBellaReadingPage({
  params,
}: {
  params: { id: string };
}) {
  const reading = await getReading(params.id);
  if (!reading) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/bella-reading"
            className="text-gray-400 hover:text-gray-600 font-bold text-sm"
          >
            ← Back
          </Link>
          <h1 className="text-3xl font-black text-gray-800">
            ✏️ Edit Bella Reading
          </h1>
        </div>

        <Link
          href={`/bella-reading/${reading._id}`}
          target="_blank"
          className="text-pink-500 hover:underline font-bold text-sm"
        >
          View Live ↗
        </Link>
      </div>

      <BellaReadingForm initial={reading} />
    </div>
  );
}
