import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Page from "@/lib/db/models/Page";

export async function GET(
  _request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    await connectDB();
    const pages = await Page.find({ bookId: params.bookId })
      .select("pageNumber rawText")
      .sort({ pageNumber: 1 })
      .lean();
    return NextResponse.json({ pages });
  } catch (error) {
    console.error("GET /api/books/[bookId]/pages error:", error);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}
