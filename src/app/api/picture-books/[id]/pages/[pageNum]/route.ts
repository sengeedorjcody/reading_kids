import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import PictureBook from "@/lib/db/models/PictureBook";
import PictureBookPage from "@/lib/db/models/PictureBookPage";
import { textToSentences } from "@/lib/textTokenizer";

export async function GET(_: NextRequest, { params }: { params: { id: string; pageNum: string } }) {
  try {
    await connectDB();
    const page = await PictureBookPage.findOne({
      pictureBookId: params.id,
      pageNumber: parseInt(params.pageNum),
    }).lean();
    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ page });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string; pageNum: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const update: Record<string, unknown> = { imageUrl: body.imageUrl };
    if (typeof body.rawText === "string") {
      update.rawText = body.rawText;
      update.sentences = textToSentences(body.rawText);
    }
    const page = await PictureBookPage.findOneAndUpdate(
      { pictureBookId: params.id, pageNumber: parseInt(params.pageNum) },
      update,
      { new: true }
    );
    return NextResponse.json({ page });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string; pageNum: string } }) {
  try {
    await connectDB();
    await PictureBookPage.findOneAndDelete({
      pictureBookId: params.id,
      pageNumber: parseInt(params.pageNum),
    });
    const total = await PictureBookPage.countDocuments({ pictureBookId: params.id });
    await PictureBook.findByIdAndUpdate(params.id, { totalPages: total });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
