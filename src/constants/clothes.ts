export interface VocabItem {
  emoji: string;
  japanese: string; // hiragana — spoken by Japanese TTS
  romaji: string;
  english: string;
}

export const CLOTHES: VocabItem[] = [
  { emoji: "👕", japanese: "シャツ", romaji: "shatsu", english: "Shirt" },
  { emoji: "👖", japanese: "ズボン", romaji: "zubon", english: "Pants" },
  { emoji: "👗", japanese: "ワンピース", romaji: "wanpīsu", english: "Dress" },
  { emoji: "🧦", japanese: "くつした", romaji: "kutsushita", english: "Socks" },
  { emoji: "👟", japanese: "くつ", romaji: "kutsu", english: "Shoes" },
  { emoji: "🧥", japanese: "コート", romaji: "kōto", english: "Coat" },
  { emoji: "🧢", japanese: "ぼうし", romaji: "bōshi", english: "Hat" },
  { emoji: "🧣", japanese: "マフラー", romaji: "mafurā", english: "Scarf" },
  { emoji: "🧤", japanese: "てぶくろ", romaji: "tebukuro", english: "Gloves" },
  { emoji: "👔", japanese: "ネクタイ", romaji: "nekutai", english: "Tie" },
  { emoji: "🩳", japanese: "はんずぼん", romaji: "hanzubon", english: "Shorts" },
  { emoji: "🩲", japanese: "したぎ", romaji: "shitagi", english: "Underwear" },
  { emoji: "👙", japanese: "みずぎ", romaji: "mizugi", english: "Swimsuit" },
  { emoji: "👘", japanese: "きもの", romaji: "kimono", english: "Kimono" },
  { emoji: "👢", japanese: "ブーツ", romaji: "būtsu", english: "Boots" },
  { emoji: "👡", japanese: "サンダル", romaji: "sandaru", english: "Sandals" },
  { emoji: "👜", japanese: "かばん", romaji: "kaban", english: "Bag" },
  { emoji: "👓", japanese: "めがね", romaji: "megane", english: "Glasses" },
  { emoji: "🌂", japanese: "かさ", romaji: "kasa", english: "Umbrella" },
  { emoji: "⌚", japanese: "とけい", romaji: "tokei", english: "Watch" }
];
