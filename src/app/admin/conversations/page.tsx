export const dynamic = "force-dynamic";

import Link from "next/link";
import { connectDB } from "@/lib/db/mongoose";
import Conversation from "@/lib/db/models/Conversation";
import { IConversation } from "@/types";
import DeleteConversationButton from "@/components/admin/DeleteConversationButton";

async function getConversations(): Promise<IConversation[]> {
  try {
    await connectDB();
    const convs = await Conversation.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(convs));
  } catch { return []; }
}

export default async function AdminConversationsPage() {
  const conversations = await getConversations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-700">💬 Conversations</h1>
        <Link href="/admin/conversations/create" className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-xl transition-colors">
          + New Conversation
        </Link>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">💬</div>
          <p className="font-bold">No conversations yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <div key={conv._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
              {conv.backgroundImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={conv.backgroundImageUrl} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-3xl flex-shrink-0">
                  💬
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-gray-700 truncate">{conv.title}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${conv.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {conv.isPublished ? "Published" : "Draft"}
                  </span>
                  <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                    {conv.displayMode === 'mobile' ? '📱 Mobile' : '🖥️ Desktop'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{conv.totalPages} pages</p>
              </div>
              <Link
                href={`/admin/conversations/${conv._id}`}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-4 py-2 rounded-xl text-sm transition-colors flex-shrink-0"
              >
                Edit →
              </Link>
              <DeleteConversationButton conversationId={conv._id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
