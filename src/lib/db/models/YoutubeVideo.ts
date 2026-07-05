import { Schema, model, models } from "mongoose";

export interface TranscriptLine {
  start: number; // seconds
  text: string;  // space-segmented Japanese, e.g. "私 は 今日 から"
}

export interface IYoutubeVideo {
  _id: string;
  title: string;
  youtubeId: string;
  durationSeconds: number;
  transcript: TranscriptLine[];
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const TranscriptLineSchema = new Schema<TranscriptLine>(
  { start: { type: Number, required: true }, text: { type: String, required: true } },
  { _id: false }
);

const YoutubeVideoSchema = new Schema<IYoutubeVideo>(
  {
    title:           { type: String, required: true },
    youtubeId:       { type: String, required: true },
    durationSeconds: { type: Number, default: 0 },
    transcript:      [TranscriptLineSchema],
    order:           { type: Number, default: 0 },
    isActive:        { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.YoutubeVideo || model<IYoutubeVideo>("YoutubeVideo", YoutubeVideoSchema);
