import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Topic from "@/lib/db/models/Topic";
import Sentence from "@/lib/db/models/Sentence";

const MAX_SENTENCES_PER_TOPIC = 4;

// Canned starter sentences offered by the "Insert Examples" button. There
// are 5 so admins always have a spare if one doesn't fit a topic — but a
// topic can only ever hold 4, so the 5th is dropped when all are inserted.
const EXAMPLE_SENTENCES = [
  { japanese: "ねこ が すき です。", romaji: "neko ga suki desu.", english_meaning: "I like cats.", mongolian_meaning: "Би муур дуртай." },
  { japanese: "いぬ が います。", romaji: "inu ga imasu.", english_meaning: "There is a dog.", mongolian_meaning: "Нохой байна." },
  { japanese: "がっこう へ いきます。", romaji: "gakkou e ikimasu.", english_meaning: "I go to school.", mongolian_meaning: "Би сургууль руу явна." },
  { japanese: "ほん を よみます。", romaji: "hon o yomimasu.", english_meaning: "I read a book.", mongolian_meaning: "Би ном уншина." },
  { japanese: "みず を のみます。", romaji: "mizu o nomimasu.", english_meaning: "I drink water.", mongolian_meaning: "Би ус уудаг." },
];

export async function POST(
  _req: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    await connectDB();
    const existingCount = await Sentence.countDocuments({ topicId: params.topicId });
    const remainingSlots = Math.max(0, MAX_SENTENCES_PER_TOPIC - existingCount);
    const toInsert = EXAMPLE_SENTENCES.slice(0, remainingSlots);

    for (let i = 0; i < toInsert.length; i++) {
      await Sentence.create({ ...toInsert[i], topicId: params.topicId, order: existingCount + i + 1 });
    }

    const total = await Sentence.countDocuments({ topicId: params.topicId });
    await Topic.findByIdAndUpdate(params.topicId, { totalSentences: total });

    const dropped = EXAMPLE_SENTENCES.length - toInsert.length;
    return NextResponse.json({ inserted: toInsert.length, dropped });
  } catch {
    return NextResponse.json({ error: "Failed to insert example sentences" }, { status: 500 });
  }
}
