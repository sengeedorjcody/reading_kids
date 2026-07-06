import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import PictureBook from "@/lib/db/models/PictureBook";
import PictureBookPage from "@/lib/db/models/PictureBookPage";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const pictureBook = await PictureBook.findById(params.id).lean();
    if (!pictureBook) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ pictureBook });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const pictureBook = await PictureBook.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ pictureBook });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    await Promise.all([
      PictureBook.findByIdAndDelete(params.id),
      PictureBookPage.deleteMany({ pictureBookId: params.id }),
    ]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
