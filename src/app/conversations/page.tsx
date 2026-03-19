export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import Conversation from "@/lib/db/models/Conversation";
import { IConversation } from "@/types";
import ConversationCard from "@/components/conversation/ConversationCard";

async function getConversations(): Promise<IConversation[]> {
  try {
    await connectDB();
    const conversations = await Conversation.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(conversations));
  } catch { return []; }
}

export default async function ConversationsPage() {
  const conversations = await getConversations();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
          <span className="text-4xl">💬</span> Conversations
        </h1>
        <p className="text-gray-500 mt-1">かいわ を よもう！</p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-xl font-bold">No conversations yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {conversations.map((conv) => (
            <ConversationCard key={conv._id} conversation={conv} />
          ))}
        </div>
      )}
    </div>
  );
}
