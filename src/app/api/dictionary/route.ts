import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import DictionaryWord from "@/lib/db/models/DictionaryWord";
import { lookupExternalDictionary } from "@/lib/external-dictionary";

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
        // Exact match on japanese_word, hiragana, or romaji (case-insensitive)
        const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        query.$or = [
          { japanese_word: q.trim() },
          { hiragana: q.trim() },
          { romaji: { $regex: `^${escaped}$`, $options: "i" } },
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

    const bookIdParam = searchParams.get("bookId");
    if (bookIdParam) query.bookId = bookIdParam;

    const [words, total] = await Promise.all([
      DictionaryWord.find(query)
        .sort({ japanese_word: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      DictionaryWord.countDocuments(query),
    ]);

    // Nothing locally for an exact single-word lookup — try free public
    // dictionary APIs (Jisho / kanjiapi.dev) before giving up. This result
    // is never persisted, just handed back so the reader UI has something
    // to show instead of "not found".
    if (exact && words.length === 0 && q?.trim()) {
      const external = await lookupExternalDictionary(q);
      if (external) {
        return NextResponse.json({
          words: [{
            _id: `external-${encodeURIComponent(external.japanese_word)}`,
            japanese_word: external.japanese_word,
            hiragana: external.hiragana,
            english_meaning: external.english_meaning,
            tags: [external.source],
          }],
          total: 1,
          page: 1,
          pages: 1,
          externalSource: external.source,
        });
      }
    }

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
