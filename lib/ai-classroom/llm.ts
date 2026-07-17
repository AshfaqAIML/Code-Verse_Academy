import { streamText, generateText } from "ai";
import type { ModelMessage } from "ai";
import { getProviderConfig, createLanguageModel } from "./providers";
import type { ProviderId } from "./providers";
import type { ChatRequest } from "./types";
import { getAgent } from "./agents";

function getModel(provider?: ProviderId) {
  const config = getProviderConfig(provider);
  if (!config.apiKey) return null;
  return { model: createLanguageModel(config), config };
}

function buildMessages(request: ChatRequest): ModelMessage[] {
  const agent = getAgent(request.agentId);
  const messages: ModelMessage[] = [];

  messages.push({
    role: "system",
    content: [
      `You are ${agent.name}, an AI ${agent.role} at CodeVerse Academy.`,
      agent.persona,
      request.topic ? `The current topic is: ${request.topic}` : "",
      request.chapterContent ? `Here is the lesson content for context:\n\n${request.chapterContent}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
  });

  if (request.history?.length) {
    for (const msg of request.history) {
      if (msg.agentId === "user" || msg.role === "classmate") {
        messages.push({ role: "user", content: msg.content });
      } else {
        messages.push({ role: "assistant", content: msg.content });
      }
    }
  }

  messages.push({ role: "user", content: request.message });

  return messages;
}

export async function* streamAI(
  request: ChatRequest,
): AsyncGenerator<string> {
  const resolved = getModel(request.provider);
  if (!resolved) {
    yield "AI response requires an API key. Please set OPENAI_API_KEY (or ANTHROPIC_API_KEY / GOOGLE_API_KEY / DEEPSEEK_API_KEY) in your environment.";
    return;
  }

  const result = streamText({
    model: resolved.model,
    messages: buildMessages(request),
    temperature: 0.7,
    maxOutputTokens: 4096,
  });

  for await (const chunk of result.textStream) {
    yield chunk;
  }
}

export async function callAI(request: ChatRequest): Promise<string> {
  let full = "";
  for await (const chunk of streamAI(request)) {
    full += chunk;
  }
  return full;
}

export { getProviderConfig, createLanguageModel };
