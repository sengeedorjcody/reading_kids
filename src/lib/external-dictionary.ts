// Fallback lookups against free, key-free public dictionary APIs, used only
// when a word isn't in our own DictionaryWord collection. Jisho covers words
// and phrases; kanjiapi.dev gives cleaner single-kanji meanings/readings.
export interface ExternalDictWord {
  japanese_word: string;
  hiragana?: string;
  english_meaning?: string;
  source: "jisho" | "kanjiapi";
}

interface JishoEntry {
  japanese?: { word?: string; reading?: string }[];
  senses?: { english_definitions?: string[] }[];
}

interface JishoResponse {
  data?: JishoEntry[];
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    // A plain server-side fetch with no User-Agent gets blocked by some
    // hosts (including, intermittently, Vercel's shared egress IPs hitting
    // jisho.org) — a browser-like UA avoids that.
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ReadingKidsBot/1.0)" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function entryToResult(entry: JishoEntry, fallbackWord: string): ExternalDictWord | null {
  const japanese = entry.japanese?.[0] ?? {};
  const englishMeaning = (entry.senses ?? [])
    .slice(0, 2)
    .map((s) => (s.english_definitions ?? []).join(", "))
    .filter(Boolean)
    .join("; ");
  if (!englishMeaning) return null;

  return {
    japanese_word: japanese.word ?? japanese.reading ?? fallbackWord,
    hiragana: japanese.reading || undefined,
    english_meaning: englishMeaning,
    source: "jisho",
  };
}

/** Does any 日本語 field on this entry match `word` exactly? */
function entryMatches(entry: JishoEntry, word: string): boolean {
  return (entry.japanese ?? []).some((j) => j.word === word || j.reading === word);
}

async function searchJisho(keyword: string): Promise<JishoEntry[]> {
  const data = await fetchJson<JishoResponse>(
    `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword)}`
  );
  return data?.data ?? [];
}

// Godan/ichidan て・た-form → dictionary-form guesses. Jisho's own search
// already deinflects ます/ない forms (e.g. "買いました" → 買う) but not
// て/た-form, so words tapped mid-sentence ("行って", "食べて", "飲んで")
// come back empty unless we try the plausible base forms ourselves.
function teTaFormCandidates(word: string): string[] {
  const candidates = new Set<string>();

  // Irregular verbs
  if (word === "行って" || word === "行った") candidates.add("行く");
  if (word.startsWith("来て") || word.startsWith("来た")) candidates.add("来る");
  if (word === "して" || word === "した") candidates.add("する");

  // Godan verbs, by row: って/った, んで/んだ, いて/いた, いで/いだ, して/した
  const godanPairs: [string, string[]][] = [
    ["って", ["う", "つ", "る"]],
    ["った", ["う", "つ", "る"]],
    ["んで", ["む", "ぶ", "ぬ"]],
    ["んだ", ["む", "ぶ", "ぬ"]],
    ["いて", ["く"]],
    ["いた", ["く"]],
    ["いで", ["ぐ"]],
    ["いだ", ["ぐ"]],
  ];
  for (const [suffix, rowEndings] of godanPairs) {
    if (word.length > suffix.length && word.endsWith(suffix)) {
      const stem = word.slice(0, -suffix.length);
      for (const ending of rowEndings) candidates.add(stem + ending);
    }
  }
  // す-row godan and suru-verbs both take して/した — try both bases
  if (word.length > 2 && (word.endsWith("して") || word.endsWith("した"))) {
    const stem = word.slice(0, -2);
    candidates.add(stem + "す");
    candidates.add(stem + "する");
  }

  // Ichidan (る-verbs): stem+て/た → stem+る
  if (word.length > 1 && (word.endsWith("て") || word.endsWith("た"))) {
    candidates.add(word.slice(0, -1) + "る");
  }

  candidates.delete(word);
  return Array.from(candidates);
}

async function lookupJisho(keyword: string): Promise<ExternalDictWord | null> {
  const entries = await searchJisho(keyword);

  const exact = entries.find((e) => entryMatches(e, keyword));
  if (exact) {
    const result = entryToResult(exact, keyword);
    if (result) return result;
  }

  // No exact hit — the tapped word may be a conjugated verb/adjective form
  // that Jisho didn't deinflect on its own. Try plausible dictionary forms.
  for (const candidate of teTaFormCandidates(keyword)) {
    const candidateEntries = await searchJisho(candidate);
    const candidateExact = candidateEntries.find((e) => entryMatches(e, candidate));
    if (candidateExact) {
      const result = entryToResult(candidateExact, candidate);
      if (result) return result;
    }
  }

  // Last resort: the original heuristic (first result), so phrases/compounds
  // with no single exact entry still show something instead of nothing.
  return entries[0] ? entryToResult(entries[0], keyword) : null;
}

interface KanjiApiResponse {
  kanji?: string;
  meanings?: string[];
  kun_readings?: string[];
  on_readings?: string[];
}

async function lookupKanjiApi(char: string): Promise<ExternalDictWord | null> {
  const data = await fetchJson<KanjiApiResponse>(
    `https://kanjiapi.dev/v1/kanji/${encodeURIComponent(char)}`
  );
  if (!data?.meanings?.length) return null;

  const reading = (data.kun_readings?.[0] ?? data.on_readings?.[0] ?? "").replace(/[.-].*$/, "");
  return {
    japanese_word: char,
    hiragana: reading || undefined,
    english_meaning: data.meanings.slice(0, 4).join(", "),
    source: "kanjiapi",
  };
}

/** Try kanjiapi.dev first for single-kanji lookups, otherwise Jisho. */
export async function lookupExternalDictionary(keyword: string): Promise<ExternalDictWord | null> {
  const trimmed = keyword.trim();
  if (!trimmed) return null;

  if (Array.from(trimmed).length === 1) {
    const kanjiResult = await lookupKanjiApi(trimmed);
    if (kanjiResult) return kanjiResult;
  }

  return lookupJisho(trimmed);
}
