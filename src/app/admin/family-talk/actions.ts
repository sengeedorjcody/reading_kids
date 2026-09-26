"use server";

import { connectDB } from "@/lib/db/mongoose";
import FamilyTalkTopic from "@/lib/db/models/FamilyTalkTopic";
import FamilyTalkWord from "@/lib/db/models/FamilyTalkWord";
import { revalidatePath } from "next/cache";

export async function deleteFamilyTopic(topicId: string) {
  await connectDB();
  await FamilyTalkTopic.findByIdAndDelete(topicId);
  await FamilyTalkWord.deleteMany({ topicId });
  revalidatePath("/admin/family-talk");
}

export async function deleteFamilyWord(topicId: string, wordId: string) {
  await connectDB();
  await FamilyTalkWord.findOneAndDelete({ _id: wordId, topicId });
  const total = await FamilyTalkWord.countDocuments({ topicId });
  await FamilyTalkTopic.findByIdAndUpdate(topicId, { totalWords: total });
  revalidatePath(`/admin/family-talk/${topicId}`);
}
