import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Topic from "@/lib/db/models/Topic";
import Sentence from "@/lib/db/models/Sentence";

export async function GET(
  _request: NextRequest,
  { params }: { params: { topicId: string; sentenceId: string } }
) {
  try {
    await connectDB();
    const sentence = await Sentence.findOne({ _id: params.sentenceId, topicId: params.topicId }).lean();
    if (!sentence) return NextResponse.json({ error: "Sentence not found" }, { status: 404 });
    return NextResponse.json({ sentence });
  } catch {
    return NextResponse.json({ error: "Failed to fetch sentence" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { topicId: string; sentenceId: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    delete body.topicId;
    delete body.order;
    const sentence = await Sentence.findOneAndUpdate(
      { _id: params.sentenceId, topicId: params.topicId },
      body,
      { new: true }
    ).lean();
    if (!sentence) return NextResponse.json({ error: "Sentence not found" }, { status: 404 });
    return NextResponse.json({ sentence });
  } catch {
    return NextResponse.json({ error: "Failed to update sentence" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { topicId: string; sentenceId: string } }
) {
  try {
    await connectDB();
    await Sentence.findOneAndDelete({ _id: params.sentenceId, topicId: params.topicId });

    // Re-index remaining sentences to stay contiguous 1..N so future
    // additions always land at count+1 without leaving gaps.
    const remaining = await Sentence.find({ topicId: params.topicId }).sort({ order: 1 });
    await Promise.all(
      remaining.map((s, i) =>
        s.order === i + 1 ? null : Sentence.updateOne({ _id: s._id }, { order: i + 1 })
      )
    );

    await Topic.findByIdAndUpdate(params.topicId, { totalSentences: remaining.length });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete sentence" }, { status: 500 });
  }
}
