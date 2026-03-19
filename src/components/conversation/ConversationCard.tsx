import Link from "next/link";
import { IConversation } from "@/types";

interface ConversationCardProps {
  conversation: IConversation;
}

export default function ConversationCard({ conversation }: ConversationCardProps) {
  return (
    <Link
      href={`/conversations/${conversation._id}/read/1`}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border-2 border-rose-100 hover:border-rose-300 transition-all duration-300 hover:-translate-y-1 block"
    >
      {conversation.backgroundImageUrl ? (
        <div className="relative h-28 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={conversation.backgroundImageUrl} alt={conversation.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3 right-3">
            <div className="flex items-center gap-1">
              <span className="text-xs bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">
                {conversation.displayMode === 'mobile' ? '📱' : '🖥️'}
              </span>
              <span className="text-xs text-white/80 font-medium">{conversation.totalPages}ページ</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-28 bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100 flex items-center justify-center">
          <span className="text-5xl">💬</span>
        </div>
      )}
      <div className="p-3">
        <h3 className="font-black text-gray-800 text-sm leading-tight line-clamp-2">{conversation.title}</h3>
        {conversation.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{conversation.description}</p>
        )}
      </div>
    </Link>
  );
}
