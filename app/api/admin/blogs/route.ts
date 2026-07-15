import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { readCollection, upsertOne } from "@/lib/file-store";
import blogData from "@/data/blogs.json";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const blogs = readCollection("blogs");
  if (blogs.length === 0) {
    return NextResponse.json({ blogs: blogData.articles.map((a) => ({ ...a, published: true })) });
  }
  return NextResponse.json({ blogs });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const existing = readCollection("blogs").find((b) => (b as { slug: string }).slug === body.slug);
    if (existing) {
      return NextResponse.json({ error: "A blog with this slug already exists" }, { status: 409 });
    }
    const wordCount = body.blocks?.reduce?.((acc: number, b: { text: string }) => acc + (b.text?.split(/\s+/).length ?? 0), 0) ?? 0;
    const blog = upsertOne("blogs", { ...body, wordCount, readingTime: Math.ceil(wordCount / 200) });
    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
