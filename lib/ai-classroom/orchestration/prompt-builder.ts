import type { AgentConfig, ChatMessage, SSEEvent } from "../types";

export function buildMultiAgentSystemPrompt(
  agent: AgentConfig,
  allAgents: AgentConfig[],
  recentMessages: ChatMessage[],
  topic?: string,
  chapterContent?: string,
): string {
  const peerList = allAgents
    .filter((a) => a.id !== agent.id)
    .map((a) => `- ${a.name} (${a.role}): ${a.persona.split(".")[0]}.`)
    .join("\n");

  const recentContext = recentMessages
    .slice(-6)
    .map((m) => `[${m.agentName}]: ${m.content.slice(0, 200)}`)
    .join("\n");

  return [
    `You are ${agent.name}, an AI ${agent.role} at CodeVerse Academy.`,
    agent.persona,
    "",
    topic ? `Current topic: ${topic}` : "",
    chapterContent ? `Lesson context:\n${chapterContent.slice(0, 2000)}` : "",
    "",
    "## Other participants in this discussion:",
    peerList || "You are the only AI here.",
    "",
    "## Recent conversation:",
    recentContext || "No prior discussion.",
    "",
    agent.role === "teacher"
      ? "You lead the discussion. Keep responses concise (2-3 sentences). Ask questions to engage others."
      : agent.role === "classmate"
        ? "Keep responses VERY short (1-2 sentences). React naturally, ask questions, share observations."
        : "Keep responses concise. Support the discussion.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildDirectorPrompt(
  agents: AgentConfig[],
  turnCount: number,
  recentMessages: ChatMessage[],
  topic?: string,
): string {
  const agentList = agents
    .map((a) => `- ${a.id}: ${a.name} (${a.role})`)
    .join("\n");

  const recent = recentMessages
    .slice(-4)
    .map((m) => `[${m.agentName}]: ${m.content.slice(0, 100)}`)
    .join("\n");

  return [
    "You are the discussion director. Decide who should speak next.",
    "",
    topic ? `Topic: ${topic}` : "",
    "",
    "Available agents:",
    agentList,
    "",
    "Recent discussion:",
    recent || "No prior discussion.",
    "",
    "Rules:",
    "- If no one has spoken yet, pick the teacher to start.",
    "- If someone just spoke, pick someone else for variety.",
    "- If all agents have contributed, cue the USER by responding with: next_agent: \"USER\"",
    "- If the discussion is complete, respond with: next_agent: \"END\"",
    "",
    'Respond with JSON: { "next_agent": "<agent_id | USER | END>", "reason": "<brief reason>" }',
  ]
    .filter(Boolean)
    .join("\n");
}

export function parseDirectorResponse(content: string): {
  nextAgent: string;
  reason: string;
} {
  try {
    const jsonMatch = content.match(/\{[\s\S]*?"next_agent"[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        nextAgent: parsed.next_agent || "END",
        reason: parsed.reason || "",
      };
    }
  } catch {}
  return { nextAgent: "END", reason: "Failed to parse" };
}
