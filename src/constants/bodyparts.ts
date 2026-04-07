export interface VocabItem {
  emoji: string;
  japanese: string; // hiragana — spoken by Japanese TTS
  romaji: string;
  english: string;
}

export const BODY_PARTS: VocabItem[] = [
  { emoji: "🤚", japanese: "て",       romaji: "te",      english: "Hand" },
  { emoji: "👃", japanese: "はな",     romaji: "hana",    english: "Nose" },
  { emoji: "👁️", japanese: "め",       romaji: "me",      english: "Eye" },
  { emoji: "👂", japanese: "みみ",     romaji: "mimi",    english: "Ear" },
  { emoji: "👄", japanese: "くち",     romaji: "kuchi",   english: "Mouth" },
  { emoji: "🦷", japanese: "は",       romaji: "ha",      english: "Tooth" },
  { emoji: "👅", japanese: "した",     romaji: "shita",   english: "Tongue" },
  { emoji: "💪", japanese: "うで",     romaji: "ude",     english: "Arm" },
  { emoji: "🦵", japanese: "あし",     romaji: "ashi",    english: "Leg" },
  { emoji: "🦶", japanese: "あしのうら", romaji: "ashiura", english: "Foot" },
  { emoji: "🖐️", japanese: "ゆび",     romaji: "yubi",    english: "Finger" },
  { emoji: "🧠", japanese: "のう",     romaji: "nou",     english: "Brain" },
  { emoji: "🫀", japanese: "しんぞう", romaji: "shinzou", english: "Heart" },
  { emoji: "🫁", japanese: "はい",     romaji: "hai",     english: "Lungs" },
  { emoji: "🦴", japanese: "ほね",     romaji: "hone",    english: "Bone" },
  { emoji: "💅", japanese: "つめ",     romaji: "tsume",   english: "Nail" },
  { emoji: "🦱", japanese: "かみ",     romaji: "kami",    english: "Hair" },
  { emoji: "😊", japanese: "かお",     romaji: "kao",     english: "Face" },
  { emoji: "🧑", japanese: "あたま",   romaji: "atama",   english: "Head" },
  { emoji: "🏃", japanese: "からだ",   romaji: "karada",  english: "Body" },
  { emoji: "🤷", japanese: "かた",     romaji: "kata",    english: "Shoulder" },
  { emoji: "🫃", japanese: "おなか",   romaji: "onaka",   english: "Belly" },
  { emoji: "🩸", japanese: "ち",       romaji: "chi",     english: "Blood" },
  { emoji: "💋", japanese: "くちびる", romaji: "kuchibiru", english: "Lips" },
  { emoji: "🧒", japanese: "せなか",   romaji: "senaka",  english: "Back" },
];
