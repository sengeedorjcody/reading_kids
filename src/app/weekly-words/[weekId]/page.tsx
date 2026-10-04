export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import WeeklyWords from "@/lib/db/models/WeeklyWords";
import { IWeeklyWords } from "@/types";
import WeeklyWordsQuizView from "@/components/weekly-words/WeeklyWordsQuizView";

async function getWeekData(weekId: string): Promise<IWeeklyWords | null> {
  try {
    await connectDB();
    let week = null;

    if (mongoose.Types.ObjectId.isValid(weekId)) {
      week = await WeeklyWords.findById(weekId).lean();
    }
    if (!week && !isNaN(Number(weekId))) {
      week = await WeeklyWords.findOne({ weekNumber: Number(weekId) }).lean();
    }

    if (!week) return null;
    return JSON.parse(JSON.stringify(week));
  } catch (error) {
    console.error("Failed to load week data:", error);
    return null;
  }
}

export default async function WeeklyWordsDetailPage({
  params,
}: {
  params: { weekId: string };
}) {
  const week = await getWeekData(params.weekId);
  if (!week) notFound();

  return <WeeklyWordsQuizView week={week} />;
}
