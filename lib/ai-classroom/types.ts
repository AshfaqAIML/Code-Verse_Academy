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
};
