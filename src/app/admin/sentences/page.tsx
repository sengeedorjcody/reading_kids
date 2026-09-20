export const dynamic = "force-dynamic";

import Link from "next/link";
import { connectDB } from "@/lib/db/mongoose";
import Topic from "@/lib/db/models/Topic";
import Sentence from "@/lib/db/models/Sentence";
import { ITopic } from "@/types";
import DeleteTopicButton from "@/components/admin/DeleteTopicButton";

async function getTopics() {
  try {
    await connectDB();
    const topics = await Topic.find().sort({ order: 1, createdAt: -1 }).lean();
    const covers = await Sentence.find({
      topicId: { $in: topics.map((t) => t._id) },
      order: 1,
    })
      .select("topicId imageUrl")
      .lean();
    const coverByTopic = new Map(covers.map((c) => [String(c.topicId), c.imageUrl]));
    return {
      topics: JSON.parse(JSON.stringify(topics)) as ITopic[],
      coverByTopic: Object.fromEntries(coverByTopic) as Record<string, string | undefined>,
    };
  } catch {
    return { topics: [] as ITopic[], coverByTopic: {} as Record<string, string | undefined> };
  }
}

export default async function AdminSentencesPage() {
  const { topics, coverByTopic } = await getTopics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-700">🗣️ Sentences</h1>
        <Link href="/admin/sentences/create" className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-xl transition-colors">
          + New Topic
        </Link>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🗣️</div>
          <p className="font-bold">No topics yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <div key={topic._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
              {coverByTopic[topic._id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverByTopic[topic._id]} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-3xl flex-shrink-0">
                  🗣️
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-gray-700 truncate">{topic.title}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${topic.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {topic.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{topic.totalSentences}/4 sentences</p>
              </div>
              <Link
                href={`/admin/sentences/${topic._id}`}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-4 py-2 rounded-xl text-sm transition-colors flex-shrink-0"
              >
                Edit →
              </Link>
              <DeleteTopicButton topicId={topic._id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
