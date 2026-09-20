export const dynamic = "force-dynamic";

import Link from "next/link";
import { connectDB } from "@/lib/db/mongoose";
import Topic from "@/lib/db/models/Topic";
import Sentence from "@/lib/db/models/Sentence";
import { ITopic } from "@/types";

async function getTopics() {
  try {
    await connectDB();
    const topics = await Topic.find({ isPublished: true }).sort({ order: 1, createdAt: -1 }).lean();
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

export default async function SentencesPage() {
  const { topics, coverByTopic } = await getTopics();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-28">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <span className="text-4xl">🗣️</span> Sentences
        </h1>
        <p className="text-white/60 mt-1">おぶんしょう を おぼえよう！</p>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🗣️</div>
          <p className="text-xl font-bold">No topics yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {topics.map((topic) => (
            <Link
              key={topic._id}
              href={`/sentences/${topic._id}`}
              className="flex flex-col rounded-3xl overflow-hidden bg-white/10 border-2 border-white/10 hover:border-white/30 transition-all active:scale-95 shadow-lg"
            >
              <div className="aspect-square w-full bg-gradient-to-br from-pink-400/30 to-purple-400/30 flex items-center justify-center overflow-hidden">
                {coverByTopic[topic._id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverByTopic[topic._id]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">🗣️</span>
                )}
              </div>
              <div className="p-3">
                <p className="font-black text-white truncate">{topic.title}</p>
                {topic.titleJapanese && (
                  <p className="text-sm text-white/60 truncate">{topic.titleJapanese}</p>
                )}
                <p className="text-xs text-white/40 mt-1">{topic.totalSentences} sentences</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
