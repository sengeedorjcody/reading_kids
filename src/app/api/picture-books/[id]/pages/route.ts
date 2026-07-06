import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import PictureBook from "@/lib/db/models/PictureBook";
import PictureBookPage from "@/lib/db/models/PictureBookPage";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const pages = await PictureBookPage.find({ pictureBookId: params.id }).sort({ pageNumber: 1 }).lean();
    return NextResponse.json({ pages });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const last = await PictureBookPage.findOne({ pictureBookId: params.id }).sort({ pageNumber: -1 });
    const pageNumber = (last?.pageNumber ?? 0) + 1;
    const page = await PictureBookPage.create({ ...body, pictureBookId: params.id, pageNumber });
    const total = await PictureBookPage.countDocuments({ pictureBookId: params.id });
    await PictureBook.findByIdAndUpdate(params.id, { totalPages: total });
    return NextResponse.json({ page }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
