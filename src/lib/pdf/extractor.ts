export interface PageData {
  pageNumber: number;
  rawText: string;
  sentences: string[];
}

// Split Japanese text into sentences on sentence-ending punctuation
function splitSentences(text: string): string[] {
  // Split on Japanese sentence endings: 。！？ or newlines
  const parts = text
    .split(/([。！？\n]+)/)
    .reduce<string[]>((acc, part, i, arr) => {
      if (i % 2 === 0) {
        const next = arr[i + 1] || "";
        const combined = (part + next).trim();
        if (combined.length > 0) acc.push(combined);
      }
      return acc;
    }, []);

  return parts.filter((s) => s.trim().length > 0);
}

// Simple word tokenizer for Japanese: splits on particles and punctuation
export function simpleTokenize(sentence: string): string[] {
  // Remove trailing punctuation
  const cleaned = sentence.replace(/[。！？、「」『』【】（）…]/g, " ").trim();
  // Split on whitespace and common particles
  const tokens = cleaned
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  return tokens;
}

export async function extractPagesFromBuffer(buffer: Buffer): Promise<PageData[]> {
  // pdf-parse@1.1.1 exports the parse function as module.exports directly (CJS)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse: (buf: Buffer) => Promise<{ text: string }> = require("pdf-parse");
  const data = await pdfParse(buffer);

  const fullText = data.text;

  // Try to split by page markers — pdf-parse puts form feeds (\f) between pages
  const rawPages = fullText.split(/\f/).filter((p: string) => p.trim().length > 0);

  if (rawPages.length === 0) {
    // Fallback: treat the whole document as one page
    return [
      {
        pageNumber: 1,
        rawText: fullText,
        sentences: splitSentences(fullText),
      },
    ];
  }

  return rawPages.map((pageText: string, index: number) => ({
    pageNumber: index + 1,
    rawText: pageText.trim(),
    sentences: splitSentences(pageText),
  }));
}
