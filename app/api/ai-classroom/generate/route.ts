import { NextRequest, NextResponse } from "next/server";
import { createLanguageModel, getProviderConfig } from "@/lib/ai-classroom/providers";
import { generateQuizContent, generateFlashcards } from "@/lib/ai-classroom/generation/content-generator";
import { generateOutlines } from "@/lib/ai-classroom/generation/outline-generator";
import type { ProviderId } from "@/lib/ai-classroom/providers";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, chapterContent, chapterTitle, count, provider } = body;

  if (!chapterContent || !type) {
    return NextResponse.json({ error: "Missing chapterContent or type" }, { status: 400 });
  }

  const config = getProviderConfig(provider as ProviderId);
  if (!config.apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 401 });
  }

  try {
    const model = createLanguageModel(config);

    const aiCall = async (system: string, user: string) => {
      const { generateText } = await import("ai");
      const result = await generateText({ model, system, prompt: user, temperature: 0.7 });
      return result.text || "";
    };

    switch (type) {
      case "outlines": {
        const result = await generateOutlines(chapterContent, chapterTitle, aiCall);
        return NextResponse.json(result);
      }
      case "quiz": {
        const result = await generateQuizContent(
          chapterTitle,
          body.keyPoints || [],
          chapterContent,
          aiCall,
          count || 5,
        );
        return NextResponse.json(result);
      }
      case "flashcard": {
        const result = await generateFlashcards(
          chapterTitle,
          body.keyPoints || [],
          chapterContent,
          aiCall,
          count || 10,
        );
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
