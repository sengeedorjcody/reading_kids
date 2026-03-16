export type BookLevel =
  | "hiragana"
  | "katakana"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "N5"
  | "N4"
  | "N3";

export interface IBook {
  _id: string;
  title: string;
  titleJapanese?: string;
  level: BookLevel;
  coverImageUrl?: string;
  pdfUrl?: string;
  totalPages: number;
  description?: string;
  tags?: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IWordToken {
  surface: string;
  reading?: string;
  dictionaryForm?: string;
  partOfSpeech?: string;
  dictionaryRef?: string;
}

export interface ISentence {
  _id: string;
  text: string;
  words: IWordToken[];
}

export interface IPage {
  _id: string;
  bookId: string;
  pageNumber: number;
  rawText: string;
  imageUrl?: string;
  sentences: ISentence[];
}

export interface IDictionaryWord {
  _id: string;
  japanese_word: string;
  hiragana?: string;
  romaji?: string;
  english_meaning?: string;
  mongolian_meaning?: string;
  pronunciation_audio_url?: string;
  example_sentence?: string;
  example_sentence_reading?: string;
  example_image_url?: string;
  jlpt_level?: string;
  part_of_speech?: string;
  tags?: string[];
  book_ids?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface KanaChar {
  char: string;
  romaji: string;
  row: string;
  exampleWord?: string;
  exampleMeaning?: string;
  exampleImage?: string;
}

export interface AlphabetTab {
  id: "hiragana" | "katakana";
  label: string;
  labelJa: string;
}
