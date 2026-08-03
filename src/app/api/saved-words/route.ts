import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import "@/lib/db/models/DictionaryWord";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).populate("savedWords").lean();
  return NextResponse.json({ words: user?.savedWords ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { wordId } = await request.json();
  if (!wordId) return NextResponse.json({ error: "wordId is required" }, { status: 400 });

  await connectDB();
  await User.updateOne({ email: session.user.email }, { $addToSet: { savedWords: wordId } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const wordId = searchParams.get("wordId");
  if (!wordId) return NextResponse.json({ error: "wordId is required" }, { status: 400 });

  await connectDB();
  await User.updateOne({ email: session.user.email }, { $pull: { savedWords: wordId } });
  return NextResponse.json({ ok: true });
}
