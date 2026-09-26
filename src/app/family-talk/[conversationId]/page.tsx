export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import Conversation from "@/lib/db/models/Conversation";
import DictionaryWord from "@/lib/db/models/DictionaryWord";
import { IConversation, IDictionaryWord } from "@/types";
import VocabularyBoard from "@/components/family-talk/VocabularyBoard";

async function getData(id: string) {
  try {
    await connectDB();
    const [conversation, words] = await Promise.all([
      Conversation.findOne({ _id: id, isPublished: true }).lean(),
      DictionaryWord.find({ conversationId: id }).lean(),
    ]);
    return { conversation, words };
  } catch {
    return { conversation: null, words: [] };
  }
}

export default async function FamilyTalkTopicPage({ params }: { params: { conversationId: string } }) {
  const { conversation, words } = await getData(params.conversationId);
  if (!conversation) notFound();

  const topic = JSON.parse(JSON.stringify(conversation)) as IConversation;
  const wordList = JSON.parse(JSON.stringify(words)) as IDictionaryWord[];

  return <VocabularyBoard topic={topic} words={wordList} />;
}
