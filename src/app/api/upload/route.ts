import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Book from "@/lib/db/models/Book";
import Page from "@/lib/db/models/Page";
import DictionaryWord from "@/lib/db/models/DictionaryWord";
import { extractPagesFromBuffer, simpleTokenize } from "@/lib/pdf/extractor";
import { uploadBuffer } from "@/lib/cloudinary/client";

// Allow up to 120 seconds — PDF upload + parsing can be slow for large files
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const level = formData.get("level") as string;
    const description = formData.get("description") as string;
    const titleJapanese = formData.get("titleJapanese") as string;

    if (!file || !title || !level) {
      return NextResponse.json(
        { error: "file, title and level are required" },
        { status: 400 }
      );
    }

    // Validate file size (max 20 MB)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "PDF file must be under 20 MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Run Cloudinary upload and PDF extraction IN PARALLEL to save time
    const [cloudinaryResult, pages, dictWords] = await Promise.all([
      uploadBuffer(buffer, "books/pdfs", "raw"),
      extractPagesFromBuffer(buffer),
      DictionaryWord.find({}).select("japanese_word _id").lean(),
    ]);

    const pdfUrl = cloudinaryResult.url;
    const dictMap = new Map(dictWords.map((w) => [w.japanese_word, w._id.toString()]));

    // 2. Create Book document
    const book = await Book.create({
      title,
      titleJapanese: titleJapanese || "",
      level,
      description: description || "",
      pdfUrl,
      totalPages: pages.length,
    });

    // 3. Create Page documents with tokenized sentences
    const pageDocs = pages.map((pageData) => ({
      bookId: book._id,
      pageNumber: pageData.pageNumber,
      rawText: pageData.rawText,
      sentences: pageData.sentences.map((sentence) => {
        const words = simpleTokenize(sentence).map((surface) => ({
          surface,
          dictionaryRef: dictMap.get(surface) || undefined,
        }));
        return { text: sentence, words };
      }),
    }));

    await Page.insertMany(pageDocs);

    return NextResponse.json({
      success: true,
      bookId: book._id.toString(),
      totalPages: pages.length,
    });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
