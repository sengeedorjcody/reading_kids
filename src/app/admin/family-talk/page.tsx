export const dynamic = "force-dynamic";

import Link from "next/link";
import { connectDB } from "@/lib/db/mongoose";
import FamilyTalkTopic from "@/lib/db/models/FamilyTalkTopic";
import { IFamilyTalkTopic } from "@/types";
import DeleteFamilyTopicButton from "@/components/admin/DeleteFamilyTopicButton";
import PublishFamilyTopicButton from "@/components/admin/PublishFamilyTopicButton";
import SeedDefaultTopicsButton from "@/components/admin/SeedDefaultTopicsButton";

async function getTopics(): Promise<IFamilyTalkTopic[]> {
  try {
    await connectDB();
    const topics = await FamilyTalkTopic.find().sort({ order: 1, createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(topics));
  } catch {
    return [];
  }
}

export default async function AdminFamilyTalkPage() {
  const topics = await getTopics();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-700">👨‍👩‍👧‍👦 Family Talk</h1>
        <div className="flex items-center gap-3">
          <SeedDefaultTopicsButton />
          <Link href="/admin/family-talk/create" className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-xl transition-colors">
            + New Topic
          </Link>
        </div>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">👨‍👩‍👧‍👦</div>
          <p className="font-bold">No topics yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <div key={topic._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
              {topic.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={topic.coverImageUrl} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-3xl flex-shrink-0">
                  👨‍👩‍👧‍👦
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-gray-700 truncate">{topic.title}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${topic.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {topic.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{topic.totalWords} words</p>
              </div>
              <PublishFamilyTopicButton topicId={topic._id} isPublished={topic.isPublished} />
              <Link
                href={`/admin/family-talk/${topic._id}`}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-4 py-2 rounded-xl text-sm transition-colors flex-shrink-0"
              >
                Edit →
              </Link>
              <DeleteFamilyTopicButton topicId={topic._id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
