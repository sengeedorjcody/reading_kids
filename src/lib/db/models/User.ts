import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserDoc extends Document {
  email: string;
  passwordHash: string;
  name?: string;
  isAdmin: boolean;
  savedWords: mongoose.Types.ObjectId[];
  lastExamPromptDate?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true },
    isAdmin: { type: Boolean, default: false },
    savedWords: [{ type: Schema.Types.ObjectId, ref: "DictionaryWord", default: [] }],
    lastExamPromptDate: { type: String },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

const User: Model<IUserDoc> = mongoose.models.User || mongoose.model<IUserDoc>("User", UserSchema);

export default User;
