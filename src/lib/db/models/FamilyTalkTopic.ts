import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFamilyTalkTopicDoc extends Document {
  title: string;
  titleJapanese?: string;
  description?: string;
  coverImageUrl?: string;
  order: number;
  totalWords: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FamilyTalkTopicSchema = new Schema<IFamilyTalkTopicDoc>(
  {
    title: { type: String, required: true, trim: true },
    titleJapanese: { type: String, trim: true },
    description: { type: String, trim: true },
    coverImageUrl: { type: String, trim: true },
    order: { type: Number, default: 0 },
    totalWords: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const FamilyTalkTopic: Model<IFamilyTalkTopicDoc> =
  mongoose.models.FamilyTalkTopic || mongoose.model<IFamilyTalkTopicDoc>("FamilyTalkTopic", FamilyTalkTopicSchema);

export default FamilyTalkTopic;
