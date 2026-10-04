import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ completedWeeks: [] });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email })
    .select("completedWeeklyWords")
    .lean();

  return NextResponse.json({
    completedWeeks: user?.completedWeeklyWords ?? [],
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const weekNumber = Number(body.weekNumber);
  if (!weekNumber || isNaN(weekNumber)) {
    return NextResponse.json(
      { error: "Valid weekNumber is required" },
      { status: 400 }
    );
  }

  await connectDB();
  await User.updateOne(
    { email: session.user.email },
    { $addToSet: { completedWeeklyWords: weekNumber } }
  );

  return NextResponse.json({ ok: true, weekNumber });
}
