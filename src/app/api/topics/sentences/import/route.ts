import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Topic from "@/lib/db/models/Topic";
import { insertSentencesForTopic, type SentenceRow } from "@/lib/sentences/importSentences";

// xlsx is a server-only package — use require to avoid ESM issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const XLSX = require("xlsx");

const COL_MAP: Record<string, string> = {
  topic: "topic",
  "topic title": "topic",
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

export async function POST(req: NextRequest) {
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

  const valid = mapped.filter((e) => Boolean(e.topic && e.japanese)) as unknown as (SentenceRow & { topic: string })[];
  if (valid.length === 0) {
    return NextResponse.json(
      { error: "No rows with both a topic and a japanese column found. Check your column headers." },
      { status: 400 }
    );
  }

  await connectDB();

  // Group rows by topic title (case-insensitive)
  const groups = new Map<string, { title: string; rows: SentenceRow[] }>();
  for (const { topic, ...row } of valid) {
    const key = topic.toLowerCase();
    if (!groups.has(key)) groups.set(key, { title: topic, rows: [] });
    groups.get(key)!.rows.push(row);
  }

  const existingTopics = await Topic.find({}).select("title").lean();
  const topicIdByTitle = new Map(existingTopics.map((t) => [t.title.toLowerCase(), String(t._id)]));

  let topicsCreated = 0;
  let inserted = 0;
  let skippedDuplicates = 0;
  const errors: string[] = [];

  for (const [key, group] of Array.from(groups.entries())) {
    let topicId = topicIdByTitle.get(key);
    if (!topicId) {
      const created = await Topic.create({ title: group.title, isPublished: false });
      topicId = String(created._id);
      topicIdByTitle.set(key, topicId);
      topicsCreated++;
    }

    const result = await insertSentencesForTopic(topicId, group.rows);
    inserted += result.inserted;
    skippedDuplicates += result.skippedDuplicates;
    if (result.errors.length > 0) {
      errors.push(...result.errors.map((e) => `[${group.title}] ${e}`));
    }
  }

  if (skippedDuplicates > 0) {
    errors.unshift(`${skippedDuplicates} duplicate sentence(s) skipped.`);
  }

  return NextResponse.json({
    success: true,
    total: valid.length,
    topicsTouched: groups.size,
    topicsCreated,
    inserted,
    errors: errors.slice(0, 10),
  });
}
