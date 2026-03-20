import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBackgroundDoc extends Document {
  name: string;
  imageUrl: string;
  key: string;
  createdAt: Date;
  updatedAt: Date;
}

const BackgroundSchema = new Schema<IBackgroundDoc>(
  {
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    key: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Background: Model<IBackgroundDoc> =
  mongoose.models.Background || mongoose.model<IBackgroundDoc>("Background", BackgroundSchema);

export default Background;
