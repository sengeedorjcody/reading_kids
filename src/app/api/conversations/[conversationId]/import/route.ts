import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Conversation from "@/lib/db/models/Conversation";
import ConversationPage from "@/lib/db/models/ConversationPage";

export async function POST(req: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    await connectDB();
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const XLSX = await import("xlsx");
    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];

    // Excel columns: page_number, text, text_x, text_y, background_url
    const pageMap = new Map<number, { texts: Array<{ text: string; position: { x: number; y: number } }>; backgroundImageUrl?: string }>();

    for (const row of rows) {
      const pageNum = Number(row["page_number"] || row["page"] || 1);
      const text = String(row["text"] ?? "");
      const textX = Number(row["text_x"] ?? 50);
      const textY = Number(row["text_y"] ?? 50);
      const bgUrl = row["background_url"] ? String(row["background_url"]) : undefined;

      if (!pageMap.has(pageNum)) pageMap.set(pageNum, { texts: [] });
      const entry = pageMap.get(pageNum)!;

      // Use background_url from the first row of each page
      if (bgUrl && !entry.backgroundImageUrl) entry.backgroundImageUrl = bgUrl;

      if (text) entry.texts.push({ text, position: { x: textX, y: textY } });
    }

    let inserted = 0;
    const errors: string[] = [];

    for (const [pageNum, data] of Array.from(pageMap.entries())) {
      try {
        await ConversationPage.findOneAndUpdate(
          { conversationId: params.conversationId, pageNumber: pageNum },
          {
            conversationId: params.conversationId,
            pageNumber: pageNum,
            texts: data.texts,
            ...(data.backgroundImageUrl ? { backgroundImageUrl: data.backgroundImageUrl } : {}),
          },
          { upsert: true, new: true }
        );
        inserted++;
      } catch (e) {
        errors.push(`Page ${pageNum}: ${e instanceof Error ? e.message : "error"}`);
      }
    }

    const total = await ConversationPage.countDocuments({ conversationId: params.conversationId });
    await Conversation.findByIdAndUpdate(params.conversationId, { totalPages: total });

    return NextResponse.json({ success: true, inserted, errors });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
