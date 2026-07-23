// One-time (idempotent) admin user seeder.
// Usage: node --env-file=.env.local scripts/seed-admin.mjs
//
// Reads ADMIN_EMAIL / ADMIN_PASSWORD from the environment and creates a
// matching User document (bcrypt-hashed password) if one doesn't already
// exist for that email. Safe to re-run — it never overwrites an existing
// user's password.

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin user");
}

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true },
    role: { type: String, enum: ["admin"], default: "admin" },
  },
  { timestamps: true }
);

async function main() {
  await mongoose.connect(MONGODB_URI);
  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const email = ADMIN_EMAIL.toLowerCase().trim();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`✔ User already exists for ${email} — nothing to do.`);
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({ email, passwordHash, name: "Admin", role: "admin" });
    console.log(`✔ Created admin user: ${email}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
