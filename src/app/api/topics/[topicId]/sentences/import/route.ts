import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Topic from "@/lib/db/models/Topic";
import Sentence from "@/lib/db/models/Sentence";

// xlsx is a server-only package — use require to avoid ESM issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const XLSX = require("xlsx");

const MAX_SENTENCES_PER_TOPIC = 4;

const COL_MAP: Record<string, string> = {
  japanese: "japanese",
  japanese_sentence: "japanese",
  "japanese sentence": "japanese",
  romaji: "romaji",
  english_meaning: "english_meaning",
  "english meaning": "english_meaning",
  english: "english_meaning",
  mongolian_meaning: "mongolian_meaning",
  "mongolian meaning": "mongolian_meaning",
  mongolian: "mongolian_meaning",
  image_url: "imageUrl",
  "image url": "imageUrl",
  imageurl: "imageUrl",
  image: "imageUrl",
  image_prompt: "imagePrompt",
  "image prompt": "imagePrompt",
  imageprompt: "imagePrompt",
};

function normaliseKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/_/g, " ");
}

export async function POST(
  req: NextRequest,
  { params }: { params: { topicId: string } }
) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!["xlsx", "xls", "csv"].includes(ext ?? "")) {
    return NextResponse.json({ error: "Only .xlsx, .xls, .csv files accepted" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

  if (rows.length === 0) {
    return NextResponse.json({ error: "Spreadsheet is empty" }, { status: 400 });
  }

  const mapped = rows.map((row) => {
    const entry: Record<string, string> = {};
    for (const [rawKey, value] of Object.entries(row)) {
      const field = COL_MAP[normaliseKey(rawKey)];
      if (field && String(value).trim()) entry[field] = String(value).trim();
    }
    return entry;
  });

  const valid = mapped.filter((e) => e.japanese);
  if (valid.length === 0) {
    return NextResponse.json(
      { error: "No rows with a japanese column found. Check your column headers." },
      { status: 400 }
    );
  }

  await connectDB();

  const existingCount = await Sentence.countDocuments({ topicId: params.topicId });
  const remainingSlots = MAX_SENTENCES_PER_TOPIC - existingCount;
  const toInsert = valid.slice(0, Math.max(0, remainingSlots));
  const errors: string[] = [];
  if (valid.length > toInsert.length) {
    errors.push(
      `A topic can have at most ${MAX_SENTENCES_PER_TOPIC} sentences — ${valid.length - toInsert.length} row(s) skipped.`
    );
  }

  let inserted = 0;
  for (let i = 0; i < toInsert.length; i++) {
    try {
      await Sentence.create({ ...toInsert[i], topicId: params.topicId, order: existingCount + i + 1 });
      inserted++;
    } catch (err: unknown) {
      errors.push(`Row ${i + 1}: ${(err as Error).message}`);
    }
  }

  const total = await Sentence.countDocuments({ topicId: params.topicId });
  await Topic.findByIdAndUpdate(params.topicId, { totalSentences: total });

  return NextResponse.json({ success: true, total: valid.length, inserted, errors: errors.slice(0, 10) });
}
