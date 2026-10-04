import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import WeeklyWords from "@/lib/db/models/WeeklyWords";
import { syncWeeklyWordsFromDictionary } from "@/lib/weeklyWords/syncFromDictionary";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const count = await WeeklyWords.countDocuments();
    if (count === 0) {
      await syncWeeklyWordsFromDictionary();
    }

    const weeks = await WeeklyWords.find({ isPublished: true })
      .sort({ order: 1, weekNumber: 1 })
      .lean();

    return NextResponse.json({ weeks });
  } catch (error) {
    console.error("Failed to fetch weekly words:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly words" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const weeks = await syncWeeklyWordsFromDictionary();
    return NextResponse.json({
      success: true,
      count: weeks.length,
      weeks,
    });
  } catch (error) {
    console.error("Failed to sync weekly words:", error);
    return NextResponse.json(
      { error: "Failed to sync weekly words from dictionary" },
      { status: 500 }
    );
  }
}
