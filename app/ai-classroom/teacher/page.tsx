import type { Metadata } from "next";
import { AgentPage } from "@/components/ai-classroom/agent-page";

export const metadata: Metadata = {
  title: "AI Teacher | CodeVerse Academy",
  description: "Get step-by-step explanations from your AI teacher with examples, analogies, and code snippets.",
};

export default function AITeacherPage() {
  return <AgentPage agentId="teacher" />;
}
