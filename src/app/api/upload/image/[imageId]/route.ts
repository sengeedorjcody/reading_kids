import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Image from "@/lib/db/models/Image";
import { deleteFromS3 } from "@/lib/s3/client";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    await connectDB();
    const image = await Image.findById(params.imageId);
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    await deleteFromS3(image.url);
    await image.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/upload/image/[imageId] error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
