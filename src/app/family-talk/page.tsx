export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import Conversation from "@/lib/db/models/Conversation";
import DictionaryWord from "@/lib/db/models/DictionaryWord";
import { IConversation } from "@/types";
import TopicBoard from "@/components/family-talk/TopicBoard";

async function getTopics(): Promise<IConversation[]> {
  try {
    await connectDB();
    const conversations = await Conversation.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
    const counts = await DictionaryWord.aggregate([
      { $match: { conversationId: { $in: conversations.map((c) => c._id) } } },
      { $group: { _id: "$conversationId", count: { $sum: 1 } } },
    ]);
    const countByConversation = new Set(counts.filter((c) => c.count > 0).map((c) => String(c._id)));
    const withVocab = conversations.filter((c) => countByConversation.has(String(c._id)));
    return JSON.parse(JSON.stringify(withVocab));
  } catch {
    return [];
  }
}

export default async function FamilyTalkPage() {
  const topics = await getTopics();
  return <TopicBoard topics={topics} />;
}
