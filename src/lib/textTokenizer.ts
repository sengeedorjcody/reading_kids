/**
 * Split a Japanese/mixed string into word-like tokens.
 * Rules:
 *   - If the string has spaces → split on spaces
 *   - Otherwise group consecutive kanji/kana chars into one token,
 *     and keep latin words / punctuation as separate tokens.
 */
export function tokenise(text: string): string[] {
  if (text.includes(" ")) return text.split(/\s+/).filter(Boolean);

  const tokens: string[] = [];
  let buf = "";
  const isJapanese = (c: string) => /[぀-ヿ一-鿿]/.test(c);

  for (const ch of text) {
    if (isJapanese(ch) || /[a-zA-ZÀ-ÖØ-öø-ÿ0-9]/.test(ch)) {
      buf += ch;
    } else {
      if (buf) { tokens.push(buf); buf = ""; }
      if (ch.trim()) tokens.push(ch);
    }
  }
  if (buf) tokens.push(buf);
  return tokens.filter(Boolean);
}

/**
 * Split raw text block into sentences at Japanese/English sentence endings.
 * Each non-empty line also becomes its own sentence.
 */
export function splitSentences(raw: string): string[] {
  return raw
    .split(/(?<=[。！？!?\n])/)
    .flatMap((s) => s.split("\n"))
    .map((s) => s.trim())
    .filter(Boolean);
}

export function textToSentences(rawText: string) {
  return splitSentences(rawText).map((text) => ({
    text,
    words: tokenise(text).map((surface) => ({ surface })),
  }));
}
