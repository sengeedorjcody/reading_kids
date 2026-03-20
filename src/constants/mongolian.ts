import { KanaChar } from "@/types";

// Mongolian Cyrillic alphabet (35 letters)
// Rows: vowels, consonants1, consonants2, special
export const MONGOLIAN: KanaChar[] = [
  // ── Vowels ──────────────────────────────────────────────
  { char: "А", romaji: "a",  row: "vowels", exampleWord: "Аав",    exampleMeaning: "Father" },
  { char: "Э", romaji: "e",  row: "vowels", exampleWord: "Эх",     exampleMeaning: "Mother" },
  { char: "И", romaji: "i",  row: "vowels", exampleWord: "Идэш",   exampleMeaning: "Food" },
  { char: "О", romaji: "o",  row: "vowels", exampleWord: "Орон",   exampleMeaning: "Country" },
  { char: "Ө", romaji: "ö",  row: "vowels", exampleWord: "Өдөр",   exampleMeaning: "Day" },
  { char: "У", romaji: "u",  row: "vowels", exampleWord: "Ус",     exampleMeaning: "Water" },
  { char: "Ү", romaji: "ü",  row: "vowels", exampleWord: "Үнэн",   exampleMeaning: "Truth" },
  { char: "Е", romaji: "ye", row: "vowels", exampleWord: "Ехор",   exampleMeaning: "Dance" },
  { char: "Ё", romaji: "yo", row: "vowels", exampleWord: "Ёроол",  exampleMeaning: "Bottom" },
  { char: "Ю", romaji: "yu", row: "vowels", exampleWord: "Юм",     exampleMeaning: "Thing" },
  { char: "Я", romaji: "ya", row: "vowels", exampleWord: "Яс",     exampleMeaning: "Bone" },

  // ── Consonants – group 1 ────────────────────────────────
  { char: "Б", romaji: "b",  row: "consonants1", exampleWord: "Байшин", exampleMeaning: "House" },
  { char: "В", romaji: "v",  row: "consonants1", exampleWord: "Вааль",  exampleMeaning: "Whale" },
  { char: "Г", romaji: "g",  row: "consonants1", exampleWord: "Гар",    exampleMeaning: "Hand" },
  { char: "Д", romaji: "d",  row: "consonants1", exampleWord: "Дэвтэр", exampleMeaning: "Notebook" },
  { char: "Ж", romaji: "j",  row: "consonants1", exampleWord: "Жимс",   exampleMeaning: "Fruit" },
  { char: "З", romaji: "z",  row: "consonants1", exampleWord: "Зам",    exampleMeaning: "Road" },
  { char: "Й", romaji: "y",  row: "consonants1", exampleWord: "Ойн",    exampleMeaning: "Forest (gen.)" },
  { char: "К", romaji: "k",  row: "consonants1", exampleWord: "Кино",   exampleMeaning: "Movie" },
  { char: "Л", romaji: "l",  row: "consonants1", exampleWord: "Лав",    exampleMeaning: "Certainly" },
  { char: "М", romaji: "m",  row: "consonants1", exampleWord: "Мал",    exampleMeaning: "Livestock" },

  // ── Consonants – group 2 ────────────────────────────────
  { char: "Н", romaji: "n",  row: "consonants2", exampleWord: "Нар",    exampleMeaning: "Sun" },
  { char: "П", romaji: "p",  row: "consonants2", exampleWord: "Пуужин", exampleMeaning: "Rocket" },
  { char: "Р", romaji: "r",  row: "consonants2", exampleWord: "Рашаан", exampleMeaning: "Spring water" },
  { char: "С", romaji: "s",  row: "consonants2", exampleWord: "Сар",    exampleMeaning: "Moon" },
  { char: "Т", romaji: "t",  row: "consonants2", exampleWord: "Тэнгэр", exampleMeaning: "Sky" },
  { char: "Ф", romaji: "f",  row: "consonants2", exampleWord: "Файл",   exampleMeaning: "File" },
  { char: "Х", romaji: "kh", row: "consonants2", exampleWord: "Хүн",    exampleMeaning: "Person" },
  { char: "Ц", romaji: "ts", row: "consonants2", exampleWord: "Цас",    exampleMeaning: "Snow" },
  { char: "Ч", romaji: "ch", row: "consonants2", exampleWord: "Чулуу",  exampleMeaning: "Stone" },
  { char: "Ш", romaji: "sh", row: "consonants2", exampleWord: "Шар",    exampleMeaning: "Yellow" },

  // ── Special / less-common ───────────────────────────────
  { char: "Щ", romaji: "shch", row: "special", exampleWord: "Щедрость", exampleMeaning: "Generosity" },
  { char: "Ъ", romaji: "ʺ",   row: "special", exampleWord: "Объект",    exampleMeaning: "Object" },
  { char: "Ы", romaji: "ï",   row: "special", exampleWord: "Бы",        exampleMeaning: "(particle)" },
  { char: "Ь", romaji: "ʹ",   row: "special", exampleWord: "Борьба",    exampleMeaning: "Struggle" },
];
