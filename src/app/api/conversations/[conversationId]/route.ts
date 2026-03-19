import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Conversation from "@/lib/db/models/Conversation";
import ConversationPage from "@/lib/db/models/ConversationPage";

export async function GET(_: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    await connectDB();
    const conv = await Conversation.findById(params.conversationId).lean();
    if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ conversation: conv });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const conv = await Conversation.findByIdAndUpdate(params.conversationId, body, { new: true });
    return NextResponse.json({ conversation: conv });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    await connectDB();
    await Promise.all([
      Conversation.findByIdAndDelete(params.conversationId),
      ConversationPage.deleteMany({ conversationId: params.conversationId }),
    ]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
