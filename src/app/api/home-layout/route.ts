import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import HomeLayout from "@/lib/db/models/HomeLayout";

export async function GET() {
  await connectDB();
  const layout = await HomeLayout.findOne().lean();
  return NextResponse.json({ items: layout?.items ?? [] });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const items = Array.isArray(body.items) ? body.items : [];

  await connectDB();
  const layout = await HomeLayout.findOneAndUpdate(
    {},
    { items },
    { upsert: true, new: true }
  );
  return NextResponse.json({ items: layout.items });
}
