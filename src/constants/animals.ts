export interface Animal {
  emoji: string;
  japanese: string; // hiragana — spoken by Japanese TTS
  romaji: string;
  english: string;
}

export const ANIMALS: Animal[] = [
  { emoji: "🐶", japanese: "いぬ",       romaji: "inu",      english: "Dog" },
  { emoji: "🐱", japanese: "ねこ",       romaji: "neko",     english: "Cat" },
  { emoji: "🐻", japanese: "くま",       romaji: "kuma",     english: "Bear" },
  { emoji: "🐰", japanese: "うさぎ",     romaji: "usagi",    english: "Rabbit" },
  { emoji: "🐘", japanese: "ぞう",       romaji: "zou",      english: "Elephant" },
  { emoji: "🦁", japanese: "らいおん",   romaji: "raion",    english: "Lion" },
  { emoji: "🐯", japanese: "とら",       romaji: "tora",     english: "Tiger" },
  { emoji: "🐒", japanese: "さる",       romaji: "saru",     english: "Monkey" },
  { emoji: "🐼", japanese: "ぱんだ",     romaji: "panda",    english: "Panda" },
  { emoji: "🦊", japanese: "きつね",     romaji: "kitsune",  english: "Fox" },
  { emoji: "🐴", japanese: "うま",       romaji: "uma",      english: "Horse" },
  { emoji: "🐮", japanese: "うし",       romaji: "ushi",     english: "Cow" },
  { emoji: "🐷", japanese: "ぶた",       romaji: "buta",     english: "Pig" },
  { emoji: "🐑", japanese: "ひつじ",     romaji: "hitsuji",  english: "Sheep" },
  { emoji: "🐧", japanese: "ぺんぎん",   romaji: "pengin",   english: "Penguin" },
  { emoji: "🦒", japanese: "きりん",     romaji: "kirin",    english: "Giraffe" },
  { emoji: "🐊", japanese: "わに",       romaji: "wani",     english: "Crocodile" },
  { emoji: "🐸", japanese: "かえる",     romaji: "kaeru",    english: "Frog" },
  { emoji: "🐢", japanese: "かめ",       romaji: "kame",     english: "Turtle" },
  { emoji: "🐙", japanese: "たこ",       romaji: "tako",     english: "Octopus" },
  { emoji: "🦋", japanese: "ちょうちょ", romaji: "choucho",  english: "Butterfly" },
  { emoji: "🐟", japanese: "さかな",     romaji: "sakana",   english: "Fish" },
  { emoji: "🦆", japanese: "あひる",     romaji: "ahiru",    english: "Duck" },
  { emoji: "🐍", japanese: "へび",       romaji: "hebi",     english: "Snake" },
  { emoji: "🦓", japanese: "しまうま",   romaji: "shimauma", english: "Zebra" },
  { emoji: "🦘", japanese: "かんがるー", romaji: "kangaru",  english: "Kangaroo" },
  { emoji: "🦔", japanese: "はりねずみ", romaji: "harinezumi", english: "Hedgehog" },
  { emoji: "🐺", japanese: "おおかみ",   romaji: "ookami",   english: "Wolf" },
  { emoji: "🦅", japanese: "わし",       romaji: "washi",    english: "Eagle" },
  { emoji: "🐬", japanese: "いるか",     romaji: "iruka",    english: "Dolphin" },
];
