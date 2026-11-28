import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import BellaReading from "@/lib/db/models/BellaReading";
import { rawTextToBellaSentences } from "@/lib/bellaTokenizer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("all") === "true";

    const query: Record<string, unknown> = includeAll ? {} : { isPublished: true };
    const readings = await BellaReading.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ readings });
  } catch (error) {
    console.error("GET /api/bella-reading error:", error);
    return NextResponse.json(
      { error: "Failed to fetch readings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const title = String(body.title ?? "").trim();
    const rawText = String(body.rawText ?? "").trim();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!rawText) {
      return NextResponse.json(
        { error: "Reading text is required" },
        { status: 400 }
      );
    }

    const sentences = rawTextToBellaSentences(rawText);

    const questions = Array.isArray(body.questions)
      ? body.questions
          .map((q: Record<string, unknown>) => {
            const options = Array.isArray(q.options)
              ? q.options.map((o) => String(o ?? "").trim()).filter(Boolean)
              : [];
            const correctIndex = Number(q.correctIndex ?? 0);
            return {
              question: String(q.question ?? "").trim(),
              questionTranslation:
                String(q.questionTranslation ?? "").trim() || undefined,
              options,
              correctIndex:
                correctIndex >= 0 && correctIndex < options.length
                  ? correctIndex
                  : 0,
              explanation: String(q.explanation ?? "").trim() || undefined,
            };
          })
          .filter(
            (q: { question: string; options: string[] }) =>
              q.question.length > 0 && q.options.length >= 2
          )
      : [];

    const reading = await BellaReading.create({
      title,
      titleJapanese: String(body.titleJapanese ?? "").trim() || undefined,
      level: body.level || "beginner",
      description: String(body.description ?? "").trim() || undefined,
      coverImageUrl: String(body.coverImageUrl ?? "").trim() || undefined,
      rawText,
      sentences,
      questions,
      order: Number(body.order ?? 0),
      isPublished: body.isPublished !== false,
    });

    return NextResponse.json({ reading }, { status: 201 });
  } catch (error) {
    console.error("POST /api/bella-reading error:", error);
    return NextResponse.json(
      { error: "Failed to create reading" },
      { status: 500 }
    );
  }
}
