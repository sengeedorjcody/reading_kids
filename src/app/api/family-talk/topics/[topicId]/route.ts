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
    const topic = await FamilyTalkTopic.findById(params.topicId).lean();
    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    return NextResponse.json({ topic });
  } catch {
    return NextResponse.json({ error: "Failed to fetch topic" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    const topic = await FamilyTalkTopic.findByIdAndUpdate(params.topicId, body, { new: true }).lean();
    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    return NextResponse.json({ topic });
  } catch {
    return NextResponse.json({ error: "Failed to update topic" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    await connectDB();
    await FamilyTalkTopic.findByIdAndDelete(params.topicId);
    await FamilyTalkWord.deleteMany({ topicId: params.topicId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete topic" }, { status: 500 });
  }
}
