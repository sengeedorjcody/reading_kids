import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Conversation from "@/lib/db/models/Conversation";
import ConversationPage from "@/lib/db/models/ConversationPage";

export async function GET(_: NextRequest, { params }: { params: { conversationId: string; pageNum: string } }) {
  try {
    await connectDB();
    const page = await ConversationPage.findOne({
      conversationId: params.conversationId,
      pageNumber: parseInt(params.pageNum),
    }).populate("characters.characterId").lean();
    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ page });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { conversationId: string; pageNum: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const page = await ConversationPage.findOneAndUpdate(
      { conversationId: params.conversationId, pageNumber: parseInt(params.pageNum) },
      body,
      { new: true }
    );
    return NextResponse.json({ page });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { conversationId: string; pageNum: string } }) {
  try {
    await connectDB();
    await ConversationPage.findOneAndDelete({
      conversationId: params.conversationId,
      pageNumber: parseInt(params.pageNum),
    });
    const total = await ConversationPage.countDocuments({ conversationId: params.conversationId });
    await Conversation.findByIdAndUpdate(params.conversationId, { totalPages: total });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
