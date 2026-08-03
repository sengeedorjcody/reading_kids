import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean();
  return NextResponse.json({ lastExamPromptDate: user?.lastExamPromptDate ?? null, today: todayStr() });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const today = todayStr();
  await User.updateOne({ email: session.user.email }, { $set: { lastExamPromptDate: today } });
  return NextResponse.json({ lastExamPromptDate: today });
}
