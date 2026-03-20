import mongoose, { Schema, Document, Model } from "mongoose";

export interface IImageDoc extends Document {
  title: string;
  url: string;
  key: string;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IImageDoc>(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    key: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true },
  },
  { timestamps: true }
);

const Image: Model<IImageDoc> =
  mongoose.models.Image || mongoose.model<IImageDoc>("Image", ImageSchema);

export default Image;
