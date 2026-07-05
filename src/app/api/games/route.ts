import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Game from "@/lib/db/models/Game";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("all") === "true" ? {} : { isActive: true };
  const games = await Game.find(filter).sort({ order: 1, createdAt: 1 }).lean();
  return NextResponse.json(JSON.parse(JSON.stringify(games)));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const game = await Game.create(body);
  return NextResponse.json(JSON.parse(JSON.stringify(game)), { status: 201 });
}
