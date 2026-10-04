import { connectDB } from "@/lib/db/mongoose";
import DictionaryWord from "@/lib/db/models/DictionaryWord";
import WeeklyWords from "@/lib/db/models/WeeklyWords";

export const WORDS_PER_WEEK = 8;

export const DEFAULT_FALLBACK_WORDS = [
  {
    japanese_word: "おはよう",
    hiragana: "おはよう",
    romaji: "ohayou",
    english_meaning: "Good morning (casual)",
    mongolian_meaning: "Өглөөний мэнд (дотно)",
    example_sentence: "おはよう！きょうも いい てんきだね。",
    example_sentence_reading: "Ohayou! Kyou mo ii tenki da ne.",
  },
  {
    japanese_word: "おはようございます",
    hiragana: "おはようございます",
    romaji: "ohayou gozaimasu",
    english_meaning: "Good morning (polite)",
    mongolian_meaning: "Өглөөний мэнд (эелдэг)",
    example_sentence: "おはようございます！みんな、おきて～！",
    example_sentence_reading: "Ohayou gozaimasu! Minna, okite~!",
  },
  {
    japanese_word: "てんき",
    hiragana: "てんき",
    romaji: "tenki",
    english_meaning: "weather",
    mongolian_meaning: "Цаг агаар",
    example_sentence: "きょうは いい てんきだね。",
    example_sentence_reading: "Kyou wa ii tenki da ne.",
  },
  {
    japanese_word: "みんな",
    hiragana: "みんな",
    romaji: "minna",
    english_meaning: "everyone / all",
    mongolian_meaning: "Бүгд / хүн бүр",
    example_sentence: "みんな、おきて！",
    example_sentence_reading: "Minna, okite!",
  },
  {
    japanese_word: "おきる",
    hiragana: "おきる",
    romaji: "okiru",
    english_meaning: "to wake up / to get up",
    mongolian_meaning: "Босох / сэрэх",
    example_sentence: "はやく おきてね。",
    example_sentence_reading: "Hayaku okite ne.",
  },
  {
    japanese_word: "いい",
    hiragana: "いい",
    romaji: "ii",
    english_meaning: "good / nice",
    mongolian_meaning: "Сайн / гоё",
    example_sentence: "きょうは いい てんきです。",
    example_sentence_reading: "Kyou wa ii tenki desu.",
  },
  {
    japanese_word: "おなか",
    hiragana: "おなか",
    romaji: "onaka",
    english_meaning: "stomach / belly",
    mongolian_meaning: "Гэдэс",
    example_sentence: "おなかが すいた！",
    example_sentence_reading: "Onaka ga suita!",
  },
  {
    japanese_word: "すいた",
    hiragana: "すいた",
    romaji: "suita",
    english_meaning: "hungry (became empty)",
    mongolian_meaning: "Өлсөж байна",
    example_sentence: "おなかが すいた！",
    example_sentence_reading: "Onaka ga suita!",
  },
  {
    japanese_word: "ごはん",
    hiragana: "ごはん",
    romaji: "gohan",
    english_meaning: "rice / meal / food",
    mongolian_meaning: "Цагаан будаа / хоол",
    example_sentence: "ごはんが できましたよ。",
    example_sentence_reading: "Gohan ga dekimashita yo.",
  },
  {
    japanese_word: "たくさん",
    hiragana: "たくさん",
    romaji: "takusan",
    english_meaning: "a lot / many / much",
    mongolian_meaning: "Их / маш олон",
    example_sentence: "たくさん たべてね。",
    example_sentence_reading: "Takusan tabete ne.",
  },
  {
    japanese_word: "たべる",
    hiragana: "たべる",
    romaji: "taberu",
    english_meaning: "to eat",
    mongolian_meaning: "Идэх",
    example_sentence: "いっしょに たべましょう！",
    example_sentence_reading: "Issho ni tabemashou!",
  },
  {
    japanese_word: "いただきます",
    hiragana: "いただきます",
    romaji: "itadakimasu",
    english_meaning: "Let's eat! (before meal)",
    mongolian_meaning: "Хооллохын өмнөх мэндчилгээ",
    example_sentence: "みんなで いただきます！",
    example_sentence_reading: "Minna de itadakimasu!",
  },
  {
    japanese_word: "おいしい",
    hiragana: "おいしい",
    romaji: "oishii",
    english_meaning: "delicious / tasty",
    mongolian_meaning: "Амттай",
    example_sentence: "おいしい！たまごが だいすき！",
    example_sentence_reading: "Oishii! Tamago ga daisuki!",
  },
  {
    japanese_word: "たまご",
    hiragana: "たまご",
    romaji: "tamago",
    english_meaning: "egg",
    mongolian_meaning: "Өндөг",
    example_sentence: "たまごが だいすき！",
    example_sentence_reading: "Tamago ga daisuki!",
  },
  {
    japanese_word: "パン",
    hiragana: "パン",
    romaji: "pan",
    english_meaning: "bread",
    mongolian_meaning: "Талх",
    example_sentence: "パンも おいしいね。",
    example_sentence_reading: "Pan mo oishii ne.",
  },
  {
    japanese_word: "もっと",
    hiragana: "もっと",
    romaji: "motto",
    english_meaning: "more",
    mongolian_meaning: "Илүү / дахин",
    example_sentence: "もっと たべる？",
    example_sentence_reading: "Motto taberu?",
  },
  {
    japanese_word: "はちじ",
    hiragana: "はちじ",
    romaji: "hachi-ji",
    english_meaning: "8 o'clock",
    mongolian_meaning: "Найман цаг",
    example_sentence: "もう はちじだ！",
    example_sentence_reading: "Mou hachi-ji da!",
  },
  {
    japanese_word: "はやく",
    hiragana: "はやく",
    romaji: "hayaku",
    english_meaning: "quickly / hurry",
    mongolian_meaning: "Хурдан / яарах",
    example_sentence: "はやく じゅんびして！",
    example_sentence_reading: "Hayaku junbi shite!",
  },
  {
    japanese_word: "じゅんび",
    hiragana: "じゅんび",
    romaji: "junbi",
    english_meaning: "preparation / getting ready",
    mongolian_meaning: "Бэлтгэл / бэлэн болох",
    example_sentence: "はやく じゅんびしてね。",
    example_sentence_reading: "Hayaku junbi shite ne.",
  },
  {
    japanese_word: "かばん",
    hiragana: "かばん",
    romaji: "kaban",
    english_meaning: "bag",
    mongolian_meaning: "Цүнх",
    example_sentence: "かばんは どこ？",
    example_sentence_reading: "Kaban wa doko?",
  },
  {
    japanese_word: "ここ",
    hiragana: "ここ",
    romaji: "koko",
    english_meaning: "here",
    mongolian_meaning: "Энд",
    example_sentence: "ここに あるよ！",
    example_sentence_reading: "Koko ni aru yo!",
  },
  {
    japanese_word: "くつ",
    hiragana: "くつ",
    romaji: "kutsu",
    english_meaning: "shoes",
    mongolian_meaning: "Гутал",
    example_sentence: "くつを はくよ。",
    example_sentence_reading: "Kutsu wo haku yo.",
  },
  {
    japanese_word: "はく",
    hiragana: "はく",
    romaji: "haku",
    english_meaning: "to put on (shoes/pants)",
    mongolian_meaning: "Өмсөх (гутал, өмд)",
    example_sentence: "くつを はくよ。",
    example_sentence_reading: "Kutsu wo haku yo.",
  },
  {
    japanese_word: "いってきます",
    hiragana: "いってきます",
    romaji: "itte kimasu",
    english_meaning: "I'm off / See you later (leaving home)",
    mongolian_meaning: "Явлаа / буцаж ирнэ",
    example_sentence: "いってきます！またあとで！",
    example_sentence_reading: "Itte kimasu! Mata ato de!",
  },
];

export async function syncWeeklyWordsFromDictionary() {
  await connectDB();

  let dictWords = await DictionaryWord.find().sort({ createdAt: 1, _id: 1 }).lean();

  if (!dictWords || dictWords.length === 0) {
    for (const w of DEFAULT_FALLBACK_WORDS) {
      await DictionaryWord.findOneAndUpdate(
        { japanese_word: w.japanese_word },
        { $setOnInsert: w },
        { upsert: true }
      );
    }
    dictWords = await DictionaryWord.find().sort({ createdAt: 1, _id: 1 }).lean();
  }

  const weeksCreated = [];
  for (let i = 0; i < dictWords.length; i += WORDS_PER_WEEK) {
    const chunk = dictWords.slice(i, i + WORDS_PER_WEEK);
    const weekNumber = Math.floor(i / WORDS_PER_WEEK) + 1;

    const wordsData = chunk.map((w, idx) => ({
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

    const weekDoc = await WeeklyWords.findOneAndUpdate(
      { weekNumber },
      {
        weekNumber,
        title: `Week ${weekNumber}`,
        titleJapanese: `第${weekNumber}週`,
        description: `Week ${weekNumber} vocabulary words`,
        coverImageUrl,
        words: wordsData,
        totalWords: wordsData.length,
        order: weekNumber,
        isPublished: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    weeksCreated.push(weekDoc);
  }

  return weeksCreated;
}
