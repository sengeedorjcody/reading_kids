export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import Conversation from "@/lib/db/models/Conversation";
import ConversationPage from "@/lib/db/models/ConversationPage";
import Character from "@/lib/db/models/Character";
import { IConversation, IConversationPage, ICharacter } from "@/types";
import ConversationPageEditor from "@/components/admin/ConversationPageEditor";
import ConversationExcelImport from "@/components/admin/ConversationExcelImport";
import ConversationEditPanel from "@/components/admin/ConversationEditPanel";

async function getData(id: string) {
  try {
    await connectDB();
    void Character;
    const [conv, pages, characters] = await Promise.all([
      Conversation.findById(id).lean(),
      ConversationPage.find({ conversationId: id }).sort({ pageNumber: 1 }).populate("characters.characterId").lean(),
      Character.find().sort({ name: 1 }).lean(),
    ]);
    return { conv, pages, characters };
  } catch { return { conv: null, pages: [], characters: [] }; }
}

export default async function AdminConversationDetailPage({ params }: { params: { conversationId: string } }) {
  const { conv, pages, characters } = await getData(params.conversationId);
  if (!conv) notFound();

  const conversation = JSON.parse(JSON.stringify(conv)) as IConversation;
  const convPages = JSON.parse(JSON.stringify(pages)) as IConversationPage[];
  const charList = JSON.parse(JSON.stringify(characters)) as ICharacter[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/conversations" className="text-gray-400 hover:text-gray-600 text-sm font-bold">← Conversations</Link>
          </div>
          <h1 className="text-2xl font-black text-gray-700 flex items-center gap-2">
            💬 {conversation.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${conversation.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {conversation.isPublished ? "Published" : "Draft"}
            </span>
            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">
              {conversation.displayMode === 'mobile' ? '📱 Mobile' : '🖥️ Desktop'}
            </span>
            <span className="text-xs text-gray-400">{convPages.length} pages</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ConversationEditPanel conversation={conversation} />
          <Link
            href={`/conversations/${conversation._id}/read/1`}
            target="_blank"
            className="bg-pink-50 hover:bg-pink-100 text-pink-600 font-bold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            👁 Preview →
          </Link>
        </div>
      </div>

      {/* Excel Import */}
      <ConversationExcelImport conversationId={params.conversationId} />

      {/* Pages */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-600">📄 Pages ({convPages.length})</h2>
        </div>

        {/* Existing pages */}
        {convPages.map((page) => (
          <ConversationPageEditor
            key={page._id}
            page={page}
            characters={charList}
            conversationId={params.conversationId}
            backgroundImageUrl={conversation.backgroundImageUrl}
            displayMode={conversation.displayMode}
          />
        ))}

        {/* Add new page */}
        <AddPageButton conversationId={params.conversationId} />
      </div>
    </div>
  );
}

function AddPageButton({ conversationId }: { conversationId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        const { connectDB } = await import("@/lib/db/mongoose");
        const ConvPage = (await import("@/lib/db/models/ConversationPage")).default;
        const Conv = (await import("@/lib/db/models/Conversation")).default;
        await connectDB();
        const last = await ConvPage.findOne({ conversationId }).sort({ pageNumber: -1 });
        const pageNumber = (last?.pageNumber ?? 0) + 1;
        await ConvPage.create({ conversationId, pageNumber, characters: [] });
        const total = await ConvPage.countDocuments({ conversationId });
        await Conv.findByIdAndUpdate(conversationId, { totalPages: total });
        const { revalidatePath } = await import("next/cache");
        revalidatePath(`/admin/conversations/${conversationId}`);
      }}
    >
      <button
        type="submit"
        className="w-full border-2 border-dashed border-gray-200 hover:border-rose-300 text-gray-400 hover:text-rose-500 font-bold py-4 rounded-2xl transition-all hover:bg-rose-50"
      >
        + Add Page
      </button>
    </form>
  );
}
