import TinySegmenter from "tiny-segmenter";

const segmenter = new TinySegmenter();

const PUNCT_RE = /^[「」『』（）()、。！？!?,.\s・…「」"']+$/;
const SPLIT_PUNCT_RE = /([「」『』（）()、。！？!?,・…]+)/;

export function isPunctuationToken(surface: string): boolean {
  return PUNCT_RE.test(surface.trim());
}

/**
 * Tokenize a single sentence/line into word and punctuation tokens.
 * - If the text already has spaces (e.g. kids textbook wakachigaki), split on spaces
 *   and peel off surrounding punctuation so dictionary lookup gets clean words.
 * - Otherwise, run TinySegmenter for Japanese word segmentation.
 */
export function tokenizeBellaLine(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const rawPieces = /[\s　]/.test(trimmed)
    ? trimmed.split(/[\s　]+/).filter(Boolean)
    : (segmenter.segment(trimmed) as string[]).filter((s) => s.trim().length > 0);

  const tokens: string[] = [];
  for (const piece of rawPieces) {
    const parts = piece.split(SPLIT_PUNCT_RE).filter(Boolean);
    for (const part of parts) {
      const clean = part.trim();
      if (clean) tokens.push(clean);
    }
  }
  return tokens;
}

/**
 * Split raw reading passage into lines/sentences while preserving paragraph breaks.
 * Each non-empty line becomes a sentence entry.
 */
export function splitBellaLines(raw: string): string[] {
  return raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function rawTextToBellaSentences(rawText: string) {
  return splitBellaLines(rawText).map((text) => ({
    text,
    words: tokenizeBellaLine(text).map((surface) => ({ surface })),
  }));
}
