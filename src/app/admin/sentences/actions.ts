"use server";

import { connectDB } from "@/lib/db/mongoose";
import Topic from "@/lib/db/models/Topic";
import Sentence from "@/lib/db/models/Sentence";
import { revalidatePath } from "next/cache";

export async function deleteTopic(topicId: string) {
  await connectDB();
  await Topic.findByIdAndDelete(topicId);
  await Sentence.deleteMany({ topicId });
  revalidatePath("/admin/sentences");
}

export async function deleteSentence(topicId: string, sentenceId: string) {
  await connectDB();
  await Sentence.findOneAndDelete({ _id: sentenceId, topicId });

  const remaining = await Sentence.find({ topicId }).sort({ order: 1 });
  await Promise.all(
    remaining.map((s, i) =>
      s.order === i + 1 ? null : Sentence.updateOne({ _id: s._id }, { order: i + 1 })
    )
  );
  await Topic.findByIdAndUpdate(topicId, { totalSentences: remaining.length });

  revalidatePath(`/admin/sentences/${topicId}`);
}
