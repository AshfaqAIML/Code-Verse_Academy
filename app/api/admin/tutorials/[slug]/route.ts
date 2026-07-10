import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Tutorial } from "@/lib/models/Tutorial";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { slug } = await params;
  await connectDB();
  const tutorial = await Tutorial.findOne({ slug }).lean();
  if (!tutorial) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ tutorial });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { slug } = await params;
    const body = await request.json();
    await connectDB();

    const tutorial = await Tutorial.findOneAndUpdate(
      { slug },
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!tutorial) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ tutorial });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { slug } = await params;
  await connectDB();
  const tutorial = await Tutorial.findOneAndDelete({ slug }).lean();
  if (!tutorial) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
