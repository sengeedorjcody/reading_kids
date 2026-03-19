export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import Conversation from "@/lib/db/models/Conversation";
import ConversationPage from "@/lib/db/models/ConversationPage";
import Character from "@/lib/db/models/Character";
import { IConversation, IConversationPage } from "@/types";
import ConversationLayout from "@/components/conversation/ConversationLayout";

async function getData(conversationId: string, pageNum: number) {
  try {
    await connectDB();
    // Register Character model for populate
    void Character;
    const [conv, page] = await Promise.all([
      Conversation.findById(conversationId).lean(),
      ConversationPage.findOne({ conversationId, pageNumber: pageNum })
        .populate("characters.characterId")
        .lean(),
    ]);
    return { conv, page };
  } catch { return { conv: null, page: null }; }
}

export default async function ConversationReadPage({
  params,
}: {
  params: { conversationId: string; pageNum: string };
}) {
  const pageNum = parseInt(params.pageNum);
  if (isNaN(pageNum) || pageNum < 1) notFound();

  const { conv, page } = await getData(params.conversationId, pageNum);
  if (!conv) notFound();

  const conversation = JSON.parse(JSON.stringify(conv)) as IConversation;
  const conversationPage = page ? (JSON.parse(JSON.stringify(page)) as IConversationPage) : null;

  return (
    <ConversationLayout
      conversation={conversation}
      page={conversationPage}
      currentPage={pageNum}
    />
  );
}
