import mongoose, { Schema, model, models } from "mongoose";

const BellaWordTokenSchema = new Schema(
  {
    surface: { type: String, required: true },
    reading: { type: String },
    dictionaryForm: { type: String },
    partOfSpeech: { type: String },
    dictionaryRef: { type: Schema.Types.ObjectId, ref: "DictionaryWord" },
  },
  { _id: false }
);

const BellaSentenceSchema = new Schema({
  text: { type: String, required: true },
  words: [BellaWordTokenSchema],
});

const BellaQuestionSchema = new Schema({
  question: { type: String, required: true },
  questionTranslation: { type: String },
  options: {
    type: [String],
    validate: {
      validator: (arr: string[]) => Array.isArray(arr) && arr.length >= 2,
      message: "At least 2 options are required",
    },
    required: true,
  },
  correctIndex: { type: Number, required: true, default: 0 },
  explanation: { type: String },
});

const BellaReadingSchema = new Schema(
  {
    title: { type: String, required: true },
    titleJapanese: { type: String },
    level: {
      type: String,
      enum: ["hiragana", "katakana", "beginner", "intermediate", "advanced", "N5", "N4", "N3"],
      default: "beginner",
    },
    description: { type: String },
    coverImageUrl: { type: String },
    rawText: { type: String, required: true },
    sentences: [BellaSentenceSchema],
    questions: [BellaQuestionSchema],
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const BellaReading =
  models.BellaReading || model("BellaReading", BellaReadingSchema);
export default BellaReading;
