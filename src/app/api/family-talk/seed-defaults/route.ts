import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import FamilyTalkTopic from "@/lib/db/models/FamilyTalkTopic";
import FamilyTalkWord from "@/lib/db/models/FamilyTalkWord";

// Default starter topics offered by the admin "Seed Default Topics" button.
// Re-running is safe — any topic whose title already exists is skipped.
const DEFAULT_TOPICS: {
  title: string;
  titleJapanese: string;
  words: { japanese: string; romaji: string; english_meaning: string; mongolian_meaning: string }[];
}[] = [
  {
    title: "Family",
    titleJapanese: "かぞく",
    words: [
      { japanese: "おとうさん", romaji: "otousan", english_meaning: "father", mongolian_meaning: "аав" },
      { japanese: "おかあさん", romaji: "okaasan", english_meaning: "mother", mongolian_meaning: "ээж" },
      { japanese: "おにいさん", romaji: "oniisan", english_meaning: "older brother", mongolian_meaning: "ах" },
      { japanese: "おねえさん", romaji: "oneesan", english_meaning: "older sister", mongolian_meaning: "эгч" },
    ],
  },
  {
    title: "School",
    titleJapanese: "がっこう",
    words: [
      { japanese: "がっこう", romaji: "gakkou", english_meaning: "school", mongolian_meaning: "сургууль" },
      { japanese: "せんせい", romaji: "sensei", english_meaning: "teacher", mongolian_meaning: "багш" },
      { japanese: "がくせい", romaji: "gakusei", english_meaning: "student", mongolian_meaning: "сурагч" },
      { japanese: "ほん", romaji: "hon", english_meaning: "book", mongolian_meaning: "ном" },
    ],
  },
  {
    title: "Food",
    titleJapanese: "たべもの",
    words: [
      { japanese: "ごはん", romaji: "gohan", english_meaning: "rice", mongolian_meaning: "будаа" },
      { japanese: "みず", romaji: "mizu", english_meaning: "water", mongolian_meaning: "ус" },
      { japanese: "りんご", romaji: "ringo", english_meaning: "apple", mongolian_meaning: "алим" },
      { japanese: "パン", romaji: "pan", english_meaning: "bread", mongolian_meaning: "талх" },
    ],
  },
  {
    title: "Animals",
    titleJapanese: "どうぶつ",
    words: [
      { japanese: "いぬ", romaji: "inu", english_meaning: "dog", mongolian_meaning: "нохой" },
      { japanese: "ねこ", romaji: "neko", english_meaning: "cat", mongolian_meaning: "муур" },
      { japanese: "とり", romaji: "tori", english_meaning: "bird", mongolian_meaning: "шувуу" },
      { japanese: "さかな", romaji: "sakana", english_meaning: "fish", mongolian_meaning: "загас" },
    ],
  },
];

export async function POST() {
  try {
    await connectDB();
    const existing = await FamilyTalkTopic.find({}).select("title").lean();
    const existingTitles = new Set(existing.map((t) => t.title.toLowerCase()));

    let topicsCreated = 0;
    let wordsCreated = 0;

    for (const def of DEFAULT_TOPICS) {
      if (existingTitles.has(def.title.toLowerCase())) continue;
      const topic = await FamilyTalkTopic.create({
        title: def.title,
        titleJapanese: def.titleJapanese,
        isPublished: true,
        totalWords: def.words.length,
      });
      await FamilyTalkWord.insertMany(def.words.map((w) => ({ ...w, topicId: topic._id })));
      topicsCreated++;
      wordsCreated += def.words.length;
    }

    return NextResponse.json({ topicsCreated, wordsCreated });
  } catch {
    return NextResponse.json({ error: "Failed to seed default topics" }, { status: 500 });
  }
}
