import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Page from "@/lib/db/models/Page";

export async function GET(
  _request: NextRequest,
  { params }: { params: { bookId: string; pageNum: string } }
) {
  try {
    await connectDB();
    const page = await Page.findOne({
      bookId: params.bookId,
      pageNumber: parseInt(params.pageNum),
    })
      .populate("sentences.words.dictionaryRef")
      .lean();

    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    return NextResponse.json({ page });
  } catch (error) {
    console.error("GET /api/books/[bookId]/pages/[pageNum] error:", error);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}
