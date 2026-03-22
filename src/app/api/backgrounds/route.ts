import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Background from "@/lib/db/models/Background";
import { uploadToS3 } from "@/lib/s3/client";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function GET() {
  try {
    await connectDB();
    const backgrounds = await Background.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ backgrounds });
  } catch {
    return NextResponse.json({ error: "Failed to fetch backgrounds" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string | null)?.trim();
    const imageUrl = (formData.get("imageUrl") as string | null)?.trim();

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    await connectDB();

    // URL-only path — save without uploading
    if (imageUrl) {
      const background = await Background.create({ name, imageUrl, key: `url/${Date.now()}` });
      return NextResponse.json({ background }, { status: 201 });
    }

    if (!file) return NextResponse.json({ error: "No file or URL provided" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF allowed" }, { status: 400 });
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "File must be under 10 MB" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `backgrounds/${Date.now()}_${safeName}`;
    const url = await uploadToS3(buffer, key, file.type);

    const background = await Background.create({ name, imageUrl: url, key });

    return NextResponse.json({ background }, { status: 201 });
  } catch (error) {
    console.error("POST /api/backgrounds error:", error);
    return NextResponse.json({ error: "Failed to upload background" }, { status: 500 });
  }
}
