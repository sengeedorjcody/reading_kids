import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConversationDoc extends Document {
  title: string;
  description?: string;
  backgroundImageUrl?: string;
  displayMode: 'mobile' | 'desktop';
  totalPages: number;
  isPublished: boolean;
}

const ConversationSchema = new Schema<IConversationDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    backgroundImageUrl: { type: String, trim: true },
    displayMode: { type: String, enum: ['mobile', 'desktop'], default: 'mobile' },
    totalPages: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Conversation: Model<IConversationDoc> =
  mongoose.models.Conversation || mongoose.model<IConversationDoc>("Conversation", ConversationSchema);

export default Conversation;
