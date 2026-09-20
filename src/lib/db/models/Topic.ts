import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITopicDoc extends Document {
  title: string;
  titleJapanese?: string;
  description?: string;
  order: number;
  totalSentences: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopicDoc>(
  {
    title: { type: String, required: true, trim: true },
    titleJapanese: { type: String, trim: true },
    description: { type: String, trim: true },
    order: { type: Number, default: 0 },
    totalSentences: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Topic: Model<ITopicDoc> =
  mongoose.models.Topic || mongoose.model<ITopicDoc>("Topic", TopicSchema);

export default Topic;
