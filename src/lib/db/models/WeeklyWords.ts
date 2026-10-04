import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWeeklyWordItemDoc {
  wordId?: mongoose.Types.ObjectId;
  japanese_word: string;
  hiragana?: string;
  romaji?: string;
  english_meaning?: string;
  mongolian_meaning?: string;
  example_sentence?: string;
  example_sentence_reading?: string;
  example_image_url?: string;
  pronunciation_audio_url?: string;
  order?: number;
}

export interface IWeeklyWordsDoc extends Document {
  weekNumber: number;
  title: string;
  titleJapanese?: string;
  description?: string;
  coverImageUrl?: string;
  words: IWeeklyWordItemDoc[];
  totalWords: number;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WeeklyWordItemSchema = new Schema(
  {
    wordId: { type: Schema.Types.ObjectId, ref: "DictionaryWord" },
    japanese_word: { type: String, required: true, trim: true },
    hiragana: { type: String, trim: true },
    romaji: { type: String, trim: true },
    english_meaning: { type: String, trim: true },
    mongolian_meaning: { type: String, trim: true },
    example_sentence: { type: String, trim: true },
    example_sentence_reading: { type: String, trim: true },
    example_image_url: { type: String, trim: true },
    pronunciation_audio_url: { type: String, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const WeeklyWordsSchema = new Schema<IWeeklyWordsDoc>(
  {
    weekNumber: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    titleJapanese: { type: String, trim: true },
    description: { type: String, trim: true },
    coverImageUrl: { type: String, trim: true },
    words: { type: [WeeklyWordItemSchema], default: [] },
    totalWords: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

WeeklyWordsSchema.index({ order: 1, weekNumber: 1 });

const WeeklyWords: Model<IWeeklyWordsDoc> =
  mongoose.models.WeeklyWords ||
  mongoose.model<IWeeklyWordsDoc>("WeeklyWords", WeeklyWordsSchema);

export default WeeklyWords;
export { WeeklyWords, WeeklyWords as WeeklyWord };
