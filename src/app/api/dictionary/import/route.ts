import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import DictionaryWord from "@/lib/db/models/DictionaryWord";

// xlsx is a server-only package — use require to avoid ESM issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const XLSX = require("xlsx");

export const maxDuration = 60;

// Expected column headers (case-insensitive, spaces/underscores interchangeable)
const COL_MAP: Record<string, string> = {
  japanese_word:              "japanese_word",
  "japanese word":            "japanese_word",
  japanese:                   "japanese_word",
  hiragana:                   "hiragana",
  romaji:                     "romaji",
  english_meaning:            "english_meaning",
  "english meaning":          "english_meaning",
  english:                    "english_meaning",
  mongolian_meaning:          "mongolian_meaning",
  "mongolian meaning":        "mongolian_meaning",
  mongolian:                  "mongolian_meaning",
  example_sentence:           "example_sentence",
  "example sentence":         "example_sentence",
  example_sentence_reading:   "example_sentence_reading",
  "example sentence reading": "example_sentence_reading",
  example_image_url:          "example_image_url",
  "example image url":        "example_image_url",
  "image url":                "example_image_url",
  image:                      "example_image_url",
  jlpt_level:                 "jlpt_level",
  "jlpt level":               "jlpt_level",
  jlpt:                       "jlpt_level",
  part_of_speech:             "part_of_speech",
  "part of speech":           "part_of_speech",
  pos:                        "part_of_speech",
};

function normaliseKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/_/g, " ");
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const conversationId = (formData.get("conversationId") as string | null) || null;
  const bookId = (formData.get("bookId") as string | null) || null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!["xlsx", "xls", "csv"].includes(ext ?? "")) {
    return NextResponse.json({ error: "Only .xlsx, .xls, .csv files accepted" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to array-of-objects (header row → keys)
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  });

  if (rows.length === 0) {
    return NextResponse.json({ error: "Spreadsheet is empty" }, { status: 400 });
  }

  // Map raw column names → our field names
  const mapped = rows.map((row) => {
    const entry: Record<string, string> = {};
    for (const [rawKey, value] of Object.entries(row)) {
      const norm = normaliseKey(rawKey);
      const field = COL_MAP[norm];
      if (field && String(value).trim()) {
        entry[field] = String(value).trim();
      }
    }
    return entry;
  });

  // Filter rows that have at least japanese_word
  const valid = mapped.filter((e) => e.japanese_word);
  if (valid.length === 0) {
    return NextResponse.json(
      { error: "No rows with a japanese_word column found. Check your column headers." },
      { status: 400 }
    );
  }

  await connectDB();

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const entry of valid) {
    try {
      // Only insert if the word does not already exist — never overwrite
      const existing = await DictionaryWord.exists({ japanese_word: entry.japanese_word });
      if (existing) {
        skipped++;
        continue;
      }
      await DictionaryWord.create({
        ...entry,
        ...(conversationId ? { conversationId } : {}),
        ...(bookId ? { bookId } : {}),
      });
      inserted++;
    } catch (err: unknown) {
      skipped++;
      errors.push(`"${entry.japanese_word}": ${(err as Error).message}`);
    }
  }

  return NextResponse.json({
    success: true,
    total: valid.length,
    inserted,
    skipped,
    errors: errors.slice(0, 10),
  });
}
