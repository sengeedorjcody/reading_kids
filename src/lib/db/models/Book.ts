import mongoose, { Schema, model, models } from "mongoose";

const BookSchema = new Schema(
  {
    title: { type: String, required: true },
    titleJapanese: { type: String },
    level: {
      type: String,
      enum: ["hiragana", "katakana", "beginner", "intermediate", "advanced", "N5", "N4", "N3"],
      required: true,
    },
    coverImageUrl: { type: String },
    pdfUrl: { type: String },
    totalPages: { type: Number, default: 0 },
    description: { type: String },
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Book = models.Book || model("Book", BookSchema);
export default Book;
