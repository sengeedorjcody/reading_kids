import DictionaryWord from "@/lib/db/models/DictionaryWord";
import { IFamilyTalkWord } from "@/types";

// Family Talk words are edited independently of the dictionary, but many
// admins will type in a word (e.g. "ごはん") that's already catalogued
// there with an image/romaji/hiragana. Rather than force a re-upload,
// fill in whatever the word itself is missing from the first dictionary
// entry whose japanese_word or hiragana matches — without touching what's
// already stored on the word.
export async function enrichFamilyWordsFromDictionary<T extends IFamilyTalkWord>(words: T[]): Promise<T[]> {
  const lookupTexts = Array.from(new Set(words.map((w) => w.japanese).filter(Boolean)));
  if (lookupTexts.length === 0) return words;

  const matches = await DictionaryWord.find({
    $or: [{ japanese_word: { $in: lookupTexts } }, { hiragana: { $in: lookupTexts } }],
  })
    .select("japanese_word hiragana romaji example_image_url")
    .lean();

  const byText = new Map<string, (typeof matches)[number]>();
  for (const m of matches) {
    if (m.japanese_word) byText.set(m.japanese_word, m);
    if (m.hiragana) byText.set(m.hiragana, m);
  }

  return words.map((w) => {
    const dictWord = byText.get(w.japanese);
    if (!dictWord) return w;
    return {
      ...w,
      imageUrl: w.imageUrl || dictWord.example_image_url || w.imageUrl,
      romaji: w.romaji || dictWord.romaji || w.romaji,
      hiragana: w.hiragana || dictWord.hiragana || w.hiragana,
    };
  });
}
