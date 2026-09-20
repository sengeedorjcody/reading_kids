import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Topic from "@/lib/db/models/Topic";
import Sentence from "@/lib/db/models/Sentence";

export async function GET(
  _request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    await connectDB();
    const topic = await Topic.findById(params.topicId).lean();
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
    const topic = await Topic.findByIdAndUpdate(params.topicId, body, { new: true }).lean();
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
    await Topic.findByIdAndDelete(params.topicId);
    await Sentence.deleteMany({ topicId: params.topicId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete topic" }, { status: 500 });
  }
}
