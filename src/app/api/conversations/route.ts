import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Conversation from "@/lib/db/models/Conversation";

export async function GET() {
  try {
    await connectDB();
    const conversations = await Conversation.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ conversations });
  } catch {
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const conversation = await Conversation.create(body);
    return NextResponse.json({ conversation }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
