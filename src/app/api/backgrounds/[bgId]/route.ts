import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Background from "@/lib/db/models/Background";
import { deleteFromS3 } from "@/lib/s3/client";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { bgId: string } }
) {
  try {
    await connectDB();
    const bg = await Background.findById(params.bgId);
    if (!bg) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await deleteFromS3(bg.imageUrl);
    await bg.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/backgrounds/[bgId] error:", error);
    return NextResponse.json({ error: "Failed to delete background" }, { status: 500 });
  }
}
