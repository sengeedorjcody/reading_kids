import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import PictureBook from "@/lib/db/models/PictureBook";

export async function GET() {
  try {
    await connectDB();
    const pictureBooks = await PictureBook.find().sort({ createdAt: -1 }).select("_id title").lean();
    return NextResponse.json({ pictureBooks });
  } catch {
    return NextResponse.json({ error: "Failed to fetch picture books" }, { status: 500 });
  }
}
