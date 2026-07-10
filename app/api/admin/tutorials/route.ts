import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Tutorial } from "@/lib/models/Tutorial";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  await connectDB();
  const tutorials = await Tutorial.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ tutorials });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    await connectDB();

    const existing = await Tutorial.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json({ error: "A tutorial with this slug already exists" }, { status: 409 });
    }

    const tutorial = await Tutorial.create(body);
    return NextResponse.json({ tutorial }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
