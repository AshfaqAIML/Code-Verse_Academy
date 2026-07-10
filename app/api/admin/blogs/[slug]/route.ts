import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Blog } from "@/lib/models/Blog";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { slug } = await params;
  await connectDB();
  const blog = await Blog.findOne({ slug }).lean();
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
    await connectDB();

    const wordCount = body.blocks?.reduce?.((acc: number, b: { text: string }) => acc + (b.text?.split(/\s+/).length ?? 0), 0) ?? 0;

    const blog = await Blog.findOneAndUpdate(
      { slug },
      { $set: { ...body, wordCount, readingTime: Math.ceil(wordCount / 200) } },
      { new: true, runValidators: true }
    ).lean();

    if (!blog) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ blog });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { slug } = await params;
  await connectDB();
  const blog = await Blog.findOneAndDelete({ slug }).lean();
  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
