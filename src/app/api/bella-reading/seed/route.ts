import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import BellaReading from "@/lib/db/models/BellaReading";
import { rawTextToBellaSentences } from "@/lib/bellaTokenizer";
import { SAMPLE_BELLA_DATA } from "@/lib/bellaSample";

export async function POST() {
  try {
    await connectDB();

    const existing = await BellaReading.findOne({ title: SAMPLE_BELLA_DATA.title });
    if (existing) {
      if (!existing.coverImageUrl) {
        existing.coverImageUrl = SAMPLE_BELLA_DATA.coverImageUrl;
        await existing.save();
      }
      return NextResponse.json({ reading: existing.toObject(), alreadyExists: true });
    }

    const reading = await BellaReading.create({
      ...SAMPLE_BELLA_DATA,
      sentences: rawTextToBellaSentences(SAMPLE_BELLA_DATA.rawText),
    });

    return NextResponse.json({ reading, alreadyExists: false }, { status: 201 });
  } catch (error) {
    console.error("POST /api/bella-reading/seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed sample reading" },
      { status: 500 }
    );
  }
}
