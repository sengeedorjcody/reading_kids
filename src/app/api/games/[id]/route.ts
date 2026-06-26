import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Game from "@/lib/db/models/Game";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const game = await Game.findByIdAndUpdate(params.id, body, { new: true }).lean();
  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(JSON.parse(JSON.stringify(game)));
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  await Game.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
