export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import FamilyTalkTopic from "@/lib/db/models/FamilyTalkTopic";
import FamilyTalkWord from "@/lib/db/models/FamilyTalkWord";
import { IFamilyTalkTopic, IFamilyTalkWord } from "@/types";
import FamilyTopicEditPanel from "@/components/admin/FamilyTopicEditPanel";
import FamilyWordForm from "@/components/admin/FamilyWordForm";
import PublishFamilyTopicButton from "@/components/admin/PublishFamilyTopicButton";

async function getData(id: string) {
  try {
    await connectDB();
    const [topic, words] = await Promise.all([
      FamilyTalkTopic.findById(id).lean(),
      FamilyTalkWord.find({ topicId: id }).sort({ createdAt: 1 }).lean(),
    ]);
    return { topic, words };
  } catch {
    return { topic: null, words: [] };
  }
}

export default async function AdminFamilyTopicDetailPage({ params }: { params: { topicId: string } }) {
  const { topic, words } = await getData(params.topicId);
  if (!topic) notFound();

  const topicData = JSON.parse(JSON.stringify(topic)) as IFamilyTalkTopic;
  const wordList = JSON.parse(JSON.stringify(words)) as IFamilyTalkWord[];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/family-talk" className="text-gray-400 hover:text-gray-600 text-sm font-bold">← Family Talk</Link>
          </div>
          <h1 className="text-2xl font-black text-gray-700 flex items-center gap-2">
            👨‍👩‍👧‍👦 {topicData.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${topicData.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {topicData.isPublished ? "Published" : "Draft"}
            </span>
            <span className="text-xs text-gray-400">{wordList.length} words</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PublishFamilyTopicButton topicId={topicData._id} isPublished={topicData.isPublished} />
          <FamilyTopicEditPanel topic={topicData} />
          <Link
            href={`/family-talk/${topicData._id}`}
            target="_blank"
            className="bg-pink-50 hover:bg-pink-100 text-pink-600 font-bold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            👁 Preview →
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-black text-gray-600">🔤 Words ({wordList.length})</h2>

        {wordList.map((word) => (
          <FamilyWordForm key={word._id} topicId={topicData._id} word={word} />
        ))}

        <AddWordButton topicId={topicData._id} />
      </div>
    </div>
  );
}

function AddWordButton({ topicId }: { topicId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        const { connectDB } = await import("@/lib/db/mongoose");
        const WordModel = (await import("@/lib/db/models/FamilyTalkWord")).default;
        const TopicModel = (await import("@/lib/db/models/FamilyTalkTopic")).default;
        await connectDB();
        await WordModel.create({ topicId, japanese: "" });
        const total = await WordModel.countDocuments({ topicId });
        await TopicModel.findByIdAndUpdate(topicId, { totalWords: total });
        const { revalidatePath } = await import("next/cache");
        revalidatePath(`/admin/family-talk/${topicId}`);
      }}
    >
      <button
        type="submit"
        className="w-full border-2 border-dashed border-gray-200 hover:border-rose-300 text-gray-400 hover:text-rose-500 font-bold py-4 rounded-2xl transition-all hover:bg-rose-50"
      >
        + Add Word
      </button>
    </form>
  );
}
