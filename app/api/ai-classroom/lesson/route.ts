import { NextRequest, NextResponse } from "next/server";
import { generateLesson } from "@/lib/ai-classroom/lesson-generator";
import type { ProviderId } from "@/lib/ai-classroom/providers";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { topic, provider } = body;

  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return NextResponse.json({ error: "Missing or invalid topic" }, { status: 400 });
  }

  try {
    const lesson = await generateLesson(topic.trim(), provider as ProviderId | undefined);
    return NextResponse.json({ lesson });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
