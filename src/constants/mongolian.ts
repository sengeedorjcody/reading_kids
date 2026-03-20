import { KanaChar } from "@/types";

// phonetic: English TTS-friendly string that produces the correct Mongolian sound
export const MONGOLIAN: KanaChar[] = [
  // ── Vowels ──────────────────────────────────────────────
  { char: "А", romaji: "a",  phonetic: "ah",   row: "vowels", exampleWord: "Аав",    exampleMeaning: "Father" },
  { char: "Э", romaji: "e",  phonetic: "eh",   row: "vowels", exampleWord: "Эх",     exampleMeaning: "Mother" },
  { char: "И", romaji: "i",  phonetic: "ee",   row: "vowels", exampleWord: "Идэш",   exampleMeaning: "Food" },
  { char: "О", romaji: "o",  phonetic: "oh",   row: "vowels", exampleWord: "Орон",   exampleMeaning: "Country" },
  { char: "Ө", romaji: "ö",  phonetic: "uh",   row: "vowels", exampleWord: "Өдөр",   exampleMeaning: "Day" },
  { char: "У", romaji: "u",  phonetic: "oo",   row: "vowels", exampleWord: "Ус",     exampleMeaning: "Water" },
  { char: "Ү", romaji: "ü",  phonetic: "ew",   row: "vowels", exampleWord: "Үнэн",   exampleMeaning: "Truth" },
  { char: "Е", romaji: "ye", phonetic: "yeh",  row: "vowels", exampleWord: "Ехор",   exampleMeaning: "Dance" },
  { char: "Ё", romaji: "yo", phonetic: "yoh",  row: "vowels", exampleWord: "Ёроол",  exampleMeaning: "Bottom" },
  { char: "Ю", romaji: "yu", phonetic: "yoo",  row: "vowels", exampleWord: "Юм",     exampleMeaning: "Thing" },
  { char: "Я", romaji: "ya", phonetic: "yah",  row: "vowels", exampleWord: "Яс",     exampleMeaning: "Bone" },

  // ── Consonants – group 1 ────────────────────────────────
  { char: "Б", romaji: "b",  phonetic: "buh",  row: "consonants1", exampleWord: "Байшин", exampleMeaning: "House" },
  { char: "В", romaji: "v",  phonetic: "vuh",  row: "consonants1", exampleWord: "Вааль",  exampleMeaning: "Whale" },
  { char: "Г", romaji: "g",  phonetic: "guh",  row: "consonants1", exampleWord: "Гар",    exampleMeaning: "Hand" },
  { char: "Д", romaji: "d",  phonetic: "duh",  row: "consonants1", exampleWord: "Дэвтэр", exampleMeaning: "Notebook" },
  { char: "Ж", romaji: "j",  phonetic: "juh",  row: "consonants1", exampleWord: "Жимс",   exampleMeaning: "Fruit" },
  { char: "З", romaji: "z",  phonetic: "zuh",  row: "consonants1", exampleWord: "Зам",    exampleMeaning: "Road" },
  { char: "Й", romaji: "y",  phonetic: "yuh",  row: "consonants1", exampleWord: "Ойн",    exampleMeaning: "Forest" },
  { char: "К", romaji: "k",  phonetic: "kuh",  row: "consonants1", exampleWord: "Кино",   exampleMeaning: "Movie" },
  { char: "Л", romaji: "l",  phonetic: "luh",  row: "consonants1", exampleWord: "Лав",    exampleMeaning: "Certainly" },
  { char: "М", romaji: "m",  phonetic: "muh",  row: "consonants1", exampleWord: "Мал",    exampleMeaning: "Livestock" },

  // ── Consonants – group 2 ────────────────────────────────
  { char: "Н", romaji: "n",  phonetic: "nuh",   row: "consonants2", exampleWord: "Нар",    exampleMeaning: "Sun" },
  { char: "П", romaji: "p",  phonetic: "puh",   row: "consonants2", exampleWord: "Пуужин", exampleMeaning: "Rocket" },
  { char: "Р", romaji: "r",  phonetic: "ruh",   row: "consonants2", exampleWord: "Рашаан", exampleMeaning: "Spring water" },
  { char: "С", romaji: "s",  phonetic: "suh",   row: "consonants2", exampleWord: "Сар",    exampleMeaning: "Moon" },
  { char: "Т", romaji: "t",  phonetic: "tuh",   row: "consonants2", exampleWord: "Тэнгэр", exampleMeaning: "Sky" },
  { char: "Ф", romaji: "f",  phonetic: "fuh",   row: "consonants2", exampleWord: "Файл",   exampleMeaning: "File" },
  { char: "Х", romaji: "kh", phonetic: "khh",   row: "consonants2", exampleWord: "Хүн",    exampleMeaning: "Person" },
  { char: "Ц", romaji: "ts", phonetic: "tsuh",  row: "consonants2", exampleWord: "Цас",    exampleMeaning: "Snow" },
  { char: "Ч", romaji: "ch", phonetic: "chuh",  row: "consonants2", exampleWord: "Чулуу",  exampleMeaning: "Stone" },
  { char: "Ш", romaji: "sh", phonetic: "shuh",  row: "consonants2", exampleWord: "Шар",    exampleMeaning: "Yellow" },

  // ── Special / less-common ───────────────────────────────
  { char: "Щ", romaji: "shch", phonetic: "shchuh",     row: "special", exampleWord: "Щедрость", exampleMeaning: "Generosity" },
  { char: "Ъ", romaji: "ʺ",   phonetic: "hard sign",   row: "special", exampleWord: "Объект",   exampleMeaning: "Object" },
  { char: "Ы", romaji: "ï",   phonetic: "ih",           row: "special", exampleWord: "Бы",       exampleMeaning: "(particle)" },
  { char: "Ь", romaji: "ʹ",   phonetic: "soft sign",   row: "special", exampleWord: "Борьба",   exampleMeaning: "Struggle" },
];
