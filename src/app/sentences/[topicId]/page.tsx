export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import Topic from "@/lib/db/models/Topic";
import Sentence from "@/lib/db/models/Sentence";
import { ITopic, ITopicSentence } from "@/types";
import SentenceStudyView from "@/components/sentences/SentenceStudyView";

async function getData(id: string) {
  try {
    await connectDB();
    const [topic, sentences] = await Promise.all([
      Topic.findOne({ _id: id, isPublished: true }).lean(),
      Sentence.find({ topicId: id }).sort({ order: 1 }).lean(),
    ]);
    return { topic, sentences };
  } catch {
    return { topic: null, sentences: [] };
  }
}

export default async function TopicStudyPage({ params }: { params: { topicId: string } }) {
  const { topic, sentences } = await getData(params.topicId);
  if (!topic) notFound();

  const topicData = JSON.parse(JSON.stringify(topic)) as ITopic;
  const sentenceList = JSON.parse(JSON.stringify(sentences)) as ITopicSentence[];

  return <SentenceStudyView topic={topicData} sentences={sentenceList} />;
}
