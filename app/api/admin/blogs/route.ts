import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { readCollection, upsertOne } from "@/lib/file-store";
import blogData from "@/data/blogs.json";
import { parseAdminBody, validateSlug, validateString } from "@/lib/api-validation";
import { adminWriteLimit } from "@/lib/request-rate-limit";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const blogs = await readCollection("blogs");
  if (blogs.length === 0) {
    return NextResponse.json({ blogs: blogData.articles.map((a) => ({ ...a, published: true })) });
  }
  return NextResponse.json({ blogs });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const writeLimit = adminWriteLimit(request);
  if (writeLimit) return writeLimit;

  try {
    const parsed = await parseAdminBody(request);
    if (!parsed.ok) return parsed.error;

    const slug = validateSlug(parsed.body.slug);
    if (!slug || !validateString(parsed.body.title)) {
      return NextResponse.json({ error: "A valid slug and title are required" }, { status: 400 });
    }

    const existing = (await readCollection("blogs")).find((b) => (b as { slug: string }).slug === slug);
    if (existing) {
      return NextResponse.json({ error: "A blog with this slug already exists" }, { status: 409 });
    }
    const blocks = Array.isArray(parsed.body.blocks)
      ? (parsed.body.blocks as unknown as Array<{ text?: string }>)
      : [];
    const wordCount = blocks.reduce((acc, b) => acc + (b.text?.split(/\s+/).length ?? 0), 0);
    const blog = await upsertOne("blogs", { ...parsed.body, slug, wordCount, readingTime: Math.ceil(wordCount / 200) });
    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
