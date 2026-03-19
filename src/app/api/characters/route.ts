import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Character from "@/lib/db/models/Character";

export async function GET() {
  try {
    await connectDB();
    const characters = await Character.find().sort({ name: 1 }).lean();
    return NextResponse.json({ characters });
  } catch {
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const character = await Character.create(body);
    return NextResponse.json({ character }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create character" }, { status: 500 });
  }
}
