import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { insertSentencesForTopic } from "@/lib/sentences/importSentences";

// Canned starter sentences offered by the "Insert Examples" button.
// Re-clicking is safe — insertSentencesForTopic skips any that are
// already present in the topic.
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
    const { inserted, skippedDuplicates } = await insertSentencesForTopic(params.topicId, EXAMPLE_SENTENCES);
    return NextResponse.json({ inserted, skippedDuplicates });
  } catch {
    return NextResponse.json({ error: "Failed to insert example sentences" }, { status: 500 });
  }
}
