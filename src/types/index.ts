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
  createdAt?: string;
  updatedAt?: string;
}

export interface KanaChar {
  char: string;
  romaji: string;
  row: string;
  phonetic?: string; // TTS-friendly pronunciation override (e.g. "ee" for Mongolian И)
  exampleWord?: string;
  exampleMeaning?: string;
  exampleImage?: string;
}

export interface AlphabetTab {
  id: "hiragana" | "katakana";
  label: string;
  labelJa: string;
}

export interface IPosition {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
}

export interface ICharacter {
  _id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface IConversationCharacterSlot {
  characterId: string | ICharacter; // populated
  text: string;
  characterPosition: IPosition;
  textPosition: IPosition;
  height?: number; // per-page height override
}

export interface ITextSlot {
  text: string;
  position: { x: number; y: number };
}

export interface IConversationPage {
  _id: string;
  conversationId: string;
  pageNumber: number;
  characters: IConversationCharacterSlot[];
  texts: ITextSlot[];
  backgroundImageUrl?: string;
}

export interface IConversation {
  _id: string;
  title: string;
  description?: string;
  backgroundImageUrl?: string;
  displayMode: 'mobile' | 'desktop';
  totalPages: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
