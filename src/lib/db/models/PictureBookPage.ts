import mongoose, { Schema, Document, Model } from "mongoose";

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

export type TextPosition = "bottom" | "top" | "left" | "right";

export interface IPictureBookPageDoc extends Document {
  pictureBookId: mongoose.Types.ObjectId;
  pageNumber: number;
  imageUrl?: string;
  rawText: string;
  textPosition: TextPosition;
  sentences: { text: string; words: { surface: string }[] }[];
  createdAt: Date;
  updatedAt: Date;
}

const PictureBookPageSchema = new Schema<IPictureBookPageDoc>(
  {
    pictureBookId: { type: Schema.Types.ObjectId, ref: "PictureBook", required: true, index: true },
    pageNumber: { type: Number, required: true },
    imageUrl: { type: String, trim: true },
    rawText: { type: String, default: "" },
    textPosition: { type: String, enum: ["bottom", "top", "left", "right"], default: "bottom" },
    sentences: [SentenceSchema],
  },
  { timestamps: true }
);
PictureBookPageSchema.index({ pictureBookId: 1, pageNumber: 1 }, { unique: true });

const PictureBookPage: Model<IPictureBookPageDoc> =
  mongoose.models.PictureBookPage || mongoose.model<IPictureBookPageDoc>("PictureBookPage", PictureBookPageSchema);

export default PictureBookPage;
