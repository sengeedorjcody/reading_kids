import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Character from "@/lib/db/models/Character";

export async function GET(_: NextRequest, { params }: { params: { characterId: string } }) {
  try {
    await connectDB();
    const character = await Character.findById(params.characterId).lean();
    if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ character });
  } catch {
    return NextResponse.json({ error: "Failed to fetch character" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { characterId: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const character = await Character.findByIdAndUpdate(params.characterId, body, { new: true }).lean();
    if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ character });
  } catch {
    return NextResponse.json({ error: "Failed to update character" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { characterId: string } }) {
  try {
    await connectDB();
    await Character.findByIdAndDelete(params.characterId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete character" }, { status: 500 });
  }
}
