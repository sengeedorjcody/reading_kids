export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import FamilyTalkTopic from "@/lib/db/models/FamilyTalkTopic";
import FamilyTalkWord from "@/lib/db/models/FamilyTalkWord";
import { IFamilyTalkTopic, IFamilyTalkWord } from "@/types";
import VocabularyBoard from "@/components/family-talk/VocabularyBoard";
import { enrichFamilyWordsFromDictionary } from "@/lib/familyTalk/enrichFromDictionary";

async function getData(id: string) {
  try {
    await connectDB();
    const [topic, words] = await Promise.all([
      FamilyTalkTopic.findOne({ _id: id, isPublished: true }).lean(),
      FamilyTalkWord.find({ topicId: id }).lean(),
    ]);
    return { topic, words };
  } catch {
    return { topic: null, words: [] };
  }
}

export default async function FamilyTalkTopicPage({ params }: { params: { topicId: string } }) {
  const { topic, words } = await getData(params.topicId);
  if (!topic) notFound();

  const topicData = JSON.parse(JSON.stringify(topic)) as IFamilyTalkTopic;
  const wordList = await enrichFamilyWordsFromDictionary(
    JSON.parse(JSON.stringify(words)) as IFamilyTalkWord[]
  );

  return <VocabularyBoard topic={topicData} words={wordList} />;
}
