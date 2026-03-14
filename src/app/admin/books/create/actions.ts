"use server";

import { connectDB } from "@/lib/db/mongoose";
import Book from "@/lib/db/models/Book";
import Page from "@/lib/db/models/Page";
import { redirect } from "next/navigation";
import { BookLevel } from "@/types";

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Split a Japanese/mixed string into word-like tokens.
 * Rules:
 *   - If the string has spaces → split on spaces
 *   - Otherwise group consecutive kanji/kana chars into one token,
 *     and keep latin words / punctuation as separate tokens.
 */
function tokenise(text: string): string[] {
  if (text.includes(" ")) return text.split(/\s+/).filter(Boolean);

  const tokens: string[] = [];
  let buf = "";
  // Unicode ranges: hiragana 3040-309F, katakana 30A0-30FF, CJK 4E00-9FFF
  const isJapanese = (c: string) => /[\u3040-\u30FF\u4E00-\u9FFF]/.test(c);

  for (const ch of text) {
    if (isJapanese(ch) || /[a-zA-ZÀ-ÖØ-öø-ÿ0-9]/.test(ch)) {
      buf += ch;
    } else {
      if (buf) { tokens.push(buf); buf = ""; }
      if (ch.trim()) tokens.push(ch); // keep punctuation as own token
    }
  }
  if (buf) tokens.push(buf);
  return tokens.filter(Boolean);
}

/**
 * Split raw text block into sentences at Japanese/English sentence endings.
 * Each non-empty line also becomes its own sentence.
 */
function splitSentences(raw: string): string[] {
  return raw
    .split(/(?<=[。！？!?\n])/)
    .flatMap((s) => s.split("\n"))
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── action ────────────────────────────────────────────────────────────────────

export async function createTextBook(formData: FormData) {
  const title          = (formData.get("title") as string | null)?.trim() || "";
  const titleJapanese  = (formData.get("titleJapanese") as string | null)?.trim() || "";
  const level          = (formData.get("level") as BookLevel) || "beginner";
  const description    = (formData.get("description") as string | null)?.trim() || "";
  const pagesRaw       = formData.getAll("page") as string[]; // one entry per page textarea

  if (!title) throw new Error("Title is required");
  if (pagesRaw.length === 0 || !pagesRaw[0]?.trim()) throw new Error("At least one page of text is required");

  await connectDB();

  // 1. Create the Book
  const book = await Book.create({
    title,
    titleJapanese: titleJapanese || undefined,
    level,
    description: description || undefined,
    totalPages: pagesRaw.filter((p) => p.trim()).length,
    isPublished: true,
  });

  // 2. Create a Page document for each non-empty page textarea
  const nonEmpty = pagesRaw.filter((p) => p.trim());
  const pageDocs = nonEmpty.map((rawText, idx) => {
    const sentenceTexts = splitSentences(rawText);
    const sentences = sentenceTexts.map((text) => ({
      text,
      words: tokenise(text).map((surface) => ({ surface })),
    }));
    return {
      bookId: book._id,
      pageNumber: idx + 1,
      rawText,
      sentences,
    };
  });

  await Page.insertMany(pageDocs);

  redirect("/admin/books");
}
