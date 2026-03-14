"use server";

import { connectDB } from "@/lib/db/mongoose";
import Book from "@/lib/db/models/Book";
import Page from "@/lib/db/models/Page";
import { revalidatePath } from "next/cache";

export async function deleteBook(bookId: string) {
  await connectDB();
  await Promise.all([Book.findByIdAndDelete(bookId), Page.deleteMany({ bookId })]);
  revalidatePath("/admin/books");
}
