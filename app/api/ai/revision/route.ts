import { NextResponse } from "next/server";
import { generateRevisionSummary } from "@/lib/revision/agent";
import { buildRevisionPrompt } from "@/lib/revision/prompts";
import { RevisionRequest } from "@/lib/revision/types";
import { getAuthUserFromRequest } from "@/lib/auth";
import { takeRateLimit } from "@/lib/request-rate-limit";

export async function POST(request: Request) {
  const user = getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const limit = takeRateLimit(`revision:${user.email}`, 12, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many revision requests. Please wait before generating another summary." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const body = (await request.json().catch(() => null)) as RevisionRequest | null;

  if (!body?.topic || !body?.chapterTitle || !body?.content) {
    return NextResponse.json({ error: "topic, chapterTitle and content are required" }, { status: 400 });
  }
  if (body.topic.length > 180 || body.chapterTitle.length > 240 || body.content.length > 24_000) {
    return NextResponse.json({ error: "Revision request is too large." }, { status: 413 });
  }

  const summary = generateRevisionSummary(body);

  return NextResponse.json({
    summary,
    agent: {
      provider: process.env.OPENAI_API_KEY ? "openai-ready" : "local-deterministic-agent",
      promptPreview: buildRevisionPrompt(body).slice(0, 1200)
    }
  });
}
