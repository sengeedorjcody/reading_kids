import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import DictionaryWord from "@/lib/db/models/DictionaryWord";
import { jaToMn } from "@/lib/bolor-toli";

// ─── Hiragana → Romaji table ──────────────────────────────────────────────────
const HIRA_ROMAJI: Record<string, string> = {
  あ:"a",い:"i",う:"u",え:"e",お:"o",
  か:"ka",き:"ki",く:"ku",け:"ke",こ:"ko",
  さ:"sa",し:"shi",す:"su",せ:"se",そ:"so",
  た:"ta",ち:"chi",つ:"tsu",て:"te",と:"to",
  な:"na",に:"ni",ぬ:"nu",ね:"ne",の:"no",
  は:"ha",ひ:"hi",ふ:"fu",へ:"he",ほ:"ho",
  ま:"ma",み:"mi",む:"mu",め:"me",も:"mo",
  や:"ya",ゆ:"yu",よ:"yo",
  ら:"ra",り:"ri",る:"ru",れ:"re",ろ:"ro",
  わ:"wa",を:"wo",ん:"n",
  が:"ga",ぎ:"gi",ぐ:"gu",げ:"ge",ご:"go",
  ざ:"za",じ:"ji",ず:"zu",ぜ:"ze",ぞ:"zo",
  だ:"da",ぢ:"ji",づ:"zu",で:"de",ど:"do",
  ば:"ba",び:"bi",ぶ:"bu",べ:"be",ぼ:"bo",
  ぱ:"pa",ぴ:"pi",ぷ:"pu",ぺ:"pe",ぽ:"po",
  きゃ:"kya",きゅ:"kyu",きょ:"kyo",
  しゃ:"sha",しゅ:"shu",しょ:"sho",
  ちゃ:"cha",ちゅ:"chu",ちょ:"cho",
  にゃ:"nya",にゅ:"nyu",にょ:"nyo",
  ひゃ:"hya",ひゅ:"hyu",ひょ:"hyo",
  みゃ:"mya",みゅ:"myu",みょ:"myo",
  りゃ:"rya",りゅ:"ryu",りょ:"ryo",
  ぎゃ:"gya",ぎゅ:"gyu",ぎょ:"gyo",
  じゃ:"ja",じゅ:"ju",じょ:"jo",
  びゃ:"bya",びゅ:"byu",びょ:"byo",
  ぴゃ:"pya",ぴゅ:"pyu",ぴょ:"pyo",
};

function hiraganaToRomaji(str: string): string {
  let result = "";
  let i = 0;
  while (i < str.length) {
    const two = str.slice(i, i + 2);
    if (HIRA_ROMAJI[two]) { result += HIRA_ROMAJI[two]; i += 2; }
    else if (HIRA_ROMAJI[str[i]]) { result += HIRA_ROMAJI[str[i]]; i += 1; }
    else { result += str[i]; i += 1; }
  }
  return result;
}

// ─── Jisho API types ──────────────────────────────────────────────────────────
interface JishoEntry {
  japanese: { word?: string; reading?: string }[];
  senses: { english_definitions: string[]; parts_of_speech: string[] }[];
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { word } = await req.json();
  if (!word || typeof word !== "string") {
    return NextResponse.json({ error: "word is required" }, { status: 400 });
  }

  const cleanWord = word.trim();
  await connectDB();

  // ── 1. Check if already saved by the original English surface ──
  const byEnglish = await DictionaryWord.findOne({ english_meaning: new RegExp(`^${cleanWord}$`, "i") }).lean();
  if (byEnglish) return NextResponse.json(JSON.parse(JSON.stringify(byEnglish)));

  // ── 2. Search Jisho (free, no key) ───────────────────────────────────────
  let japanese_word = "";
  let hiragana = "";
  let english_meaning = cleanWord;

  try {
    const jishoRes = await fetch(
      `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(cleanWord)}`,
      { next: { revalidate: 0 } }
    );
    if (jishoRes.ok) {
      const jishoData = await jishoRes.json() as { data: JishoEntry[] };
      const entry = jishoData.data?.[0];
      if (entry) {
        japanese_word = entry.japanese?.[0]?.word || entry.japanese?.[0]?.reading || "";
        hiragana      = entry.japanese?.[0]?.reading || "";
        english_meaning = entry.senses?.[0]?.english_definitions?.join(", ") || cleanWord;
      }
    }
  } catch { /* fall through */ }

  // ── 3. Fallback: MyMemory en→ja (free, no key) ───────────────────────────
  if (!japanese_word) {
    try {
      const mmRes = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=en|ja`
      );
      if (mmRes.ok) {
        const mmData = await mmRes.json() as { responseData: { translatedText: string } };
        japanese_word = mmData.responseData?.translatedText || cleanWord;
        hiragana = japanese_word; // MyMemory sometimes returns kana directly
      }
    } catch { /* fall through */ }
  }

  if (!japanese_word) japanese_word = cleanWord;

  // ── 4. Build romaji from hiragana ─────────────────────────────────────────
  const romaji = hiragana ? hiraganaToRomaji(hiragana) : "";

  // ── 5. Get Mongolian via Bolor-Toli (ja→mn) ──────────────────────────────
  const mongolian_meaning = await jaToMn(japanese_word);

  // ── 6. Upsert into dictionary ─────────────────────────────────────────────
  const saved = await DictionaryWord.findOneAndUpdate(
    { japanese_word },
    {
      $setOnInsert: {
        japanese_word,
        hiragana,
        romaji,
        english_meaning,
        mongolian_meaning,
      },
    },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json(JSON.parse(JSON.stringify(saved)));
}
