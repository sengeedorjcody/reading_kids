import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import DictionaryWord from "@/lib/db/models/DictionaryWord";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const level = searchParams.get("level");
    const exact = searchParams.get("exact") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30");

    const query: Record<string, unknown> = {};

    if (q && q.trim()) {
      if (exact) {
        // Exact match on japanese_word or hiragana only (used by DictionaryPanel)
        query.$or = [
          { japanese_word: q.trim() },
          { hiragana: q.trim() },
        ];
      } else {
        // Partial / regex match for search UI
        query.$or = [
          { japanese_word: { $regex: q, $options: "i" } },
          { hiragana: { $regex: q, $options: "i" } },
          { romaji: { $regex: q, $options: "i" } },
          { english_meaning: { $regex: q, $options: "i" } },
        ];
      }
    }

    if (level && level !== "all") query.jlpt_level = level;

    const conversationIdParam = searchParams.get("conversationId");
    if (conversationIdParam) query.conversationId = conversationIdParam;

    const [words, total] = await Promise.all([
      DictionaryWord.find(query)
        .sort({ japanese_word: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      DictionaryWord.countDocuments(query),
    ]);

    return NextResponse.json({ words, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("GET /api/dictionary error:", error);
    return NextResponse.json({ error: "Failed to fetch dictionary" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const word = await DictionaryWord.create(body);
    return NextResponse.json({ word }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/dictionary error:", error);
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return NextResponse.json({ error: "Word already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create word" }, { status: 500 });
  }
}
