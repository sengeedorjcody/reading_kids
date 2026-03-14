import { Schema, model, models } from "mongoose";

const WordTokenSchema = new Schema(
  {
    surface: { type: String, required: true },
    reading: { type: String },
    dictionaryForm: { type: String },
    partOfSpeech: { type: String },
    dictionaryRef: { type: Schema.Types.ObjectId, ref: "DictionaryWord" },
  },
  { _id: false }
);

const SentenceSchema = new Schema({
  text: { type: String, required: true },
  words: [WordTokenSchema],
});

const PageSchema = new Schema(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    pageNumber: { type: Number, required: true },
    rawText: { type: String },
    imageUrl: { type: String },
    sentences: [SentenceSchema],
  },
  { timestamps: true }
);

PageSchema.index({ bookId: 1, pageNumber: 1 }, { unique: true });

const Page = models.Page || model("Page", PageSchema);
export default Page;
