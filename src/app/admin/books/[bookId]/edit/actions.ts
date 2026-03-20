"use server";

import { connectDB } from "@/lib/db/mongoose";
import Book from "@/lib/db/models/Book";
import Page from "@/lib/db/models/Page";
import { redirect } from "next/navigation";
import { BookLevel } from "@/types";

function tokenise(text: string): string[] {
  if (text.includes(" ")) return text.split(/\s+/).filter(Boolean);

  const tokens: string[] = [];
  let buf = "";
  const isJapanese = (c: string) => /[\u3040-\u30FF\u4E00-\u9FFF]/.test(c);

  for (const ch of text) {
    if (isJapanese(ch) || /[a-zA-ZÀ-ÖØ-öø-ÿ0-9]/.test(ch)) {
      buf += ch;
    } else {
      if (buf) { tokens.push(buf); buf = ""; }
      if (ch.trim()) tokens.push(ch);
    }
  }
  if (buf) tokens.push(buf);
  return tokens.filter(Boolean);
}

function splitSentences(raw: string): string[] {
  return raw
    .split(/(?<=[。！？!?\n])/)
    .flatMap((s) => s.split("\n"))
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function updateTextBook(bookId: string, formData: FormData) {
  const title         = (formData.get("title") as string | null)?.trim() || "";
  const titleJapanese = (formData.get("titleJapanese") as string | null)?.trim() || "";
  const level         = (formData.get("level") as BookLevel) || "beginner";
  const description   = (formData.get("description") as string | null)?.trim() || "";
  const pagesRaw      = formData.getAll("page") as string[];

  if (!title) throw new Error("Title is required");
  if (pagesRaw.length === 0 || !pagesRaw[0]?.trim()) throw new Error("At least one page of text is required");

  await connectDB();

  const nonEmpty = pagesRaw.filter((p) => p.trim());

  await Book.findByIdAndUpdate(bookId, {
    title,
    titleJapanese: titleJapanese || undefined,
    level,
    description: description || undefined,
    totalPages: nonEmpty.length,
  });

  // Replace all pages
  await Page.deleteMany({ bookId });

  const pageDocs = nonEmpty.map((rawText, idx) => {
    const sentenceTexts = splitSentences(rawText);
    const sentences = sentenceTexts.map((text) => ({
      text,
      words: tokenise(text).map((surface) => ({ surface })),
    }));
    return {
      bookId,
      pageNumber: idx + 1,
      rawText,
      sentences,
    };
  });

  await Page.insertMany(pageDocs);

  redirect("/admin/books");
}
