import { NextRequest, NextResponse } from "next/server";
import { jaToMn } from "@/lib/bolor-toli";

// GET /api/mongolian?word=うん
export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word");
  if (!word) {
    return NextResponse.json({ error: "word is required" }, { status: 400 });
  }

  console.log(`[/api/mongolian] translating: "${word}"`);
  const mongolian = await jaToMn(word);
  console.log(`[/api/mongolian] result: "${mongolian}"`);

  return NextResponse.json({ mongolian });
}
