import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import DictionaryWord from "@/lib/db/models/DictionaryWord";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const XLSX = require("xlsx");

export const maxDuration = 60;

export async function GET() {
  try {
    await connectDB();

    const words = await DictionaryWord.find({})
      .sort({ japanese_word: 1 })
      .lean();

    const rows = words.map((w) => ({
      japanese_word: w.japanese_word ?? "",
      hiragana: w.hiragana ?? "",
      romaji: w.romaji ?? "",
      english_meaning: w.english_meaning ?? "",
      mongolian_meaning: w.mongolian_meaning ?? "",
      example_sentence: w.example_sentence ?? "",
      example_sentence_reading: w.example_sentence_reading ?? "",
      example_image_url: w.example_image_url ?? "",
      jlpt_level: w.jlpt_level ?? "",
      part_of_speech: w.part_of_speech ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dictionary");

    // Auto-size columns
    const colWidths = [
      { wch: 16 }, // japanese_word
      { wch: 16 }, // hiragana
      { wch: 14 }, // romaji
      { wch: 30 }, // english_meaning
      { wch: 30 }, // mongolian_meaning
      { wch: 40 }, // example_sentence
      { wch: 40 }, // example_sentence_reading
      { wch: 50 }, // example_image_url
      { wch: 10 }, // jlpt_level
      { wch: 16 }, // part_of_speech
    ];
    worksheet["!cols"] = colWidths;

    const buffer: Buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="dictionary_export.xlsx"`,
      },
    });
  } catch (error) {
    console.error("GET /api/dictionary/export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
