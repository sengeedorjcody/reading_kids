// Fallback lookups against free, key-free public dictionary APIs, used only
// when a word isn't in our own DictionaryWord collection. Jisho covers words
// and phrases; kanjiapi.dev gives cleaner single-kanji meanings/readings.
export interface ExternalDictWord {
  japanese_word: string;
  hiragana?: string;
  english_meaning?: string;
  source: "jisho" | "kanjiapi";
}

interface JishoResponse {
  data?: {
    japanese?: { word?: string; reading?: string }[];
    senses?: { english_definitions?: string[] }[];
  }[];
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function lookupJisho(keyword: string): Promise<ExternalDictWord | null> {
  const data = await fetchJson<JishoResponse>(
    `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword)}`
  );
  const entry = data?.data?.[0];
  if (!entry) return null;

  const japanese = entry.japanese?.[0] ?? {};
  const englishMeaning = (entry.senses ?? [])
    .slice(0, 2)
    .map((s) => (s.english_definitions ?? []).join(", "))
    .filter(Boolean)
    .join("; ");
  if (!englishMeaning) return null;

  return {
    japanese_word: japanese.word ?? japanese.reading ?? keyword,
    hiragana: japanese.reading || undefined,
    english_meaning: englishMeaning,
    source: "jisho",
  };
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
