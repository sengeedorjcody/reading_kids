import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Image from "@/lib/db/models/Image";
import { uploadToS3 } from "@/lib/s3/client";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and GIF are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File must be under 5 MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `images/${timestamp}_${safeName}`;

    const url = await uploadToS3(buffer, key, file.type);

    await connectDB();
    const image = await Image.create({
      title: file.name,
      url,
      key,
      mimeType: file.type,
    });

    return NextResponse.json({ url, id: image._id.toString() });
  } catch (error) {
    console.error("POST /api/upload/image error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
