import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Blog } from "@/lib/models/Blog";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  await connectDB();
  const blogs = await Blog.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ blogs });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    await connectDB();

    const existing = await Blog.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json({ error: "A blog with this slug already exists" }, { status: 409 });
    }

    const blog = await Blog.create({
      ...body,
      wordCount: body.blocks?.reduce?.((acc: number, b: { text: string }) => acc + (b.text?.split(/\s+/).length ?? 0), 0) ?? 0,
      readingTime: Math.ceil((body.blocks?.reduce?.((acc: number, b: { text: string }) => acc + (b.text?.split(/\s+/).length ?? 0), 0) ?? 0) / 200),
    });
    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
