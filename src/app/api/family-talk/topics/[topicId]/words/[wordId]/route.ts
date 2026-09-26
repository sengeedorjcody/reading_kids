import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import FamilyTalkTopic from "@/lib/db/models/FamilyTalkTopic";
import FamilyTalkWord from "@/lib/db/models/FamilyTalkWord";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { topicId: string; wordId: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    delete body.topicId;
    const word = await FamilyTalkWord.findOneAndUpdate(
      { _id: params.wordId, topicId: params.topicId },
      body,
      { new: true }
    ).lean();
    if (!word) return NextResponse.json({ error: "Word not found" }, { status: 404 });
    return NextResponse.json({ word });
  } catch {
    return NextResponse.json({ error: "Failed to update word" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { topicId: string; wordId: string } }
) {
  try {
    await connectDB();
    await FamilyTalkWord.findOneAndDelete({ _id: params.wordId, topicId: params.topicId });
    const total = await FamilyTalkWord.countDocuments({ topicId: params.topicId });
    await FamilyTalkTopic.findByIdAndUpdate(params.topicId, { totalWords: total });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete word" }, { status: 500 });
  }
}
