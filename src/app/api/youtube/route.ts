import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import YoutubeVideo from "@/lib/db/models/YoutubeVideo";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("all") === "true" ? {} : { isActive: true };
  const videos = await YoutubeVideo.find(filter).sort({ order: 1, createdAt: 1 }).lean();
  return NextResponse.json(JSON.parse(JSON.stringify(videos)));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const video = await YoutubeVideo.create(body);
  return NextResponse.json(JSON.parse(JSON.stringify(video)), { status: 201 });
}
