import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Conversation from "@/lib/db/models/Conversation";

export async function GET() {
  try {
    await connectDB();
    const conversations = await Conversation.find().sort({ createdAt: -1 }).select("_id title").lean();
    return NextResponse.json({ conversations });
  } catch {
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}
