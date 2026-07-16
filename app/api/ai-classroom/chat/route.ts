import { NextRequest } from "next/server";
import { streamAI } from "@/lib/ai-classroom/llm";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { agentId, message, history, topic } = body;

  if (!agentId || !message) {
    return new Response("Missing agentId or message", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const gen = streamAI({ agentId, message, history: history ?? [], topic });
        for await (const chunk of gen) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(error) })}\n\n`));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}
