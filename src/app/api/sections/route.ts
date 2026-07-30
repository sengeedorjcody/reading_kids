import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import Section from "@/lib/db/models/Section";

export async function GET() {
  await connectDB();
  const hiddenDocs = await Section.find({ isHidden: true }).select("href").lean();
  return NextResponse.json({ hidden: hiddenDocs.map((d) => d.href) });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { href, isHidden } = await req.json();
  if (!href || typeof isHidden !== "boolean") {
    return NextResponse.json({ error: "href and isHidden are required" }, { status: 400 });
  }

  await connectDB();
  await Section.findOneAndUpdate({ href }, { isHidden }, { upsert: true });
  return NextResponse.json({ ok: true });
}
