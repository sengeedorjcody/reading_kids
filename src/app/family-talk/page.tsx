export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import FamilyTalkTopic from "@/lib/db/models/FamilyTalkTopic";
import { IFamilyTalkTopic } from "@/types";
import TopicBoard from "@/components/family-talk/TopicBoard";

async function getTopics(): Promise<IFamilyTalkTopic[]> {
  try {
    await connectDB();
    const topics = await FamilyTalkTopic.find({ isPublished: true, totalWords: { $gt: 0 } })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(topics));
  } catch {
    return [];
  }
}

export default async function FamilyTalkPage() {
  const topics = await getTopics();
  return <TopicBoard topics={topics} />;
}
