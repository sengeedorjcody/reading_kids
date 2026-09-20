import Topic from "@/lib/db/models/Topic";
import Sentence from "@/lib/db/models/Sentence";

export interface SentenceRow {
  japanese: string;
  romaji?: string;
  english_meaning?: string;
  mongolian_meaning?: string;
  imageUrl?: string;
  imagePrompt?: string;
}

export interface ImportSummary {
  inserted: number;
  skippedDuplicates: number;
  errors: string[];
}

function normaliseJapanese(text: string): string {
  return text.trim();
}

// Inserts rows into a topic's sentences, skipping any row whose japanese
// text already exists in that topic (case-sensitive exact match, since
// Japanese text has no casing) — both against what's already saved and
// against earlier rows in the same import batch.
export async function insertSentencesForTopic(topicId: string, rows: SentenceRow[]): Promise<ImportSummary> {
  const existing = await Sentence.find({ topicId }).select("japanese").lean();
  const seen = new Set(existing.map((s) => normaliseJapanese(s.japanese)));

  const existingCount = existing.length;
  let inserted = 0;
  let skippedDuplicates = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const key = normaliseJapanese(row.japanese);
    if (seen.has(key)) {
      skippedDuplicates++;
      continue;
    }
    try {
      await Sentence.create({ ...row, topicId, order: existingCount + inserted + 1 });
      seen.add(key);
      inserted++;
    } catch (err: unknown) {
      errors.push(`"${row.japanese}": ${(err as Error).message}`);
    }
  }

  if (inserted > 0) {
    const total = await Sentence.countDocuments({ topicId });
    await Topic.findByIdAndUpdate(topicId, { totalSentences: total });
  }

  return { inserted, skippedDuplicates, errors: errors.slice(0, 10) };
}
