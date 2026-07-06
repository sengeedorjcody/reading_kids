import mongoose, { Schema, Document, Model } from "mongoose";
import { BookLevel } from "@/types";

export interface IPictureBookDoc extends Document {
  title: string;
  titleJapanese?: string;
  level: BookLevel;
  coverImageUrl?: string;
  description?: string;
  tags?: string[];
  totalPages: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PictureBookSchema = new Schema<IPictureBookDoc>(
  {
    title: { type: String, required: true, trim: true },
    titleJapanese: { type: String, trim: true },
    level: {
      type: String,
      enum: ["hiragana", "katakana", "beginner", "intermediate", "advanced", "N5", "N4", "N3"],
      default: "beginner",
    },
    coverImageUrl: { type: String, trim: true },
    description: { type: String, trim: true },
    tags: [{ type: String }],
    totalPages: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PictureBook: Model<IPictureBookDoc> =
  mongoose.models.PictureBook || mongoose.model<IPictureBookDoc>("PictureBook", PictureBookSchema);

export default PictureBook;
