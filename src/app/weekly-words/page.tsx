export const dynamic = "force-dynamic";

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import WeeklyWords from "@/lib/db/models/WeeklyWords";
import User from "@/lib/db/models/User";
import { syncWeeklyWordsFromDictionary } from "@/lib/weeklyWords/syncFromDictionary";
import { IWeeklyWords } from "@/types";
import WeeklyWordsGrid from "@/components/weekly-words/WeeklyWordsGrid";

async function getWeeks(): Promise<IWeeklyWords[]> {
  try {
    await connectDB();
    const count = await WeeklyWords.countDocuments();
    if (count === 0) {
      await syncWeeklyWordsFromDictionary();
    }
    const weeks = await WeeklyWords.find({ isPublished: true })
      .sort({ order: 1, weekNumber: 1 })
      .lean();
    return JSON.parse(JSON.stringify(weeks));
  } catch (err) {
    console.error("Error loading weekly words:", err);
    return [];
  }
}

async function getCompletedWeeks(email?: string | null): Promise<number[]> {
  if (!email) return [];
  try {
    await connectDB();
    const user = await User.findOne({ email })
      .select("completedWeeklyWords")
      .lean();
    return user?.completedWeeklyWords ?? [];
  } catch {
    return [];
  }
}

export default async function WeeklyWordsPage() {
  const session = await getServerSession(authOptions);
  const [weeks, serverCompletedWeeks] = await Promise.all([
    getWeeks(),
    getCompletedWeeks(session?.user?.email),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white text-xl transition-all"
          >
            ←
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <span className="text-4xl">📅</span> Weekly Words
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Долоо хоног бүр 8 шинэ үг цээжилье! · 8 words per week
            </p>
          </div>
        </div>
      </div>

      {weeks.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white/5 rounded-3xl border border-white/10 p-8">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-xl font-bold text-white mb-2">No weekly words yet</p>
          <p className="text-sm text-white/50 mb-6">
            Words will be automatically generated from your dictionary in sets of 8.
          </p>
          <form
            action={async () => {
              "use server";
              await syncWeeklyWordsFromDictionary();
            }}
          >
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg active:scale-95 transition-all"
            >
              🔄 Generate Weeks from Dictionary
            </button>
          </form>
        </div>
      ) : (
        <WeeklyWordsGrid
          weeks={weeks}
          serverCompletedWeeks={serverCompletedWeeks}
        />
      )}
    </div>
  );
}
