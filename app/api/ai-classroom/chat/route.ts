import { NextRequest } from "next/server";
import { streamAI } from "@/lib/ai-classroom/llm";
import { runMultiAgentDiscussion } from "@/lib/ai-classroom/orchestration/director";
import type { SSEEvent } from "@/lib/ai-classroom/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { agentId, message, history, topic, chapterContent, agentIds, provider } = body;

  const encoder = new TextEncoder();

  if (agentIds && Array.isArray(agentIds) && agentIds.length > 1) {
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const gen = runMultiAgentDiscussion({
            agentIds,
            history: history ?? [],
            topic,
            chapterContent,
            userMessage: message,
          });
          for await (const event of gen) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (error) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", data: { message: String(error) } })}\n\n`),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  if (!agentId || !message) {
    return new Response("Missing agentId or message", { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const gen = streamAI({
          agentId,
          message,
          history: history ?? [],
          topic,
          chapterContent,
          provider: provider ?? undefined,
        });
        for await (const chunk of gen) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text_delta", data: { content: chunk } })}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", data: { message: String(error) } })}\n\n`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
