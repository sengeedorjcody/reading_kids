export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import BellaReading from "@/lib/db/models/BellaReading";
import DictionaryWord from "@/lib/db/models/DictionaryWord";
import { IBellaReading } from "@/types";
import BellaReadingReader from "@/components/bella-reading/BellaReadingReader";
import { getSampleBellaReading, SAMPLE_BELLA_ID } from "@/lib/bellaSample";

async function getReading(id: string): Promise<IBellaReading | null> {
  if (id === SAMPLE_BELLA_ID) {
    return getSampleBellaReading();
  }
  try {
    await connectDB();
    void DictionaryWord.modelName;
    const doc = await BellaReading.findById(id)
      .populate("sentences.words.dictionaryRef")
      .lean();
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc)) as IBellaReading;
  } catch {
    return null;
  }
}

export default async function BellaReadingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const reading = await getReading(params.id);
  if (!reading) notFound();

  return <BellaReadingReader reading={reading} />;
}
