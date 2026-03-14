import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Book from "@/lib/db/models/Book";
import Page from "@/lib/db/models/Page";

export async function GET(
  _request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    await connectDB();
    const book = await Book.findById(params.bookId).lean();
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });
    return NextResponse.json({ book });
  } catch (error) {
    console.error("GET /api/books/[bookId] error:", error);
    return NextResponse.json({ error: "Failed to fetch book" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    const book = await Book.findByIdAndUpdate(params.bookId, body, { new: true }).lean();
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });
    return NextResponse.json({ book });
  } catch (error) {
    console.error("PATCH /api/books/[bookId] error:", error);
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    await connectDB();
    await Promise.all([
      Book.findByIdAndDelete(params.bookId),
      Page.deleteMany({ bookId: params.bookId }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/books/[bookId] error:", error);
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
