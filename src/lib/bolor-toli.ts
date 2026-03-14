/**
 * Translate a Japanese word to Mongolian using Google Translate (free, no key).
 * Uses the unofficial gtx client endpoint.
 */
export async function jaToMn(japaneseWord: string): Promise<string> {
  if (!japaneseWord) return "";

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=mn&dt=t&q=${encodeURIComponent(japaneseWord)}`;

  console.log(`[translate] GET ${url}`);

  try {
    const res = await fetch(url, { cache: "no-store" });
    const rawText = await res.text();
    console.log(`[translate] status=${res.status} body=${rawText}`);

    if (!res.ok) return "";

    // Response: [[["translated","original",null,null,10]],null,"ja"]
    const data = JSON.parse(rawText);
    const translated: string = data?.[0]?.[0]?.[0] ?? "";
    console.log(`[translate] result="${translated}"`);
    return translated;
  } catch (err) {
    console.error("[translate] error:", err);
    return "";
  }
}
