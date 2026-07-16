import type { Metadata } from "next";
import { AgentPage } from "@/components/ai-classroom/agent-page";

export const metadata: Metadata = {
  title: "AI Interviewer | CodeVerse Academy",
  description: "Practice mock interviews with realistic questions, scoring, and feedback.",
};

export default function AIInterviewerPage() {
  return <AgentPage agentId="interviewer" />;
}
