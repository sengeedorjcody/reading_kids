import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFamilyTalkWordDoc extends Document {
  topicId: mongoose.Types.ObjectId;
  japanese: string;
  hiragana?: string;
  romaji?: string;
  english_meaning?: string;
  mongolian_meaning?: string;
  imageUrl?: string;
  audioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FamilyTalkWordSchema = new Schema<IFamilyTalkWordDoc>(
  {
    topicId: { type: Schema.Types.ObjectId, ref: "FamilyTalkTopic", required: true, index: true },
    japanese: { type: String, required: true, trim: true },
    hiragana: { type: String, trim: true },
    romaji: { type: String, trim: true },
    english_meaning: { type: String, trim: true },
    mongolian_meaning: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    audioUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

const FamilyTalkWord: Model<IFamilyTalkWordDoc> =
  mongoose.models.FamilyTalkWord || mongoose.model<IFamilyTalkWordDoc>("FamilyTalkWord", FamilyTalkWordSchema);

export default FamilyTalkWord;
