import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined");
  process.exit(1);
}

const WORDS_PER_WEEK = 8;

const DEFAULT_FALLBACK_WORDS = [
  { japanese_word: "おはよう", hiragana: "おはよう", romaji: "ohayou", english_meaning: "Good morning (casual)", mongolian_meaning: "Өглөөний мэнд (дотно)" },
  { japanese_word: "おはようございます", hiragana: "おはようございます", romaji: "ohayou gozaimasu", english_meaning: "Good morning (polite)", mongolian_meaning: "Өглөөний мэнд (эелдэг)" },
  { japanese_word: "てんき", hiragana: "てんき", romaji: "tenki", english_meaning: "weather", mongolian_meaning: "Цаг агаар" },
  { japanese_word: "みんな", hiragana: "みんな", romaji: "minna", english_meaning: "everyone / all", mongolian_meaning: "Бүгд / хүн бүр" },
  { japanese_word: "おきる", hiragana: "おきる", romaji: "okiru", english_meaning: "to wake up / to get up", mongolian_meaning: "Босох / сэрэх" },
  { japanese_word: "いい", hiragana: "いい", romaji: "ii", english_meaning: "good / nice", mongolian_meaning: "Сайн / гоё" },
  { japanese_word: "おなか", hiragana: "おなか", romaji: "onaka", english_meaning: "stomach / belly", mongolian_meaning: "Гэдэс" },
  { japanese_word: "すいた", hiragana: "すいた", romaji: "suita", english_meaning: "hungry (became empty)", mongolian_meaning: "Өлсөж байна" },
  { japanese_word: "ごはん", hiragana: "ごはん", romaji: "gohan", english_meaning: "rice / meal / food", mongolian_meaning: "Цагаан будаа / хоол" },
  { japanese_word: "たくさん", hiragana: "たくさん", romaji: "takusan", english_meaning: "a lot / many / much", mongolian_meaning: "Их / маш олон" },
  { japanese_word: "たべる", hiragana: "たべる", romaji: "taberu", english_meaning: "to eat", mongolian_meaning: "Идэх" },
  { japanese_word: "いただきます", hiragana: "いただきます", romaji: "itadakimasu", english_meaning: "Let's eat! (before meal)", mongolian_meaning: "Хооллохын өмнөх мэндчилгээ" },
  { japanese_word: "おいしい", hiragana: "おいしい", romaji: "oishii", english_meaning: "delicious / tasty", mongolian_meaning: "Амттай" },
  { japanese_word: "たまご", hiragana: "たまご", romaji: "tamago", english_meaning: "egg", mongolian_meaning: "Өндөг" },
  { japanese_word: "パン", hiragana: "パン", romaji: "pan", english_meaning: "bread", mongolian_meaning: "Талх" },
  { japanese_word: "もっと", hiragana: "もっと", romaji: "motto", english_meaning: "more", mongolian_meaning: "Илүү / дахин" },
  { japanese_word: "はちじ", hiragana: "はちじ", romaji: "hachi-ji", english_meaning: "8 o'clock", mongolian_meaning: "Найман цаг" },
  { japanese_word: "はやく", hiragana: "はやく", romaji: "hayaku", english_meaning: "quickly / hurry", mongolian_meaning: "Хурдан / яарах" },
  { japanese_word: "じゅんび", hiragana: "じゅんび", romaji: "junbi", english_meaning: "preparation / getting ready", mongolian_meaning: "Бэлтгэл / бэлэн болох" },
  { japanese_word: "かばん", hiragana: "かばん", romaji: "kaban", english_meaning: "bag", mongolian_meaning: "Цүнх" },
  { japanese_word: "ここ", hiragana: "ここ", romaji: "koko", english_meaning: "here", mongolian_meaning: "Энд" },
  { japanese_word: "くつ", hiragana: "くつ", romaji: "kutsu", english_meaning: "shoes", mongolian_meaning: "Гутал" },
  { japanese_word: "はく", hiragana: "はく", romaji: "haku", english_meaning: "to put on (shoes/pants)", mongolian_meaning: "Өмсөх (гутал, өмд)" },
  { japanese_word: "いってきます", hiragana: "いってきます", romaji: "itte kimasu", english_meaning: "I'm off / See you later", mongolian_meaning: "Явлаа / буцаж ирнэ" },
];

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!");

  const dictCollection = mongoose.connection.collection("dictionarywords");
  let dictWords = await dictCollection.find().sort({ createdAt: 1, _id: 1 }).toArray();

  if (dictWords.length === 0) {
    console.log("Dictionary is empty. Inserting fallback words...");
    for (const w of DEFAULT_FALLBACK_WORDS) {
      await dictCollection.updateOne(
        { japanese_word: w.japanese_word },
        { $setOnInsert: { ...w, createdAt: new Date(), updatedAt: new Date() } },
        { upsert: true }
      );
    }
    dictWords = await dictCollection.find().sort({ createdAt: 1, _id: 1 }).toArray();
  }

  console.log(`Found ${dictWords.length} words in dictionary.`);

  const weeklyCollection = mongoose.connection.collection("weeklywords");

  let createdCount = 0;
  for (let i = 0; i < dictWords.length; i += WORDS_PER_WEEK) {
    const chunk = dictWords.slice(i, i + WORDS_PER_WEEK);
    const weekNumber = Math.floor(i / WORDS_PER_WEEK) + 1;

    const wordsData = chunk.map((w, idx) => ({
      _id: new mongoose.Types.ObjectId(),
      wordId: w._id,
      japanese_word: w.japanese_word,
      hiragana: w.hiragana || "",
      romaji: w.romaji || "",
      english_meaning: w.english_meaning || "",
      mongolian_meaning: w.mongolian_meaning || "",
      example_sentence: w.example_sentence || "",
      example_sentence_reading: w.example_sentence_reading || "",
      example_image_url: w.example_image_url || "",
      pronunciation_audio_url: w.pronunciation_audio_url || "",
      order: idx + 1,
    }));

    const coverImageUrl = chunk.find((w) => w.example_image_url)?.example_image_url || "";

    await weeklyCollection.updateOne(
      { weekNumber },
      {
        $set: {
          weekNumber,
          title: `Week ${weekNumber}`,
          titleJapanese: `第${weekNumber}週`,
          description: `Week ${weekNumber} vocabulary words`,
          coverImageUrl,
          words: wordsData,
          totalWords: wordsData.length,
          order: weekNumber,
          isPublished: true,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    createdCount++;
    console.log(`Created/updated Week ${weekNumber} with ${wordsData.length} words.`);
  }

  console.log(`🎉 Done! Generated ${createdCount} weekly word packs.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
