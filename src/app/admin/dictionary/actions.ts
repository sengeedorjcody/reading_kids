"use server";

import { connectDB } from "@/lib/db/mongoose";
import DictionaryWord from "@/lib/db/models/DictionaryWord";
import { revalidatePath } from "next/cache";

export async function deleteWord(wordId: string) {
  await connectDB();
  await DictionaryWord.findByIdAndDelete(wordId);
  revalidatePath("/admin/dictionary");
}

export async function deleteWords(wordIds: string[]) {
  if (!wordIds.length) return;
  await connectDB();
  await DictionaryWord.deleteMany({ _id: { $in: wordIds } });
  revalidatePath("/admin/dictionary");
}
