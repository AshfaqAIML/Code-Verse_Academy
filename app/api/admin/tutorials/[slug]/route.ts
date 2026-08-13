import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { readCollection, upsertOne, deleteOne, findOne } from "@/lib/file-store";
import { parseAdminBody, validateSlug, validateString } from "@/lib/api-validation";
import { adminWriteLimit } from "@/lib/request-rate-limit";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { slug } = await params;
  const tutorials = await readCollection("tutorials");
  const tutorial = tutorials.find((t) => (t as { slug: string }).slug === slug) ?? null;
  if (!tutorial) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ tutorial });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const writeLimit = adminWriteLimit(request);
  if (writeLimit) return writeLimit;

  try {
    const { slug } = await params;
    const parsed = await parseAdminBody(request);
    if (!parsed.ok) return parsed.error;

    if (parsed.body.title !== undefined && !validateString(parsed.body.title)) {
      return NextResponse.json({ error: "Title must be a non-empty string" }, { status: 400 });
    }

    const tutorial = await upsertOne("tutorials", { ...parsed.body, slug });
    return NextResponse.json({ tutorial });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const writeLimit = adminWriteLimit(request);
  if (writeLimit) return writeLimit;

  const { slug } = await params;
  const deleted = await deleteOne("tutorials", slug);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
