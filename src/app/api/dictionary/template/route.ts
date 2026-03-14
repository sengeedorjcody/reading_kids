import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const XLSX = require("xlsx");

export async function GET() {
  const headers = [
    "japanese_word",
    "hiragana",
    "romaji",
    "english_meaning",
    "mongolian_meaning",
    "example_sentence",
    "example_sentence_reading",
    "example_image_url",
    "jlpt_level",
    "part_of_speech",
  ];

  // Two example rows so users see the format immediately
  const examples = [
    {
      japanese_word: "猫",
      hiragana: "ねこ",
      romaji: "neko",
      english_meaning: "cat",
      mongolian_meaning: "муур",
      example_sentence: "猫がいます。",
      example_sentence_reading: "ねこがいます。",
      example_image_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      jlpt_level: "N5",
      part_of_speech: "noun",
    },
    {
      japanese_word: "犬",
      hiragana: "いぬ",
      romaji: "inu",
      english_meaning: "dog",
      mongolian_meaning: "нохой",
      example_sentence: "犬がいます。",
      example_sentence_reading: "いぬがいます。",
      example_image_url: "https://res.cloudinary.com/demo/image/upload/dog.jpg",
      jlpt_level: "N5",
      part_of_speech: "noun",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(examples, { header: headers });

  // Style the header row (column widths)
  worksheet["!cols"] = headers.map((h) =>
    h === "example_image_url" || h.includes("sentence") ? { wch: 40 } : { wch: 18 }
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dictionary");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  const blob = new Blob([raw], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Disposition": 'attachment; filename="dictionary_template.xlsx"',
    },
  });
}
