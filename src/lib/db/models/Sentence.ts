import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISentenceDoc extends Document {
  topicId: mongoose.Types.ObjectId;
  order: number;
  imageUrl?: string;
  japanese: string;
  romaji?: string;
  english_meaning?: string;
  mongolian_meaning?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SentenceSchema = new Schema<ISentenceDoc>(
  {
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true, index: true },
    order: { type: Number, required: true },
    imageUrl: { type: String, trim: true },
    japanese: { type: String, required: true, trim: true },
    romaji: { type: String, trim: true },
    english_meaning: { type: String, trim: true },
    mongolian_meaning: { type: String, trim: true },
  },
  { timestamps: true }
);
SentenceSchema.index({ topicId: 1, order: 1 }, { unique: true });

const Sentence: Model<ISentenceDoc> =
  mongoose.models.Sentence || mongoose.model<ISentenceDoc>("Sentence", SentenceSchema);

export default Sentence;
