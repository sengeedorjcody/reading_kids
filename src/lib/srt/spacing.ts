// lib/srt/spacing.ts
// Parse an SRT file and insert spaces between Japanese words (分かち書き / wakachigaki)
// so each token is tappable when rendered in the reader.
//
// Uses tiny-segmenter (pure-JS, no dictionary files, works client- or server-side).
//   npm i tiny-segmenter
//   npm i -D @types/tiny-segmenter   (optional; a fallback declaration is below)
//
// For higher accuracy (keeps compound words together more reliably) you can swap
// the tokenizer for `kuromoji`, but it ships a ~15MB dictionary and needs async init.

import TinySegmenter from "tiny-segmenter";

const segmenter = new TinySegmenter();

export interface SrtCue {
  index: number;
  start: string; // "00:00:01,930"
  end: string; // "00:00:04,910"
  text: string; // may contain "\n" for multi-line cues
}

const TIME_RE =
  /(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/;

// Known noise to drop on import.
const WATERMARK =
  "(Transcribed by TurboScribe. Go Unlimited to remove this message.) ";
const NOISE_MARKERS = ["[音楽]", "[拍手]", "[笑い]"];

// Punctuation that must NOT have a space inserted before it.
const NO_SPACE_BEFORE = new Set([
  "、", "。", "！", "？", "」", "』", "）", "）", "…", "・",
  ",", ".", "!", "?", ")",
]);

/** Split raw .srt text into structured cues. */
export function parseSrt(content: string): SrtCue[] {
  const normalized = content.replace(/\r\n/g, "\n").replace(WATERMARK, "");
  const blocks = normalized.trim().split(/\n\s*\n/);
  const cues: SrtCue[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.length > 0);
    if (lines.length < 2) continue;

    // The timestamp line is whichever line matches TIME_RE.
    const timeLineIdx = lines.findIndex((l) => TIME_RE.test(l));
    if (timeLineIdx === -1) continue;

    const m = lines[timeLineIdx].match(TIME_RE)!;
    const indexLine = timeLineIdx > 0 ? lines[timeLineIdx - 1] : "";
    const index = parseInt(indexLine, 10);
    const textLines = lines.slice(timeLineIdx + 1);

    let text = textLines.join("\n");
    for (const marker of NOISE_MARKERS) text = text.split(marker).join("");
    text = text.trim();
    if (!text) continue;

    cues.push({
      index: Number.isNaN(index) ? cues.length + 1 : index,
      start: m[1],
      end: m[2],
      text,
    });
  }

  return cues;
}

/** Join tokens with spaces, but keep punctuation attached to the previous token. */
function joinTokens(tokens: string[]): string {
  let out = "";
  tokens.forEach((tok, i) => {
    if (tok === "") return;
    if (i === 0 || NO_SPACE_BEFORE.has(tok)) out += tok;
    else out += " " + tok;
  });
  return out.replace(/\s+/g, " ").trim();
}

/** Insert word spacing into a single line of (possibly mixed JP/EN) text. */
export function spaceLine(line: string): string {
  if (!line.trim()) return line;
  const tokens = segmenter.segment(line) as string[];
  return joinTokens(tokens);
}

/** Insert word spacing into cue text, preserving internal line breaks. */
export function spaceText(text: string): string {
  return text
    .split("\n")
    .map((line) => spaceLine(line))
    .join("\n");
}

/** Serialize cues back into a valid .srt string (re-numbered from 1). */
export function stringifySrt(cues: SrtCue[]): string {
  return (
    cues
      .map((c, i) => `${i + 1}\n${c.start} --> ${c.end}\n${c.text}`)
      .join("\n\n") + "\n"
  );
}

export interface FixSrtOptions {
  /** Add wakachigaki spacing between words. Default true. */
  spacing?: boolean;
}

/** One-shot: raw .srt in, cleaned + spaced .srt out (plus the parsed cues). */
export function fixSrt(
  content: string,
  opts: FixSrtOptions = {}
): { srt: string; cues: SrtCue[] } {
  const { spacing = true } = opts;
  const cues = parseSrt(content).map((c) => ({
    ...c,
    text: spacing ? spaceText(c.text) : c.text,
  }));
  return { srt: stringifySrt(cues), cues };
}
