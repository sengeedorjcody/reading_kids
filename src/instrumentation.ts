// Next.js instrumentation — runs once when the server starts (Node.js runtime only).
// Validates required env vars and warms up the MongoDB connection.
// Cloudinary is checked lazily via GET /api/health to avoid webpack bundling Node.js built-ins.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const required = [
    "MONGODB_URI",
    "NEXTAUTH_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `[startup] ❌ Missing env vars: ${missing.join(", ")}. Visit /api/health for diagnostics.`
    );
    return;
  }

  // Warm up MongoDB — mongoose is excluded from webpack via serverComponentsExternalPackages
  try {
    const { connectDB } = await import("@/lib/db/mongoose");
    await connectDB();
    console.log("[startup] ✅ MongoDB connected");
  } catch (err) {
    console.error(
      "[startup] ❌ MongoDB connection failed:",
      err instanceof Error ? err.message : err
    );
  }

  // Cloudinary is validated at runtime by GET /api/health
  // (importing it here causes webpack to try to bundle Node.js built-ins: crypto, stream)
  console.log("[startup] ℹ️  Visit /api/health to verify Cloudinary connection");
}
