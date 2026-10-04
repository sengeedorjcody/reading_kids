import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import WeeklyWords from "@/lib/db/models/WeeklyWords";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { weekId: string } }
) {
  try {
    await connectDB();
    const { weekId } = params;

    let week = null;
    if (mongoose.Types.ObjectId.isValid(weekId)) {
      week = await WeeklyWords.findById(weekId).lean();
    }
    if (!week && !isNaN(Number(weekId))) {
      week = await WeeklyWords.findOne({ weekNumber: Number(weekId) }).lean();
    }

    if (!week) {
      return NextResponse.json({ error: "Week not found" }, { status: 404 });
    }

    return NextResponse.json({ week });
  } catch (error) {
    console.error("Failed to fetch week:", error);
    return NextResponse.json({ error: "Failed to fetch week" }, { status: 500 });
  }
}
