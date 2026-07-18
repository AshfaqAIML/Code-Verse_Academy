import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { readCollection, upsertOne, deleteOne } from "@/lib/file-store";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { slug } = await params;
  const blogs = await readCollection("blogs");
  const blog = blogs.find((b) => (b as { slug: string }).slug === slug) ?? null;
  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ blog });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { slug } = await params;
    const body = await request.json();
    const wordCount = body.blocks?.reduce?.((acc: number, b: { text: string }) => acc + (b.text?.split(/\s+/).length ?? 0), 0) ?? 0;
    const blog = await upsertOne("blogs", { ...body, slug, wordCount, readingTime: Math.ceil(wordCount / 200) });
    return NextResponse.json({ blog });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { slug } = await params;
  const deleted = await deleteOne("blogs", slug);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
