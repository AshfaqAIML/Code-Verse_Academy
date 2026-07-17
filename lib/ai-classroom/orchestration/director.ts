import { generateText } from "ai";
import { createLanguageModel, getProviderConfig } from "../providers";
import { getAgent, agents } from "../agents";
import type { AgentConfig, ChatMessage, SSEEvent, DirectorState } from "../types";
import { buildMultiAgentSystemPrompt, buildDirectorPrompt, parseDirectorResponse } from "./prompt-builder";

export interface MultiAgentRequest {
  agentIds: string[];
  history: ChatMessage[];
  topic?: string;
  chapterContent?: string;
  userMessage?: string;
}

export async function* runMultiAgentDiscussion(
  request: MultiAgentRequest,
): AsyncGenerator<SSEEvent> {
  const resolved = getProviderConfig();
  if (!resolved.apiKey) {
    yield { type: "error", data: { message: "No API key configured." } };
    return;
  }

  const model = createLanguageModel(resolved);
  const availableAgents: AgentConfig[] = request.agentIds
    .map((id) => getAgent(id))
    .filter(Boolean);
  const directorState: DirectorState = {
    turnCount: 0,
    currentAgentId: null,
    agentResponses: [],
  };

  for (let turn = 0; turn < 8; turn++) {
    const directorPrompt = buildDirectorPrompt(
      availableAgents,
      directorState.turnCount,
      request.history,
    );

    let decision: { nextAgent: string; reason: string };
    if (directorState.turnCount === 0 && request.userMessage) {
      decision = { nextAgent: availableAgents[0]?.id || "END", reason: "First turn" };
    } else {
      try {
        const result = await generateText({
          model,
          system: directorPrompt,
          prompt: "Who should speak next?",
          temperature: 0.3,
        });
        decision = parseDirectorResponse(result.text);
      } catch {
        decision = { nextAgent: "END", reason: "Error" };
      }
    }

    if (decision.nextAgent === "END" || decision.nextAgent === "USER") {
      yield { type: "cue_user", data: { fromAgentId: directorState.currentAgentId ?? undefined } };
      break;
    }

    const nextAgent = availableAgents.find((a) => a.id === decision.nextAgent);
    if (!nextAgent) {
      yield { type: "cue_user", data: {} };
      break;
    }

    directorState.currentAgentId = nextAgent.id;
    yield { type: "thinking", data: { stage: "agent_loading", agentId: nextAgent.id } };

    const messageId = `agent-${nextAgent.id}-${Date.now()}`;
    yield {
      type: "agent_start",
      data: { messageId, agentId: nextAgent.id, agentName: nextAgent.name, agentColor: nextAgent.color },
    };

    const systemPrompt = buildMultiAgentSystemPrompt(
      nextAgent,
      availableAgents,
      request.history,
      request.topic,
      request.chapterContent,
    );

    const chatMessages = request.history.map((m) => ({
      role: (m.agentId === "user" ? "user" : "assistant") as "user" | "assistant",
      content: `[${m.agentName}]: ${m.content}`,
    }));

    if (request.userMessage && turn === 0) {
      chatMessages.push({ role: "user", content: request.userMessage });
    }

    let fullText = "";
    try {
      const result = generateText({
        model,
        system: systemPrompt,
        messages: chatMessages,
        temperature: 0.7,
        maxOutputTokens: 1024,
      });

      const response = await result;
      const text = response.text || "";

      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      for (const sentence of sentences) {
        if (!sentence.trim()) continue;
        fullText += sentence;
        yield { type: "text_delta", data: { content: sentence, messageId } };
      }
    } catch {
      yield { type: "text_delta", data: { content: "I need a moment to think about that.", messageId } };
    }

    yield { type: "agent_end", data: { messageId, agentId: nextAgent.id } };

    request.history.push({
      id: messageId,
      agentId: nextAgent.id,
      role: nextAgent.role,
      agentName: nextAgent.name,
      content: fullText,
      timestamp: Date.now(),
    });

    directorState.turnCount++;
    directorState.agentResponses.push({
      agentId: nextAgent.id,
      agentName: nextAgent.name,
      contentPreview: fullText.slice(0, 100),
    });
  }
}
