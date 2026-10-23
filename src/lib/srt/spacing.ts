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

// Known noise to drop on import (any TurboScribe watermark variant).
const WATERMARK_RE = /\(Transcribed by TurboScribe\.[^)]*\)\s*/g;
const NOISE_MARKERS = ["[音楽]", "[拍手]", "[笑い]"];

// Punctuation that must NOT have a space inserted before it.
const NO_SPACE_BEFORE = new Set([
  "、", "。", "！", "？", "」", "』", "）", "）", "…", "・",
  ",", ".", "!", "?", ")",
]);

/** Split raw .srt text into structured cues. */
export function parseSrt(content: string): SrtCue[] {
  const normalized = content.replace(/\r\n/g, "\n").replace(WATERMARK_RE, "");
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

// ── Sentence re-segmentation ────────────────────────────────────────────────
// Transcribers cut cues mid-sentence and also pack several sentences into one
// cue. Split each cue at internal sentence ends (time shared by text length),
// then merge consecutive pieces until a sentence end, so 1 cue = 1 sentence.

const SENTENCE_END = ["。", "!", "?", "！", "？", "…"];
const MAX_CHARS = 45;
const MAX_MS = 9000;

const charCount = (t: string) => t.replace(/\s/g, "").length;

function toMs(t: string): number {
  const [h, m, rest] = t.replace(".", ",").split(":");
  const [sec, ms] = rest.split(",");
  return ((+h * 60 + +m) * 60 + +sec) * 1000 + +ms;
}

function fromMs(v: number): string {
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  const h = Math.floor(v / 3600000);
  const m = Math.floor((v % 3600000) / 60000);
  const s = Math.floor((v % 60000) / 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(v % 1000, 3)}`;
}

/** Re-cut cues so each one holds exactly one sentence. */
export function mergeSentences(cues: SrtCue[]): SrtCue[] {
  const pieces: { s: number; e: number; text: string }[] = [];
  for (const c of cues) {
    const s = toMs(c.start);
    const e = toMs(c.end);
    const text = c.text.replace(/\n/g, " ").trim();
    const parts = (text.match(/.*?(?:[。!?！？]|…+|$)/g) ?? []).filter(Boolean);
    const total = parts.reduce((n, p) => n + p.length, 0) || 1;
    let cur = s;
    let acc = 0;
    parts.forEach((p, i) => {
      acc += p.length;
      const d = i === parts.length - 1 ? e : s + Math.round(((e - s) * acc) / total);
      pieces.push({ s: cur, e: d, text: p.trim() });
      cur = d;
    });
  }

  // No sentence punctuation at all (e.g. song lyrics) → nothing to merge on;
  // keep the original cue lines and timing.
  if (!pieces.some((p) => SENTENCE_END.some((end) => p.text.endsWith(end)))) {
    return cues.map((c, i) => ({ ...c, index: i + 1, text: c.text.trim() }));
  }

  const merged: { s: number; e: number; text: string }[] = [];
  let open: { s: number; e: number; text: string } | null = null;
  for (const p of pieces) {
    // Never grow a cue past the "too long" limits, even without punctuation.
    if (open && (charCount(open.text + p.text) > MAX_CHARS || p.e - open.s > MAX_MS)) {
      merged.push(open);
      open = null;
    }
    if (!open) open = { ...p };
    else {
      open.e = p.e;
      open.text += p.text;
    }
    if (SENTENCE_END.some((end) => open!.text.endsWith(end))) {
      merged.push(open);
      open = null;
    }
  }
  if (open) merged.push(open);

  return merged.map((m, i) => ({ index: i + 1, start: fromMs(m.s), end: fromMs(m.e), text: m.text }));
}

/** A cue that is probably still a run-on sentence worth checking by hand. */
export function isSuspiciousCue(c: SrtCue): boolean {
  return charCount(c.text) > MAX_CHARS || toMs(c.end) - toMs(c.start) > MAX_MS;
}

export interface FixSrtOptions {
  /** Add wakachigaki spacing between words. Default true. */
  spacing?: boolean;
  /** Re-cut cues so each holds one full sentence. Default true. */
  sentences?: boolean;
}

/** One-shot: raw .srt in, cleaned + spaced .srt out (plus the parsed cues). */
export function fixSrt(
  content: string,
  opts: FixSrtOptions = {}
): { srt: string; cues: SrtCue[] } {
  const { spacing = true, sentences = true } = opts;
  const parsed = parseSrt(content);
  const cues = (sentences ? mergeSentences(parsed) : parsed).map((c) => ({
    ...c,
    text: spacing ? spaceText(c.text) : c.text,
  }));
  return { srt: stringifySrt(cues), cues };
}
