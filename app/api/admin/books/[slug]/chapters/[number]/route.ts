import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ChapterEdit } from "@/lib/models/ChapterEdit";
import { requireAdmin } from "@/lib/admin-auth";

type RouteParams = Promise<{ slug: string; number: string }>;

export async function PUT(request: NextRequest, { params }: { params: RouteParams }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { slug, number } = await params;
  const chapterNumber = parseInt(number);
  if (isNaN(chapterNumber)) return NextResponse.json({ error: "Invalid chapter number" }, { status: 400 });

  const body = await request.json();
  if (!Array.isArray(body.blocks)) return NextResponse.json({ error: "blocks must be an array" }, { status: 400 });

  await connectDB();

  await ChapterEdit.findOneAndUpdate(
    { bookSlug: slug, chapterNumber },
    { bookSlug: slug, chapterNumber, blocks: body.blocks },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest, { params }: { params: RouteParams }) {
  const { slug, number } = await params;
  const chapterNumber = parseInt(number);
  if (isNaN(chapterNumber)) return NextResponse.json({ error: "Invalid chapter number" }, { status: 400 });

  await connectDB();
  const edit = await ChapterEdit.findOne({ bookSlug: slug, chapterNumber });

  return NextResponse.json({
    edited: !!edit,
    blocks: edit?.blocks ?? null,
  });
}
