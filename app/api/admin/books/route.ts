import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getLibraryBooks, getLibraryBook } from "@/lib/books";
import { connectDB } from "@/lib/db";
import { Book } from "@/lib/models/Book";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const books = getLibraryBooks();
    return NextResponse.json({ books });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    if (body.action !== "migrate") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await connectDB();
    const books = getLibraryBooks();
    let imported = 0;

    for (const summary of books) {
      const fullBook = getLibraryBook(summary.slug);
      if (!fullBook) continue;
      await Book.findOneAndUpdate(
        { slug: summary.slug },
        { $set: fullBook },
        { upsert: true, new: true }
      );
      imported++;
    }

    return NextResponse.json({ success: true, imported });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
