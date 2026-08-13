import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { readCollection, upsertOne, deleteOne } from "@/lib/file-store";
import { parseAdminBody, validateString } from "@/lib/api-validation";

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
    const parsed = await parseAdminBody(request);
    if (!parsed.ok) return parsed.error;

    if (parsed.body.title !== undefined && !validateString(parsed.body.title)) {
      return NextResponse.json({ error: "Title must be a non-empty string" }, { status: 400 });
    }

    const blocks = Array.isArray(parsed.body.blocks)
      ? (parsed.body.blocks as unknown as Array<{ text?: string }>)
      : [];
    const wordCount = blocks.reduce((acc, b) => acc + (b.text?.split(/\s+/).length ?? 0), 0);
    const blog = await upsertOne("blogs", { ...parsed.body, slug, wordCount, readingTime: Math.ceil(wordCount / 200) });
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
