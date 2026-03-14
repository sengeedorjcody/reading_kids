import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import DictionaryWord from "@/lib/db/models/DictionaryWord";

export async function GET(
  _request: NextRequest,
  { params }: { params: { wordId: string } }
) {
  try {
    await connectDB();
    const word = await DictionaryWord.findById(params.wordId).lean();
    if (!word) return NextResponse.json({ error: "Word not found" }, { status: 404 });
    return NextResponse.json({ word });
  } catch (error) {
    console.error("GET /api/dictionary/[wordId] error:", error);
    return NextResponse.json({ error: "Failed to fetch word" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { wordId: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    const word = await DictionaryWord.findByIdAndUpdate(params.wordId, body, {
      new: true,
    }).lean();
    if (!word) return NextResponse.json({ error: "Word not found" }, { status: 404 });
    return NextResponse.json({ word });
  } catch (error) {
    console.error("PATCH /api/dictionary/[wordId] error:", error);
    return NextResponse.json({ error: "Failed to update word" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { wordId: string } }
) {
  try {
    await connectDB();
    await DictionaryWord.findByIdAndDelete(params.wordId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/dictionary/[wordId] error:", error);
    return NextResponse.json({ error: "Failed to delete word" }, { status: 500 });
  }
}
