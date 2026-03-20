import mongoose, { Schema, model, models } from "mongoose";

const DictionaryWordSchema = new Schema(
  {
    japanese_word: { type: String, required: true, unique: true },
    hiragana: { type: String },
    romaji: { type: String },
    english_meaning: { type: String },
    mongolian_meaning: { type: String },
    pronunciation_audio_url: { type: String },
    example_sentence: { type: String },
    example_sentence_reading: { type: String },
    example_image_url: { type: String },
    jlpt_level: { type: String },
    part_of_speech: { type: String },
    tags: [{ type: String }],
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", default: null },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", default: null },
  },
  { timestamps: true }
);

// Full-text search index for dictionary lookup
DictionaryWordSchema.index(
  { japanese_word: "text", hiragana: "text", romaji: "text", english_meaning: "text" },
  { name: "dictionary_search_index" }
);

// japanese_word already has a unique index from `unique: true` above — no duplicate needed
DictionaryWordSchema.index({ romaji: 1 });

const DictionaryWord = models.DictionaryWord || model("DictionaryWord", DictionaryWordSchema);
export default DictionaryWord;
