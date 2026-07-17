export type AgentRole = "teacher" | "assistant" | "interviewer" | "classmate";

export type AgentConfig = {
  id: string;
  name: string;
  role: AgentRole;
  persona: string;
  color: string;
  icon: string;
};

export type ChatMessage = {
  id: string;
  agentId: string;
  role: AgentRole;
  agentName: string;
  content: string;
  timestamp: number;
};

export type ChatRequest = {
  agentId: string;
  message: string;
  history: ChatMessage[];
  topic?: string;
  chapterContent?: string;
  provider?: import("./providers").ProviderId;
};

export type SSEEvent =
  | { type: "thinking"; data: { stage: string; agentId?: string } }
  | { type: "agent_start"; data: { messageId: string; agentId: string; agentName: string; agentColor: string } }
  | { type: "text_delta"; data: { content: string; messageId: string } }
  | { type: "agent_end"; data: { messageId: string; agentId: string } }
  | { type: "cue_user"; data: { fromAgentId?: string } }
  | { type: "error"; data: { message: string } };

export type DirectorState = {
  turnCount: number;
  currentAgentId: string | null;
  agentResponses: { agentId: string; agentName: string; contentPreview: string }[];
};
