import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICharacterDoc extends Document {
  name: string;
  imageUrl: string;
}

const CharacterSchema = new Schema<ICharacterDoc>(
  {
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Character: Model<ICharacterDoc> =
  mongoose.models.Character || mongoose.model<ICharacterDoc>("Character", CharacterSchema);

export default Character;
