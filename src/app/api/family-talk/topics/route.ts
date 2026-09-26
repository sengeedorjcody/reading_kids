import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import FamilyTalkTopic from "@/lib/db/models/FamilyTalkTopic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get("isPublished") === "true";
    const query = publishedOnly ? { isPublished: true } : {};
    const topics = await FamilyTalkTopic.find(query).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ topics });
  } catch {
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const topic = await FamilyTalkTopic.create(body);
    return NextResponse.json({ topic }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 });
  }
}
