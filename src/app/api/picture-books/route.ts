import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import PictureBook from "@/lib/db/models/PictureBook";

export async function GET() {
  try {
    await connectDB();
    const pictureBooks = await PictureBook.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ pictureBooks });
  } catch {
    return NextResponse.json({ error: "Failed to fetch picture books" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const pictureBook = await PictureBook.create(body);
    return NextResponse.json({ pictureBook }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create picture book" }, { status: 500 });
  }
}
