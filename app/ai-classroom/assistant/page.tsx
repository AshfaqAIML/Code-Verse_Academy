import type { Metadata } from "next";
import { AgentPage } from "@/components/ai-classroom/agent-page";

export const metadata: Metadata = {
  title: "AI Assistant | CodeVerse Academy",
  description: "Get simplified explanations, hints, and summaries from your AI teaching assistant.",
};

export default function AIAssistantPage() {
  return <AgentPage agentId="assistant" />;
}
