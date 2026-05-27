import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const IMAGE_EXTS = /\.(jpe?g|png|webp|gif|avif|svg)$/i;

export async function GET() {
  const dir = path.join(process.cwd(), "public", "templates");
  try {
    const files = fs
      .readdirSync(dir)
      .filter((f) => IMAGE_EXTS.test(f))
      .sort();
    return NextResponse.json(files);
  } catch {
    return NextResponse.json([]);
  }
}
