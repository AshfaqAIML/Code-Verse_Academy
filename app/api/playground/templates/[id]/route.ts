import { NextResponse } from "next/server";
import { getPlaygroundTemplate } from "@/lib/playground-templates";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = getPlaygroundTemplate(id);
  if (!template) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(template);
}
