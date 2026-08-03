// One-time migration: the User model dropped its `role: "admin"` enum field
// in favor of a boolean `isAdmin` flag (to allow non-admin reader accounts).
// Idempotent — safe to re-run, it only touches docs that still have `role`.
// Usage: node --env-file=.env.local scripts/migrate-user-roles.mjs

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");

async function main() {
  await mongoose.connect(MONGODB_URI);
  const col = mongoose.connection.db.collection("users");

  const res = await col.updateMany(
    { role: "admin" },
    { $set: { isAdmin: true }, $unset: { role: "" } }
  );
  console.log(`✔ Migrated ${res.modifiedCount} admin user(s) to isAdmin: true`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
