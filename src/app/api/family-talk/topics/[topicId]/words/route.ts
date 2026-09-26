import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import FamilyTalkTopic from "@/lib/db/models/FamilyTalkTopic";
import FamilyTalkWord from "@/lib/db/models/FamilyTalkWord";

export async function GET(
  _request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    await connectDB();
    const words = await FamilyTalkWord.find({ topicId: params.topicId }).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ words });
  } catch {
    return NextResponse.json({ error: "Failed to fetch words" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    await connectDB();
    const body = await req.json();
    const word = await FamilyTalkWord.create({ ...body, topicId: params.topicId });
    const total = await FamilyTalkWord.countDocuments({ topicId: params.topicId });
    await FamilyTalkTopic.findByIdAndUpdate(params.topicId, { totalWords: total });
    return NextResponse.json({ word }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create word" }, { status: 500 });
  }
}
