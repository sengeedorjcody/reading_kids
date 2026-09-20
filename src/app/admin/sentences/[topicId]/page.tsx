export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import Topic from "@/lib/db/models/Topic";
import Sentence from "@/lib/db/models/Sentence";
import { ITopic, ITopicSentence } from "@/types";
import TopicEditPanel from "@/components/admin/TopicEditPanel";
import SentenceForm from "@/components/admin/SentenceForm";
import SentenceExcelImport from "@/components/admin/SentenceExcelImport";
import InsertExampleSentencesButton from "@/components/admin/InsertExampleSentencesButton";
import PublishTopicButton from "@/components/admin/PublishTopicButton";

const MAX_SENTENCES_PER_TOPIC = 4;

async function getData(id: string) {
  try {
    await connectDB();
    const [topic, sentences] = await Promise.all([
      Topic.findById(id).lean(),
      Sentence.find({ topicId: id }).sort({ order: 1 }).lean(),
    ]);
    return { topic, sentences };
  } catch {
    return { topic: null, sentences: [] };
  }
}

export default async function AdminTopicDetailPage({ params }: { params: { topicId: string } }) {
  const { topic, sentences } = await getData(params.topicId);
  if (!topic) notFound();

  const topicData = JSON.parse(JSON.stringify(topic)) as ITopic;
  const sentenceList = JSON.parse(JSON.stringify(sentences)) as ITopicSentence[];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/sentences" className="text-gray-400 hover:text-gray-600 text-sm font-bold">← Sentences</Link>
          </div>
          <h1 className="text-2xl font-black text-gray-700 flex items-center gap-2">
            🗣️ {topicData.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${topicData.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {topicData.isPublished ? "Published" : "Draft"}
            </span>
            <span className="text-xs text-gray-400">{sentenceList.length}/{MAX_SENTENCES_PER_TOPIC} sentences</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PublishTopicButton topicId={topicData._id} isPublished={topicData.isPublished} />
          <TopicEditPanel topic={topicData} />
          <Link
            href={`/sentences/${topicData._id}`}
            target="_blank"
            className="bg-pink-50 hover:bg-pink-100 text-pink-600 font-bold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            👁 Preview →
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <InsertExampleSentencesButton topicId={topicData._id} />
      </div>
      <SentenceExcelImport topicId={topicData._id} />

      <div className="space-y-4">
        <h2 className="text-lg font-black text-gray-600">💬 Sentences ({sentenceList.length}/{MAX_SENTENCES_PER_TOPIC})</h2>

        {sentenceList.map((sentence) => (
          <SentenceForm key={sentence._id} topicId={topicData._id} sentence={sentence} />
        ))}

        {sentenceList.length < MAX_SENTENCES_PER_TOPIC && (
          <AddSentenceButton topicId={topicData._id} />
        )}
      </div>
    </div>
  );
}

function AddSentenceButton({ topicId }: { topicId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        const { connectDB } = await import("@/lib/db/mongoose");
        const SentenceModel = (await import("@/lib/db/models/Sentence")).default;
        const TopicModel = (await import("@/lib/db/models/Topic")).default;
        await connectDB();
        const count = await SentenceModel.countDocuments({ topicId });
        if (count >= MAX_SENTENCES_PER_TOPIC) return;
        await SentenceModel.create({ topicId, order: count + 1, japanese: "" });
        const total = await SentenceModel.countDocuments({ topicId });
        await TopicModel.findByIdAndUpdate(topicId, { totalSentences: total });
        const { revalidatePath } = await import("next/cache");
        revalidatePath(`/admin/sentences/${topicId}`);
      }}
    >
      <button
        type="submit"
        className="w-full border-2 border-dashed border-gray-200 hover:border-rose-300 text-gray-400 hover:text-rose-500 font-bold py-4 rounded-2xl transition-all hover:bg-rose-50"
      >
        + Add Sentence
      </button>
    </form>
  );
}
