import mongoose, { Schema, Document, Model } from "mongoose";

const PositionSchema = new Schema({ x: { type: Number, default: 50 }, y: { type: Number, default: 50 } }, { _id: false });

const CharacterSlotSchema = new Schema({
  characterId: { type: Schema.Types.ObjectId, ref: "Character", required: true },
  text: { type: String, trim: true, default: "" },
  characterPosition: { type: PositionSchema, default: () => ({ x: 50, y: 50 }) },
  textPosition: { type: PositionSchema, default: () => ({ x: 50, y: 80 }) },
}, { _id: false });

export interface IConversationPageDoc extends Document {
  conversationId: mongoose.Types.ObjectId;
  pageNumber: number;
  characters: Array<{
    characterId: mongoose.Types.ObjectId;
    text: string;
    characterPosition: { x: number; y: number };
    textPosition: { x: number; y: number };
  }>;
}

const ConversationPageSchema = new Schema<IConversationPageDoc>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    pageNumber: { type: Number, required: true },
    characters: { type: [CharacterSlotSchema], default: [] },
  },
  { timestamps: true }
);

ConversationPageSchema.index({ conversationId: 1, pageNumber: 1 }, { unique: true });

const ConversationPage: Model<IConversationPageDoc> =
  mongoose.models.ConversationPage || mongoose.model<IConversationPageDoc>("ConversationPage", ConversationPageSchema);

export default ConversationPage;
