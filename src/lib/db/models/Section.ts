import { Schema, model, models } from "mongoose";

export interface ISection {
  _id: string;
  href: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

const SectionSchema = new Schema<ISection>(
  {
    href:     { type: String, required: true, unique: true },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Section || model<ISection>("Section", SectionSchema);
