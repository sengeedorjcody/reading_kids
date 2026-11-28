import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import BellaReading from "@/lib/db/models/BellaReading";
import DictionaryWord from "@/lib/db/models/DictionaryWord";
import { rawTextToBellaSentences } from "@/lib/bellaTokenizer";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    void DictionaryWord.modelName;
    const reading = await BellaReading.findById(params.id)
      .populate("sentences.words.dictionaryRef")
      .lean();
    if (!reading) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 });
    }
    return NextResponse.json({ reading });
  } catch (error) {
    console.error("GET /api/bella-reading/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reading" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    const update: Record<string, unknown> = {};

    if (body.title !== undefined) update.title = String(body.title).trim();
    if (body.titleJapanese !== undefined)
      update.titleJapanese = String(body.titleJapanese).trim() || undefined;
    if (body.level !== undefined) update.level = body.level;
    if (body.description !== undefined)
      update.description = String(body.description).trim() || undefined;
    if (body.coverImageUrl !== undefined)
      update.coverImageUrl = String(body.coverImageUrl).trim() || undefined;
    if (body.order !== undefined) update.order = Number(body.order);
    if (body.isPublished !== undefined)
      update.isPublished = Boolean(body.isPublished);

    if (body.rawText !== undefined) {
      const rawText = String(body.rawText).trim();
      update.rawText = rawText;
      update.sentences = rawTextToBellaSentences(rawText);
    }

    if (Array.isArray(body.questions)) {
      update.questions = body.questions
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
        );
    }

    const reading = await BellaReading.findByIdAndUpdate(params.id, update, {
      new: true,
    }).lean();

    if (!reading) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 });
    }

    return NextResponse.json({ reading });
  } catch (error) {
    console.error("PATCH /api/bella-reading/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update reading" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const deleted = await BellaReading.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/bella-reading/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete reading" },
      { status: 500 }
    );
  }
}
