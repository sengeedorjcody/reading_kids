import mongoose, { Schema, model, models } from "mongoose";

export interface IGame {
  _id: string;
  title: string;
  description: string;
  emoji: string;
  iframeSrc: string;
  tags: string[];
  color: string;
  bg: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const GameSchema = new Schema<IGame>(
  {
    title:       { type: String, required: true },
    description: { type: String, default: "" },
    emoji:       { type: String, default: "🎮" },
    iframeSrc:   { type: String, required: true },
    tags:        [{ type: String }],
    color:       { type: String, default: "#22c55e" },
    bg:          { type: String, default: "from-green-400 to-emerald-600" },
    order:       { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Game || model<IGame>("Game", GameSchema);
