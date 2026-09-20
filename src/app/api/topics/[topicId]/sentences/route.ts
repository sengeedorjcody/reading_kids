import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Topic from "@/lib/db/models/Topic";
import Sentence from "@/lib/db/models/Sentence";

const MAX_SENTENCES_PER_TOPIC = 4;

export async function GET(
  _request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    await connectDB();
    const sentences = await Sentence.find({ topicId: params.topicId }).sort({ order: 1 }).lean();
    return NextResponse.json({ sentences });
  } catch {
    return NextResponse.json({ error: "Failed to fetch sentences" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    await connectDB();
    const count = await Sentence.countDocuments({ topicId: params.topicId });
    if (count >= MAX_SENTENCES_PER_TOPIC) {
      return NextResponse.json(
        { error: `A topic can have at most ${MAX_SENTENCES_PER_TOPIC} sentences` },
        { status: 400 }
      );
    }
    const body = await req.json();
    const sentence = await Sentence.create({ ...body, topicId: params.topicId, order: count + 1 });
    const total = await Sentence.countDocuments({ topicId: params.topicId });
    await Topic.findByIdAndUpdate(params.topicId, { totalSentences: total });
    return NextResponse.json({ sentence }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create sentence" }, { status: 500 });
  }
}
