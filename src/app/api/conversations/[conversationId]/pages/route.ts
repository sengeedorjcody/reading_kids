import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Conversation from "@/lib/db/models/Conversation";
import ConversationPage from "@/lib/db/models/ConversationPage";

export async function GET(_: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    await connectDB();
    const pages = await ConversationPage.find({ conversationId: params.conversationId })
      .sort({ pageNumber: 1 })
      .populate("characters.characterId")
      .lean();
    return NextResponse.json({ pages });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const last = await ConversationPage.findOne({ conversationId: params.conversationId }).sort({ pageNumber: -1 });
    const pageNumber = (last?.pageNumber ?? 0) + 1;
    const page = await ConversationPage.create({ ...body, conversationId: params.conversationId, pageNumber });
    const total = await ConversationPage.countDocuments({ conversationId: params.conversationId });
    await Conversation.findByIdAndUpdate(params.conversationId, { totalPages: total });
    return NextResponse.json({ page }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
