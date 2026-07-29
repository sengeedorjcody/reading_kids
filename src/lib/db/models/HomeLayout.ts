import { Schema, model, models } from "mongoose";

export interface IHomeItem {
  id: string;
  type: "app" | "folder";
  href?: string;
  name?: string;
  appHrefs?: string[];
}

export interface IHomeLayout {
  _id: string;
  items: IHomeItem[];
  updatedAt: string;
}

const HomeItemSchema = new Schema<IHomeItem>(
  {
    id:       { type: String, required: true },
    type:     { type: String, enum: ["app", "folder"], required: true },
    href:     { type: String },
    name:     { type: String },
    appHrefs: [{ type: String }],
  },
  { _id: false }
);

const HomeLayoutSchema = new Schema<IHomeLayout>(
  {
    items: [HomeItemSchema],
  },
  { timestamps: true }
);

export default models.HomeLayout || model<IHomeLayout>("HomeLayout", HomeLayoutSchema);
