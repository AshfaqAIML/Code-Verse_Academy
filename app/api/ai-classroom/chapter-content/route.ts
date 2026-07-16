import { NextRequest, NextResponse } from "next/server";
import { getLibraryChapter } from "@/lib/books";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const book = searchParams.get("book");
  const chapter = searchParams.get("chapter");

  if (!book || !chapter) {
    return NextResponse.json({ error: "Missing book or chapter param" }, { status: 400 });
  }

  const result = getLibraryChapter(book, chapter);
  if (!result) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  return NextResponse.json({
    chapter: result.chapter,
    previous: result.previous ? { number: result.previous.number, slug: result.previous.slug, title: result.previous.title } : null,
    next: result.next ? { number: result.next.number, slug: result.next.slug, title: result.next.title } : null,
  });
}
