import XLSX from "xlsx";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Conversation pages ────────────────────────────────────────────────────────
// Mobile canvas: 9:16, positions 0-100 (% of canvas)
// Characters stand near the bottom (char_y ~78-85), text bubbles near top
// Mom=右(right), Dad=左(left), Boy=中左(center-left), Girl=中右(center-right)

const rows = [
  // Page 1 — Morning greeting, Mom calls everyone
  { page_number: 1, character_name: "mom",  text: "おはようございます！\nみんな、おきて～！", height: 200, char_x: 75, char_y: 80, text_x: 60, text_y: 20 },

  // Page 2 — Dad wakes up
  { page_number: 2, character_name: "dad",  text: "おはよう。\nきょうは いい てんきだね。",   height: 200, char_x: 25, char_y: 80, text_x: 40, text_y: 20 },
  { page_number: 2, character_name: "mom",  text: "そうね！",                                  height: 200, char_x: 75, char_y: 80, text_x: 70, text_y: 35 },

  // Page 3 — Boy is hungry
  { page_number: 3, character_name: "boy",  text: "ぼく、おなかが すいた！",                  height: 160, char_x: 35, char_y: 82, text_x: 35, text_y: 22 },
  { page_number: 3, character_name: "girl", text: "わたしも！",                               height: 140, char_x: 65, char_y: 84, text_x: 68, text_y: 36 },

  // Page 4 — Mom serves breakfast
  { page_number: 4, character_name: "mom",  text: "はい、ごはんが できましたよ。\nたくさん たべてね！",  height: 200, char_x: 72, char_y: 78, text_x: 55, text_y: 18 },

  // Page 5 — Everyone sits down
  { page_number: 5, character_name: "dad",  text: "いただきます！",                           height: 200, char_x: 20, char_y: 80, text_x: 35, text_y: 22 },
  { page_number: 5, character_name: "mom",  text: "いただきます！",                           height: 200, char_x: 80, char_y: 80, text_x: 65, text_y: 22 },
  { page_number: 5, character_name: "boy",  text: "いただきます！",                           height: 160, char_x: 38, char_y: 83, text_x: 38, text_y: 38 },
  { page_number: 5, character_name: "girl", text: "いただきます！",                           height: 140, char_x: 62, char_y: 85, text_x: 62, text_y: 52 },

  // Page 6 — Boy likes eggs
  { page_number: 6, character_name: "boy",  text: "おいしい！\nたまごが だいすき！",          height: 160, char_x: 35, char_y: 82, text_x: 35, text_y: 22 },

  // Page 7 — Girl likes bread
  { page_number: 7, character_name: "girl", text: "パンも おいしいね。",                      height: 140, char_x: 62, char_y: 84, text_x: 60, text_y: 22 },
  { page_number: 7, character_name: "mom",  text: "もっと たべる？",                          height: 200, char_x: 78, char_y: 78, text_x: 72, text_y: 38 },

  // Page 8 — Dad checks time
  { page_number: 8, character_name: "dad",  text: "もう はちじだ！\nはやく じゅんびして！",  height: 200, char_x: 25, char_y: 80, text_x: 40, text_y: 20 },

  // Page 9 — Boy can't find bag
  { page_number: 9, character_name: "boy",  text: "かばんは どこ？",                         height: 160, char_x: 38, char_y: 82, text_x: 38, text_y: 22 },
  { page_number: 9, character_name: "girl", text: "ここに あるよ！",                         height: 140, char_x: 65, char_y: 84, text_x: 65, text_y: 36 },

  // Page 10 — Putting on shoes
  { page_number: 10, character_name: "boy",  text: "くつを はくよ。",                        height: 160, char_x: 35, char_y: 83, text_x: 35, text_y: 22 },
  { page_number: 10, character_name: "girl", text: "わたしも！",                             height: 140, char_x: 65, char_y: 85, text_x: 65, text_y: 36 },

  // Page 11 — Mom says goodbye
  { page_number: 11, character_name: "mom",  text: "いってらっしゃい！\nきをつけてね。",     height: 200, char_x: 75, char_y: 78, text_x: 58, text_y: 18 },
  { page_number: 11, character_name: "dad",  text: "いってきます！",                         height: 200, char_x: 22, char_y: 80, text_x: 35, text_y: 34 },

  // Page 12 — Kids say goodbye
  { page_number: 12, character_name: "boy",  text: "いってきます！\nまた あとで！",          height: 160, char_x: 35, char_y: 82, text_x: 35, text_y: 22 },
  { page_number: 12, character_name: "girl", text: "いってきます！",                         height: 140, char_x: 65, char_y: 84, text_x: 65, text_y: 38 },
  { page_number: 12, character_name: "mom",  text: "いってらっしゃい！",                     height: 200, char_x: 78, char_y: 78, text_x: 68, text_y: 54 },
];

const ws = XLSX.utils.json_to_sheet(rows);

// Column widths for readability
ws["!cols"] = [
  { wch: 12 }, // page_number
  { wch: 16 }, // character_name
  { wch: 32 }, // text
  { wch: 8  }, // height
  { wch: 8  }, // char_x
  { wch: 8  }, // char_y
  { wch: 8  }, // text_x
  { wch: 8  }, // text_y
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Pages");

const outPath = join(__dirname, "daily-conversation.xlsx");
XLSX.writeFile(wb, outPath);
console.log(`✅ Created: ${outPath}`);
console.log(`📋 ${rows.length} rows across ${new Set(rows.map(r => r.page_number)).size} pages`);
