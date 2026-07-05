import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import YoutubeVideo from "@/lib/db/models/YoutubeVideo";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const video = await YoutubeVideo.findById(params.id).lean();
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(JSON.parse(JSON.stringify(video)));
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const video = await YoutubeVideo.findByIdAndUpdate(params.id, body, { new: true }).lean();
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(JSON.parse(JSON.stringify(video)));
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  await YoutubeVideo.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
