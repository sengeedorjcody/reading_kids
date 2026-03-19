import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Conversation from "@/lib/db/models/Conversation";
import ConversationPage from "@/lib/db/models/ConversationPage";
import Character from "@/lib/db/models/Character";

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

    // Excel columns: page_number, character_name, text, char_x, char_y, text_x, text_y
    // Group rows by page_number
    const pageMap = new Map<number, Array<{ characterName: string; text: string; charX: number; charY: number; textX: number; textY: number }>>();

    for (const row of rows) {
      const pageNum = Number(row["page_number"] || row["page"] || 1);
      const characterName = String(row["character_name"] || row["character"] || "");
      const text = String(row["text"] || "");
      const charX = Number(row["char_x"] ?? 50);
      const charY = Number(row["char_y"] ?? 50);
      const textX = Number(row["text_x"] ?? 50);
      const textY = Number(row["text_y"] ?? 80);

      if (!pageMap.has(pageNum)) pageMap.set(pageNum, []);
      pageMap.get(pageNum)!.push({ characterName, text, charX, charY, textX, textY });
    }

    let inserted = 0;
    const errors: string[] = [];

    for (const [pageNum, slots] of Array.from(pageMap.entries())) {
      try {
        const characters = [];
        for (const slot of slots) {
          if (!slot.characterName) continue;
          const char = await Character.findOne({ name: new RegExp(`^${slot.characterName}$`, 'i') });
          if (!char) { errors.push(`Character not found: ${slot.characterName} (page ${pageNum})`); continue; }
          characters.push({
            characterId: char._id,
            text: slot.text,
            characterPosition: { x: slot.charX, y: slot.charY },
            textPosition: { x: slot.textX, y: slot.textY },
          });
        }

        await ConversationPage.findOneAndUpdate(
          { conversationId: params.conversationId, pageNumber: pageNum },
          { conversationId: params.conversationId, pageNumber: pageNum, characters },
          { upsert: true, new: true }
        );
        inserted++;
      } catch (e) {
        errors.push(`Page ${pageNum}: ${e instanceof Error ? e.message : 'error'}`);
      }
    }

    const total = await ConversationPage.countDocuments({ conversationId: params.conversationId });
    await Conversation.findByIdAndUpdate(params.conversationId, { totalPages: total });

    return NextResponse.json({ success: true, inserted, errors });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
